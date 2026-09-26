## Description

Derive the gradient of a single-example binary cross-entropy loss for a sigmoid neuron with no bias. The worked example shows each calculus rule, the vector gradient, and one gradient-descent update.
- question-1: how to calculate the gradient of weights with given activation function and loss by hand
	- question-1-3: chain rule of partial derivative of w respect to loss
	- question-1-1: how to calculate the derivative of binary cross-entropy
	- question-1-2: how to calculate the derivative of sigmoid activation 
- question-2: how to calculate them efficiently using vector operation.

## User Guide

For a sigmoid model with binary cross-entropy: compute $z=\mathbf w^\top\mathbf x$, then $\hat y=\sigma(z)$. The weight gradient simplifies to $\nabla_{\mathbf w}\mathcal L=(\hat y-y)\mathbf x$; update with $\mathbf w_{\mathrm{new}}=\mathbf w-\alpha\nabla_{\mathbf w}\mathcal L$. Use the derivation below when you need to show why the simplification works.

## Content

![Given input and weight vectors, sigmoid activation, binary cross-entropy loss, and learning rate](/media/calculating-gradient-descent-20260926-1336-file-20260926133645985.png)

> **Calculus reminder**
> - **Logarithm derivative:** $\frac{d}{dt}\log t=\frac{1}{t}$.
> - **Exponential derivative:** $\frac{d}{dt}e^t=e^t$.
> - **Power rule:** $\frac{d}{dt}t^n=nt^{n-1}$.
> - **Chain rule:** $\frac{d}{dt}f(u(t))=f'(u)\frac{du}{dt}$. A temporary **$u$ substitution** names the inner expression; this is not integration by $u$-substitution.
> - **Sum and constant-multiple rules:** Differentiate terms separately and carry constant factors through.
> - **Partial derivative:** Differentiate with respect to one variable while holding the others fixed.

### 1. Calculate the binary cross-entropy derivative

Treat the label $y$ as constant and differentiate with respect to the prediction $\hat y$:
$$
\mathcal L=-y\log\hat y-(1-y)\log(1-\hat y).
$$
For the first term, the **logarithm derivative** and **constant-multiple rule** give $\frac{\partial}{\partial\hat y}(-y\log\hat y)=-\frac{y}{\hat y}$. For the second, make a temporary **$u$ substitution**: let $u=1-\hat y$. The **chain rule** gives $\frac{d}{d\hat y}\log u=\frac{1}{u}\frac{du}{d\hat y}$, where $\frac{du}{d\hat y}=-1$. The **sum rule** combines the two derivatives:
$$
\frac{\partial\mathcal L}{\partial\hat y}
=-y\frac{1}{\hat y}-(1-y)\frac{1}{1-\hat y}(-1)
=-\frac{y}{\hat y}+\frac{1-y}{1-\hat y}.
$$
Use a common denominator, expand, and cancel:
$$
\frac{\partial\mathcal L}{\partial\hat y}
=\frac{-y(1-\hat y)+\hat y(1-y)}{\hat y(1-\hat y)}
=\frac{-y+y\hat y+\hat y-y\hat y}{\hat y(1-\hat y)}
=\boxed{\frac{\hat y-y}{\hat y(1-\hat y)}}.
$$

### 2. Calculate the sigmoid activation derivative

Write $\hat y=\sigma(z)=(1+e^{-z})^{-1}$. Make a temporary **$u$ substitution**: let $u=1+e^{-z}$. The **exponential derivative** and **chain rule** give $\frac{du}{dz}=-e^{-z}$; then the **power rule** and **chain rule** give
$$
\frac{\partial\hat y}{\partial z}
=-u^{-2}\frac{du}{dz}
=-(1+e^{-z})^{-2}(-e^{-z})
=\frac{e^{-z}}{(1+e^{-z})^2}.
$$
To express this in terms of $\hat y$, subtract the sigmoid from $1$:
$$
1-\hat y
=1-\frac{1}{1+e^{-z}}
=\frac{1+e^{-z}-1}{1+e^{-z}}
=\frac{e^{-z}}{1+e^{-z}}.
$$
Thus,
$$
\boxed{\frac{\partial\hat y}{\partial z}
=\frac{1}{1+e^{-z}}\cdot\frac{e^{-z}}{1+e^{-z}}
=\hat y(1-\hat y)}.
$$

### 3. Calculate $\partial z/\partial\mathbf w$ and combine

With no bias, $z=\mathbf w^\top\mathbf x=\sum_i w_i x_i$. For the **partial derivative** with respect to $w_i$, hold $\mathbf x$ and the other weights fixed. The **sum** and **constant-multiple rules** give $\frac{\partial z}{\partial w_i}=x_i$. Hence $\frac{\partial z}{\partial\mathbf w}=\mathbf x$.

Apply the multivariable chain rule along $\mathbf w\to z\to\hat y\to\mathcal L$:
$$
\frac{\partial\mathcal L}{\partial\mathbf w}
=\frac{\partial\mathcal L}{\partial\hat y}
\frac{\partial\hat y}{\partial z}
\frac{\partial z}{\partial\mathbf w}
=\frac{\hat y-y}{\hat y(1-\hat y)}\,\hat y(1-\hat y)\,\mathbf x
=\boxed{(\hat y-y)\mathbf x}.
$$

### 4. Plug in the numbers

First, $z=0.5(1)-0.5(1)+0.2(0)=0$, so $\hat y=\sigma(0)=\frac{1}{2}$. With $y=1$,
$$
\mathcal L=-\log\left(\frac{1}{2}\right)=\log 2\approx0.6931,
\qquad
\frac{\partial\mathcal L}{\partial\mathbf w}
=\left(\frac{1}{2}-1\right)\begin{bmatrix}1\\1\\0\end{bmatrix}
=\boxed{\begin{bmatrix}-0.5\\-0.5\\0\end{bmatrix}}.
$$
One gradient-descent step with $\alpha=0.1$ yields
$$
\mathbf w_{\mathrm{new}}=\mathbf w-\alpha\nabla_{\mathbf w}\mathcal L
=\begin{bmatrix}0.55\\-0.45\\0.2\end{bmatrix}.
$$

## Relevant Reusables

None yet.

## Change Logs

- 2026-09-26 — Version 1: added a step-by-step sigmoid/BCE gradient derivation and a numerical gradient-descent update.
