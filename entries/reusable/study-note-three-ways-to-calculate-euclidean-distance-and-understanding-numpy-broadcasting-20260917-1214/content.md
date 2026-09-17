## Description

I got stuck on one line in the kNN assignment: `X_test[i, :] - X_train`. Left side is a vector,
right side is a matrix. My linear algebra brain flagged it immediately — vector minus matrix isn't
even a defined operation, that's not a thing you're allowed to write down. So why does NumPy just...
run it?

I shrunk it down as far as I could: a `(1,2)` vector minus a `(2,2)` matrix.

```python
>>> np.array([1, 2]) - np.array([[3, 4], [5, 6]])
array([[-2, -2],
       [-4, -4]])
```

NumPy doesn't complain, and it gives back a `(2,2)` matrix. At first this just looked like NumPy
being loose about rules. But then I thought about what a matrix actually *is* — it's a stack of row
vectors. `[[3,4],[5,6]]` is really "vector `(3,4)`" and "vector `(5,6)`" stacked on top of each
other. If that's true, then `v - M` should just mean: give me `v - row1` and `v - row2`, stacked the
same way it came in. And that's exactly what came out: row 0 is `(1,2)-(3,4)=(-2,-2)`, row 1 is
`(1,2)-(5,6)=(-4,-4)`.

That's the reframe that unstuck me: this isn't a new linear-algebra rule NumPy invented. It's the
exact same thing I'd get from looping over the matrix's rows and subtracting `v` from each one — one
result vector per row of the matrix, stacked back into a matrix. Which is *literally* the kNN
problem: I want the distance from one test vector to every row (training vector) of a matrix. So
"vector minus matrix" being valid isn't magic, it's just "this vector minus every row, all at once,"
spelled with a shape rule instead of a loop I write myself.

That reframing is what this whole post is really about. Below, I work through the same L2-distance
calculation three ways — two loops, one loop, no loops — using that broadcasting idea, do the Big-O
for each, and then actually benchmark them, because I didn't want to just take "it's faster" on
faith.

## User Guide

**When to read this:** you hit a NumPy shape you can't justify (`(D,)` minus `(N, D)`), or you vectorized something and it got *slower*.

**The three rules to take away:**

1. **A matrix is a stack of row vectors.** `v - M` means "`v` minus every row, stacked" — the same thing a Python loop would give you, spelled as a shape rule.
2. **Shapes align from the right.** A bare `(N,)` array always lines up against the *last* axis. To make it vary along the first axis instead, reshape the leading `1` in yourself: `.reshape(N, 1)`. Get this wrong when `num_test == num_train` and NumPy silently returns wrong numbers with no error.
3. **Big-O is not the speed story.** All four methods below do identical `O(N)` arithmetic. What changes is who executes it — Python-dispatched ufunc calls, or a single BLAS `dgemm` — and how much intermediate memory it allocates first.

**The habit:** before trusting a vectorized expression, write out what each array expands to as a literal full-shape matrix (as in the two worked examples below). If you can't write the expansion, you don't yet know what the expression computes.

**The trap to check for:** if your "fully vectorized" version allocates an `O(num_test · num_train · D)` intermediate, it is probably slower than the naive double loop. Count the intermediate's size before reaching for it.

## Content

### The formula

Every version below computes the same thing — Euclidean (L2) distance between test point $x$ and
training point $y$, each with $D$ features:

$$d(x, y) = \sqrt{\sum_{d=1}^{D} (x_d - y_d)^2}$$

For the full distance matrix: $\text{dists}[i, j] = \sqrt{\sum_d (X_{test}[i,d] - X_{train}[j,d])^2}$.

### 1. Two loops — the direct translation

```python
for i in range(num_test):
    for j in range(num_train):
        dists[i, j] = np.sqrt(np.sum((X[i, :] - X_train[j, :]) ** 2))
```

Every pair `(i, j)` gets its own explicit subtraction. **O(num_test × num_train × D)** work, and
every single one of those operations pays Python loop overhead — that's the part that's slow, not
the math itself.

### 2. One loop — broadcast over the training set

```python
for i in range(num_test):
    dists[i, :] = np.sqrt(np.sum((X[i, :] - X_train) ** 2, axis=1))
```

`X[i, :]` has shape `(D,)`, `X_train` has shape `(num_train, D)`. Broadcasting stretches
`X[i, :]` into `num_train` copies of itself, subtracts elementwise, giving `(num_train, D)`.
`axis=1` then sums across features, collapsing it to `(num_train,)`.

**Big O: O(num_test × num_train × D)** — same total work as two loops (nothing is skipped;
every test/train/feature triple still gets touched once). What changes is *where* the inner two
loops (over training points and over features) run: inside NumPy's compiled C code instead of
Python. One loop's worth of Python-level overhead is removed, which is why it's faster in practice
despite having the same asymptotic complexity.

**Why the result is still correct:** broadcasting never computes a new number — it only *copies*
`X[i, :]` into `num_train` rows first (equivalent to `np.tile(X[i,:], (num_train,1))`), and copying
a value doesn't change it. The subtraction that follows is ordinary same-shape elementwise math.
Same for `axis=1` — reducing an axis just decides *which* numbers get summed together; it doesn't
alter any of them.

