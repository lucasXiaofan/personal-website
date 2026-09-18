## Description

{{< countdown target="2026-10-14T00:00:00-04:00" deadline="October 14, 2026 · 00:00 ET" label="30-day Dopamine Control Challenge" note="September 14–October 14, 2026." >}}

{{< heatmap start="2026-09-14" end="2026-10-14" failed="2026-09-14, 2026-09-15" passed="2026-09-16, 2026-09-17" label="Dopamine Control Challenge · daily result" note="Filled from the daily diary: each day's entry carries a line starting Dopamine-Control-Challenge:, and that line's verdict is what colours the square." >}}

{{< language en >}}
A smaller, 30-day challenge supporting my ReferralChallenge: protect my attention so I spend more time learning, building, and moving. The aim is to make room for at least five hours of work in progress each day. “控制多巴胺” is my shorthand for changing my media habits.

The rule that matters most is the simplest one: **video is for study only.** Leisure is reading and podcasts. A missed day is recorded, not hidden — the heatmap above is the honest version of how this is going.
{{< /language >}}

{{< language zh >}}
这是支持 ReferralChallenge 的一个 30 天小挑战：减少随手刷视频，把注意力留给学习、创作和运动，争取每天至少有五小时推进实际工作。“控制多巴胺”在这里指的是管理自己的媒体使用习惯。

最重要的规则其实最简单：**视频只用来学习。** 娱乐只有阅读和播客。失败的日子要记下来，不藏起来——上面的热力图就是这个挑战真实的进度。
{{< /language >}}

## User Guide

{{< language en >}}
Read the rules each morning. Use a seven-minute timer when selecting study videos, then close YouTube. In the evening, check whether I followed the rules and record what I actually worked on.

**Recording a day.** Every diary entry carries one line in this form:

```
Dopamine-Control-Challenge: 2026-09-15 failed, watched over two hours of YouTube and Bilibili.
```

The verdict word goes before the first comma: `success`, `held`, `passed`, `done` all count as held; `failed` or `missed` count as failed. A date or date range may lead the line (`9/14 - 9/15 failed, ...`); with no date it means today.

I do not edit the heatmap by hand. Publishing the day's decision log runs `sync-habits.mjs`, which reads this line and moves the date into the shortcode's `failed=` or `passed=` list. The diary is the single source of truth; the site is a rendering of it.
{{< /language >}}

{{< language zh >}}
每天早上看一遍规则；挑选学习视频时设定七分钟计时器，到时关闭 YouTube。晚上回顾有没有遵守规则，以及当天实际推进了什么。

**如何记录一天。** 每篇日记里写一行：

```
Dopamine-Control-Challenge: 2026-09-15 failed, 看了两个多小时 YouTube 和 B 站。
```

结论词写在第一个逗号之前：`success`、`held`、`passed`、`done` 都算守住；`failed`、`missed` 算失败。行首可以带日期或日期区间（`9/14 - 9/15 failed, ...`）；不写日期就是当天。

热力图不用手改。发布当天的决策日志时会运行 `sync-habits.mjs`，它读这一行，把日期放进 shortcode 的 `failed=` 或 `passed=`。日记是唯一的事实来源，网站只是它的呈现。
{{< /language >}}

## Content

{{< language en >}}
### Rules

1. **No shorts in my apartment.**
2. **Video is for study only.** No entertainment video at home — not stand-up, not variety, not a "just one" clip.
3. **At most seven minutes a day to select helpful YouTube study videos.**
4. **Watch downloaded videos only; no online video watching.** Selecting study materials is not permission to start streaming them.
5. **No manga, no web novels.** Reading means books, not 漫画 or 小说 used as a screen substitute.
6. **No games.**
7. **Leisure is reading and podcasts only** — plus more exercise and more sitting still.

### The evening routine that protects the morning

Two failures in two days both started the same way: the apartment, in the morning, with the laptop open. So the fix sits the night before.

- By **10 p.m.**, write tomorrow's plan.
- Then **pack the laptop into the bag**, closed and away.
- In the morning the phone is for **weather, the bus, and Duolingo** — nothing else.
- **Eat without a screen.** No YouTube with breakfast, no drafting a novel in my head instead of eating.
- **Leave for campus early.** The apartment is where this challenge gets lost; the building where it gets won.

### What works (1): a question better than the screen

