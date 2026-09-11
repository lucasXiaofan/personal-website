**Xiaofan Lu, Yixiao Zeng, Feiyang Ma, Zixu Yu, and Marco Levorato**  
University of California, Irvine · Xiaofan Lu and Yixiao Zeng contributed equally.

Accepted at the **NeurIPS ENLSP 2024 Workshop**.

[Read the paper (PDF)](https://arxiv.org/pdf/2409.10644) · [arXiv](https://arxiv.org/abs/2409.10644) · [Google Scholar](https://scholar.google.com/citations?user=SxcR5LkAAAAJ&hl=en)

## Overview

Speculative decoding speeds up language-model inference by asking a smaller draft model to propose tokens that a larger target model verifies. Multi-candidate decoding explores several candidate paths at once, increasing the chance that useful tokens are accepted.

This paper investigates three improvements: initializing candidate branches with the target model, using a dynamically sliced topology-aware causal mask to adjust draft length, and predicting when drafting should stop early.

Our static target-initialized approach achieved **up to 27.5% speedup over our MCSD baseline**, using Llama 2-7B as the target and JackFram 68M as the draft model across TriviaQA, Alpaca, and MT-Bench. This is a maximum observed improvement, not an average or a comparison with ordinary autoregressive decoding.

The experiments also reveal trade-offs: the full dynamic framework did not consistently improve both speed and output quality, and target-initialized generation does not guarantee preservation of the target model's output quality.

![Draft-initialized and target-initialized multi-candidate generation](/media/multi-candidate-decoding.png)

*Figure 1 from [the paper, version 3](https://arxiv.org/pdf/2409.10644v3): comparing draft-initialized and target-initialized candidate generation.*

This overview summarizes the paper; the full method, experiments, and limitations are available in the linked PDF.