**A tiny worked example.** Let `X_train = [[2,3],[5,1],[4,6],[1,4]]` and take test point
`x = X[0,:] = (3,2)`. Broadcasting is exactly `np.tile(x, (4,1))` — copy `x` into 4 rows — then
subtract elementwise:

```
tile(x, (4,1))      X_train           diff            diff ** 2       sum(axis=1)
[[3, 2],           [[2, 3],         [[ 1, -1],       [[1,  1],
 [3, 2],    -       [5, 1],    =     [-2,  1],   →     [4,  1],   →   [2, 5, 17, 8]
 [3, 2],            [4, 6],          [-1, -4],         [1, 16],
 [3, 2]]            [1, 4]]          [ 2, -2]]         [4,  4]]
```

`[2, 5, 17, 8]` are the four squared distances from `x` to every training point, all produced from
one tiled subtraction and one row-sum — no per-pair Python code at all.

### 3. No loops — the algebra trick

Instead of looping, expand the square:

$$\|x-y\|^2 = \|x\|^2 - 2(x\cdot y) + \|y\|^2$$

```python
test_sq  = np.sum(X ** 2, axis=1).reshape(num_test, 1)   # (num_test, 1)
train_sq = np.sum(X_train ** 2, axis=1)                  # (num_train,)
cross    = X.dot(X_train.T)                              # (num_test, num_train)
dists    = np.sqrt(test_sq - 2 * cross + train_sq)
```