The first day I held the rule, 2026-09-16, I did not hold it by resisting. I held it because I had a question I wanted to answer more than I wanted to watch anything — how to compute L1 and L2 distances between differently shaped matrices with vectorized operations. I was stuck, and being stuck was more interesting than YouTube.

That is worth writing down, because it is a different mechanism from the evening routine above. The routine removes the opportunity. This removes the appetite. **A good enough open question does the work that willpower was failing to do** — so on a day with no such question, the routine has to carry it, and on a day with one, I should notice and protect it.

### What works (2): the shape of the day, and the last two hours

Day two held, 2026-09-17, and it held on a different mechanism again — not an open question this time, but the **shape of the whole day**, decided in advance so no moment has to be decided in the moment:

- Breakfast, then **wash up immediately** — no gap for the screen to fill.
- **Leave for campus.** Try not to touch the phone, ideally not the laptop either. Get to the building first; everything else is decided there.
- **Stay on campus as long as I can stay.** Then home, wash up, and sleep is already allowed.

The part that matters most is not in the schedule, though — it is the **mindset at night**. Do not litigate the day: not how much I learned, not whether I am ahead of anyone, not whether I got enough fun. That accounting is what sends me looking for a reward at 10 p.m.

And the brain needs a **push** to make the turn. Home at 8, sit still for five minutes, and tell myself: two more hours and it is a disciplined day — that is doable. Those two hours are the whole hinge. Holding them is how the brain learns that **plain is survivable** — that an ordinary evening does not have to be paid for with something bright.

### Daily review

- Did I avoid shorts at home, entertainment video, manga, and games?
- Was there a question I actually wanted to chase today? If not, that is the risk.
- Did I keep video selection within seven minutes?
- Did I eat without a screen and leave the apartment early?
- What did I learn or build?
- Did I make time for reading, podcasts, exercise, or meditation?
- Write the `Dopamine-Control-Challenge:` line with today's verdict.
{{< /language >}}

{{< language zh >}}
### 规则

1. **不在公寓里刷任何短视频。**
2. **视频只用于学习。** 在家不看娱乐视频——脱口秀不行，综艺不行，"就看一个"也不行。
3. **每天最多用七分钟挑选有助于学习的 YouTube 视频。**
4. **只看已经下载的视频，不在线观看视频。** 挑选学习材料不等于开始在线观看。
5. **不看漫画，不看网络小说。** 阅读指的是书，不是拿漫画和小说当另一块屏幕。
6. **不玩游戏。**
7. **娱乐只有阅读和播客**，另外多运动、多静坐。

### 用前一晚保护第二天早上

两天连续失败，起点是同一个：早上，在公寓里，电脑开着。所以解决办法要放在前一晚。

- **晚上 10 点前**写好第二天的 plan。
- 然后**把电脑装进书包**，合上、收好。
- 早上手机只看**天气、公交车、Duolingo**，别的不看。
- **吃饭不看屏幕。** 不边吃边看 YouTube，也不在吃饭时构思小说。
- **早点去学校。** 这个挑战是在公寓里输掉的，在教学楼里赢回来的。

### 起作用的东西（一）：一个比屏幕更好的问题

第一次守住规则是 2026 年 9 月 16 日，靠的不是忍。是因为有个问题比看视频更想弄明白——怎么用向量化运算算不同形状矩阵之间的 L1、L2 距离。我卡住了，而卡住比 YouTube 有意思。

这值得写下来，因为它和上面那套流程是两种机制。流程拿掉的是机会，这个拿掉的是胃口。**一个足够好的开放问题，能完成意志力没做到的事**——所以没有这种问题的日子，只能靠流程扛；有的日子，我应该认出来并且保护好它。

### 起作用的东西（二）：一天的形状，和最后那两小时

第二天也守住了，2026 年 9 月 17 日，而且靠的又是另一套机制——这次不是一个开放问题，而是**整天的形状**，提前定好，于是没有哪个瞬间需要当场做决定：

- 吃完早餐**直接洗漱**——不留给屏幕可以钻进来的空隙。
- **出门去学校。** 尽量不碰手机，最好电脑也别开。先到学校再说，别的到了那儿再决定。
- **在学校能呆多久呆多久。** 然后回家、洗漱，这时候睡觉已经是被允许的了。

