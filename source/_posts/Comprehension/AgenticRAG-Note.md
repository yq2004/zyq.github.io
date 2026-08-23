---
title: AgenticRAG_Note
date: 2026-07-05 17:54:23
tags:
---

## 这篇文章的核心命题

> 在传统 RAG 的“检索—增强—生成”流水线中加入具备自主决策能力的 Agent，使系统能够动态决定：是否检索、检索什么、调用哪些工具、是否改写查询、是否反思修正、是否继续迭代。

传统 RAG 的基本流程是：

```
User Query
   ↓
Retriever
   ↓
Retrieved Context
   ↓
LLM Generation
   ↓
Answer
```

而 Agentic RAG 可以理解为在这个流程上方加了一个**控制层**：

```
User Query
   ↓
Agent Controller / Policy
   ├─ decide whether to retrieve
   ├─ rewrite query
   ├─ route to vector DB / SQL / web / API / KG
   ├─ evaluate retrieved evidence
   ├─ refine context
   ├─ call tools
   └─ decide when to answer
   ↓
LLM Generation
```

文章明确指出，Agentic RAG 的动机来自传统 RAG 的静态、线性、难以处理多步推理和复杂任务；Agentic RAG 则通过 autonomous agents 引入动态检索、迭代上下文 refinement 和自适应 workflow orchestration。

🤔每加一层路由都意味着开销和误差。我认为：有时可以适当转移一下责任，比如“decide whether to retrieve”可以让用户决定，当然，用户还是可以选择Auto模式，强行让系统来路由。

## X. 对RAG的看法

一年的RAG学习，我想将我对RAG的理解凝练成下面的内容。

RAG （检索增强生成），就是给AI扫盲，他不懂的东西，不允许胡说，**给**他**参考**，就要考虑我们”给“的能力和他”参考“的能力。

引子：给定一段信息内容，然后让AI根据这些信息内容回答问题是“检索增强生成“吗？

不完全是。我认为检索可以分为两种类型，**外检索**和**内检索**。

- ”参考” 的能力 -- 内检索

  让AI根据**给定**的信息内容回答问题，属于内检索，给定的信息M，其中能够回答问题Q的部分我们称为M'，那么M'是M的子集，内检索的过程则是找到这个子集（当然，也可能M'就等于M，这样最好，说明外检索做的十分完美），那么这个过程称为后处理，包含过滤、去噪等，LLM本身具备一定的抗噪、去噪能力，但不容易量化这种“能力”。内检索关注的是LLM的检索能力或者外挂的辅助能力，后者是指加额外的Pipeline去对给定的信息进行处理，从而让LLM更容易找到M'。

- “给”的能力 -- 外检索

  前面说了**给定**的信息，从哪里得到这些信息，则是外检索的过程。最经典的有两种，

  外检索的核心就是用尽浑身解数去找到**可能**（这里做得越粗糙，内检索就越吃力。换句话说，如果你的后检索设计得十分牛逼：超强的LLM+各种后处理方法其下，你完全可以把TopK设置得无比高，从而”宁可错检1000，不可漏检一个“，反正我们的后处理可以把）有用的信息。（Embedding, WebSearch, DBSearch(Text2SQL), AskAnotherLLM, Disassembling(拆成子问题，适合处理多跳问题)...）

  还有哪些找信息的方法呢？(grep...)

  ---

  “给”的能力？谁来给，给什么，怎么给？我想这些思考就交给Agent吧。再进一步，“参考”的能力，Agent也可以持续跟进，Reflect一下是否足够，需要回过头来rewrite一下吗？...整个过程都自动化，我们提供方法论，Agent遵循和探索。这是AgenticRAG

  但是上述做法都太过冒进，我们没有考虑Latency和Cost，然而这俩其实是大头...

  > Utility = Answer Quality
  >         \+ Factuality
  >         \+ Completeness
  >         \+ Robustness
  >         \- Cost
  >         \- Latency
  >         \- Risk