- **What does `axis` mean?** `np.sum(A, axis=k)` *collapses* axis `k`, producing a flat 1-D array
  (not literally a "row" or "column" — that's a 2-D idea). For `X_train` shape `(4,2)`: `axis=1`
  collapses the feature axis → one number per training point, shape `(4,)`. `axis=0` collapses the
  point axis → one number per feature, shape `(2,)`. The "row vs column" look only appears later,
  when this 1-D array gets broadcast against a 2-D matrix.
- **What does "right-aligned" mean, precisely?** NumPy compares two shapes starting from the
  *rightmost* dimension and moving left, padding any missing dimension on the left with an implicit
  `1`. Two dimensions match if they're equal or one of them is `1` (which then stretches).
  Target shape here is `dists = (num_test, num_train) = (3,4)`:
  - `train_sq` shape `(4,)` → padded to `(1,4)`. vs `(3,4)`: last dims `4==4` ✓, then `1` stretches
    to `3`. Result: treated as **one row, copied down 3 times** — varies by column (= train index).
    Exactly what we want, no reshape needed.
  - `test_sq` shape `(3,)` → padded to `(1,3)`. vs `(3,4)`: last dims `3` vs `4`, neither equal nor
    `1` → **NumPy raises an error** and refuses to broadcast. (If `num_test` happened to equal
    `num_train`, it wouldn't error — it would silently align as a row instead of a column, giving
    wrong numbers with no warning at all — see the "danger demo" below.)
  - `test_sq.reshape(num_test, 1)` shape `(3,1)` → vs `(3,4)`: last dims `1` stretches to `4`, then
    `3==3` ✓. Result: treated as **one column, copied right 4 times** — varies by row (= test
    index). That's what we need.

  The rule in one line: a bare `(N,)` array always lines up against the *last* axis of whatever
  it's broadcast with — never automatically the first. To make it vary along the first axis
  instead, you must explicitly reshape in that leading `1` yourself.
- **Why doesn't reshape corrupt anything?** Reshape doesn't move or recompute data — it's a
  zero-copy view that only changes how the same underlying numbers are indexed (verifiable with
  `np.shares_memory`). No values are touched, so the identity above still holds exactly.
- The three arrays — `(num_test,1)`, `(num_train,)`, `(num_test,num_train)` — all broadcast
  together into one `(num_test, num_train)` matrix in a single vectorized expression, no explicit
  Python loop at all.

**A tiny worked example.** Same `X_train` as above, plus `X_test = [[3,2],[6,5],[2,6]]`
(shapes: `test_sq` is `(3,1)`, `train_sq` is `(4,)`, `cross` is `(3,4)`). Before broadcasting
combines them, here's what each one expands to as a literal `(3,4)` matrix:

```
test_sq_full  (each ROW repeats that test point's squared norm across all 4 columns)
[[13. 13. 13. 13.]
 [61. 61. 61. 61.]
 [40. 40. 40. 40.]]

train_sq_full (each COLUMN repeats that train point's squared norm down all 3 rows)
[[13. 26. 52. 17.]
 [13. 26. 52. 17.]
 [13. 26. 52. 17.]]

cross (already the full shape — nothing to tile)
[[12. 17. 24. 11.]
 [27. 35. 54. 26.]
 [22. 16. 44. 26.]]

dists_sq = test_sq_full − 2·cross + train_sq_full   (built entirely from three same-shaped matrices)
[[ 2.  5. 17.  8.]
 [20. 17.  5. 26.]
 [ 9. 34.  4.  5.]]
```

Note row 0 of `dists_sq` — `[2, 5, 17, 8]` — matches the one-loop example above exactly, since
`X_test[0]` is the same point `x = (3,2)` in both. Once broadcasting expands `test_sq` and
`train_sq` into full `(3,4)` matrices, the whole formula is just three same-shaped matrices added
elementwise — nothing "illegal" happening, just arithmetic on equally-shaped arrays.

**Big O:** `cross = X.dot(X_train.T)` is a `(num_test, D) × (D, num_train)` matrix multiply —
**O(num_test × num_train × D)** multiply-adds, same total arithmetic as the other two methods.
`test_sq` and `train_sq` are only **O(num_test × D)** and **O(num_train × D)**. So the asymptotic
complexity doesn't drop — it's still the same amount of raw arithmetic. What actually changes is
that this one `O(num_test × num_train × D)` chunk of work is a single BLAS matrix-multiply call
(`dgemm`), which runs highly optimized, cache-blocked, multi-threaded C — not `num_test × num_train`
separate Python-dispatched operations. Same Big-O, drastically smaller constant factor.

### Speed, measured (50 test × 500 train, D=3072, real CIFAR-10 images)

All four methods do the exact same **O(num_test · num_train · D)** arithmetic — call that product
`N` (here `N = 50 × 500 × 3072 = 76,800,000`). So every method's time is really `c · N` for some
constant `c` (time per "triple" touched), and `c` is where all the difference lives:

| Method | Time complexity | Extra memory | Measured time | c = time / N | vs two_loops |
|---|---|---|---|---|---|
| two loops | O(N) | O(1) | 160.0 ms | 2.083 ns | 1x |
| one loop (broadcast) | O(N) | O(D) | 85.7 ms | 1.116 ns | 1.9x |
| **no loops (algebra)** | **O(N)** | **O(num_test·num_train)** | **2.2 ms** | **0.029 ns** | **72x** |
| no loops (`np.linalg.norm` 3D broadcast) | O(N) | **O(N)** | 332.1 ms | 4.324 ns | 0.5x (**slower!**) |

Same Big-O row for all four — the *speedup is entirely a ~72x drop in the constant `c`*, from
routing the O(N) work through a single BLAS `dgemm` call instead of Python-dispatched loop
iterations. The norm-broadcast version has the *worst* constant of all, because its "extra memory"
column isn't O(1)/O(D) like the others — it's O(N) itself: it must allocate and write a full
`(num_test, num_train, D)` array (~614 MB here, ~61 GB at the assignment's real 500×5000 scale)
before `np.linalg.norm` can even start reducing it. That allocation cost is folded into its constant
and makes it slower than even the naive double loop. **Fewer visible loops isn't what makes code
fast — a smaller constant (and smaller intermediate memory) is.**

#### Why is the constant so different if the complexity is the same?

"Same O(N)" just means the *count* of arithmetic operations matches. What differs is who actually
executes that arithmetic, and how many times Python's slow interpreter has to get involved:

| Method | Python-level dispatches | Peak extra memory | Engine executing the O(N) work |
|---|---|---|---|
| two loops | O(num_test·num_train) | O(D) | generic NumPy ufunc, once per pair |
| one loop | O(num_test) | O(num_train·D) | generic NumPy ufunc, once per row |
| **no loops (algebra)** | **O(1)** | O(num_test·num_train) | **BLAS `dgemm`** — cache-blocked, SIMD, multi-threaded |
| no loops (norm broadcast) | O(1) | **O(num_test·num_train·D)** | generic NumPy ufunc, over one huge array |

Two loops pays Python-interpreter overhead on *every single pair* — that's the dominant cost, not
the arithmetic. One loop removes one loop's worth of that overhead. The algebra version removes
essentially all of it (a fixed handful of calls) **and** routes the heavy O(N) multiply through BLAS
instead of a generic ufunc loop — a different, much faster piece of compiled code, not just "no
Python." Norm-broadcast also has zero Python loops, but it still uses the generic (not BLAS) ufunc
path *and* pays an O(N) memory-allocation/bandwidth cost the others avoid — which is why removing
loops alone wasn't enough to make it fast.

### What I'm still fuzzy on

The broadcasting piece finally feels solid — I can trace exactly what shape goes where and why.
What I haven't sorted out yet is row space vs. column space. `cross = X.dot(X_train.T)` is a real
matrix product, and I have a hunch that row-space/column-space language would say something clean
about what each entry of `cross` "is" — probably something like: each entry is the inner product of
a row of `X` with a row of `X_train`, so `cross` lives in some space spanned by those rows. But I
haven't actually sat down and worked out what that buys me, or whether it changes how I should think
about `test_sq - 2*cross + train_sq`. Not the point of this post, but it's the next thing I want to
chase down.

## Relevant Reusables

- pipeline-reusable-building — the note shape and publishing pipeline this entry follows.
- study-note-gradient-descent-user — the other half of the kNN/linear-model math I'm working through.

## Change Logs

- 2026-09-17 — First version. Worked through vector-minus-matrix broadcasting from the kNN assignment, wrote up all three L2-distance implementations with Big-O and worked examples, and benchmarked them (plus a fourth, slower, zero-loop version) on 50x500 CIFAR-10 images.