但最关键的那部分不在日程里，而在**晚上的心态**。不要给这一天算账：不算学了多少、不算有没有超过谁、也不算娱乐够没够。正是这套账，会在十点钟把我推去找一份奖励。

而大脑要完成这个转变，需要一个 **push**。八点到家，静坐五分钟，然后告诉自己：再坚持两小时，这一天就是自律的一天——这是做得到的。那两个小时就是整个枢纽。守住它们，大脑才学会**平淡是能活的**——一个平平淡淡的晚上，不必用点什么刺激的东西来抵。

### 每日回顾

- 有没有做到在家不刷短视频、不看娱乐视频、不看漫画、不玩游戏？
- 今天有没有一个我真的想追下去的问题？如果没有，那就是风险所在。
- 挑选视频有没有控制在七分钟内？
- 有没有专心吃饭、早点离开公寓？
- 今天学习或推进了什么？
- 有没有留时间阅读、听播客、运动或静坐？
- 写下今天的 `Dopamine-Control-Challenge:` 结论。
{{< /language >}}

## Relevant Reusables

{{< language en >}}
- [ReferralChallenge](https://lucasxiaofan.github.io/personal-website/reusable/referral-challenge/) — the larger challenge this supports.
- [habit-trending-analysis](/reusable/trending-analysis-20260916-0942/) — the other daily habit. This one protects the attention that one spends.
- [pipeline-decision-log-publishing](/reusable/decision-log-publishing-pipeline/) — publishing a day's decision log is what fills in the square above.
{{< /language >}}
{{< language zh >}}
- [ReferralChallenge](https://lucasxiaofan.github.io/personal-website/reusable/referral-challenge/) — 这个小挑战所支持的长期挑战。
- [habit-trending-analysis](/reusable/trending-analysis-20260916-0942/) — 另一个每日习惯。这个守住注意力，那个花掉它。
- [pipeline-decision-log-publishing](/reusable/decision-log-publishing-pipeline/) — 发布当天的决策日志，就是上面那个方格被填上的时刻。
{{< /language >}}

## Change Logs

{{< language en >}}
- 2026-09-17 — Second day held, on a different mechanism: the shape of the day decided in advance, and the two-hour push after getting home. Added the mindset rule — do not audit the evening for how much was learned or how much fun was had.
- 2026-09-16 — First day held. Added what actually worked: an open question I wanted to answer more than I wanted to watch anything. The heatmap now updates automatically when the day's decision log is published.
- 2026-09-15 — Added a 30-day heatmap driven by the diary's `Dopamine-Control-Challenge:` line. September 14 and 15 are both recorded as failed: over two hours of YouTube and Bilibili each day.
- 2026-09-15 — Tightened the rules: video is for study only, no entertainment video at home, no manga or web novels, leisure is reading and podcasts. Added the evening routine — plan by 10 p.m., laptop in the bag, phone limited to weather, bus, and Duolingo, eat without a screen, leave early.
- 2026-09-14 — Added language switching and a 30-day countdown from September 14 to October 14 (Eastern time).
- 2026-09-14 — Published the rules with a seven-minute selection limit. The September 13 diary proposed five minutes; this version uses the updated rule.
{{< /language >}}
{{< language zh >}}
- 2026-09-17 — 第二天守住，靠的是另一套机制：提前定好一天的形状，以及到家后那两小时的 push。补上心态那条——晚上不要给自己算账，不算学了多少，也不算娱乐够没够。
- 2026-09-16 — 第一天守住。补上真正起作用的东西：一个比看视频更想弄明白的问题。热力图现在会在当天决策日志发布时自动更新。
- 2026-09-15 — 新增 30 天热力图，数据来自日记里的 `Dopamine-Control-Challenge:` 一行。9 月 14 日和 15 日都记为失败：两天都看了两个多小时的 YouTube 和 B 站。
- 2026-09-15 — 收紧规则：视频只用于学习，在家不看娱乐视频，不看漫画和网络小说，娱乐只有阅读和播客。新增前一晚的流程——10 点前写好 plan、电脑装进书包、手机只看天气和公交车加 Duolingo、吃饭不看屏幕、早点出门。
- 2026-09-14 — 添加语言切换和 30 天倒计时：美东时间 9 月 14 日至 10 月 14 日。
- 2026-09-14 — 发布七分钟挑选视频规则；9 月 13 日的日记曾提议五分钟，这里使用更新后的规则。
{{< /language >}}
