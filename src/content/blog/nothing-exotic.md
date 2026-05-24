---
title: "Nothing Exotic"
description: "Retrieval over a personal knowledge base: SQLite FTS5 for BM25, an audited Nomic embedding model for semantic search, hybrid via reciprocal rank fusion. No vector database."
date: 2026-05-22
tags: ["ai", "claude-code", "memory"]
series: "memorija-pamcenja"
draft: false
---

When the brain had 30 lore entries, I could keep the whole thing in my head. By 100, I was grepping. Past 150, grep started failing in a specific way: I'd remember writing about a thing, reach for it with different words than I'd used the first time, find nothing, and write a third entry about the same problem without realizing the other two existed.

The brain wasn't too big. The problem was vocabulary. The other problem was that the brain has two users. I'm one. Claude is the other, and Claude arrives every morning with no memory of yesterday's vocabulary, no memory of which entries we wrote together, no memory of having seen any of these files before. Whatever tool I built had to work for that user too.

I expected this to be hard. Well... turned out it really wasn't.

## The fork on the floor

It started as a side question. I was sketching an idea called `read-later-digest` and thinking out loud about what to do "when the corpus grows." Claude wrote back something like "when it grows, we'll add BM25 pre-filtering." A throwaway clause inside a longer answer.

I stopped reading.

> *"What is BM25?"*

I asked, in those exact words. Claude explained. Mid-explanation I jumped back in:

> *"How would that work? Teach me, I'm curious."*

The reply walked through SQLite FTS5: virtual table, MATCH queries sub-millisecond on a few hundred docs, populate from a glob, point a query at it. And it ended with:

> *"Mostly nothing exotic. One file, a few SQL commands, sub-second reindexing. SQLite comes with it built in. You don't need to install anything."*

That landed wrong, in a good way. If BM25 in 50 lines of SQL is "nothing exotic," then I'd been thinking about retrieval wrong for weeks. I'd been treating it as a *future* problem, the kind that justifies a Pinecone account or a sqlite-vec dependency or some other piece of infrastructure I'd resent. But the building block was already there, free, in a database I already used for everything else.

A few minutes later I wrote back with my own reframe:

> *"This BM25, we can use it as a tool for progressive memory injection."*

The same FTS5 table that would make `read-later-digest` searchable would also make lore searchable, ideas searchable, research-links searchable. One unified search layer for the whole brain.

Not exactly the progressive memory injection I'd pitched. That idea turned out to have its own problems, which is a different post. What got built instead was a search I could trigger by hand whenever the conversation needed it, and that turned out to be what I actually wanted.

The conversation continued for another hour and changed half my mental model of what the brain was supposed to be.

The thing I keep thinking about is that I couldn't have arrived at that alone. Claude *knew* about FTS5 the whole time. It wasn't a secret. I didn't know what BM25 was. Neither of us alone had the insight. The combination did, and the combination only worked because I stopped on the throwaway clause and asked what it meant. I'd been treating LLM collaboration as "I drive, it codes." This felt like a different mode, one where the AI's casual aside rearranges what you thought you were building, but only if you're paying enough attention to notice the aside. I didn't have a name for it then; I still don't. But I want more of them.

## What BM25 actually does

We had it working that same evening. SQLite FTS5 virtual table, populated from a glob over `~/.brain/**.md`, with title and tags weighted higher than body text. Mtime-incremental rebuilds (touch a file, the index notices). One Python script (`recall.py`) wraps it.

Calling it looks like this:

```
$ ~/.brain/scripts/recall.py "feature flag cleanup"
[1] [lore] lore/flag-cleanup-test-rework.md
    Flag Cleanup: Rework Tests, Don't Delete Them  (bm25=6.23)
    When cleaning up a feature flag, tests using it are testing the
    old behavior. The instinct is to delete them. Don't...

[2] [lore] lore/flag-cleanup-checklist.md
    Flag Cleanup Checklist  (bm25=6.16)
    Feature flag cleanup is a full-codebase audit, not just removing
    conditionals. The flag usage sites are just the starting point...
```

Sub-50 millisecond warm. The brain had 151 documents at that point, about 1.5 MB of text in a 4 MB SQLite file. The whole thing gets rebuilt only on changes. There is no server, no index process, no daemon. The recall script opens the file, runs MATCH, prints results, exits.

This was enough for a few days. Both Claude and I started reaching for `recall` mid-conversation when something felt familiar: "did we already have a thing about X?" Yes, here it is. The corpus stopped growing redundant entries. The brain felt smaller despite being bigger.

## Where BM25 ran out

BM25 ranks by keyword overlap. If you query "feature flag cleanup," it finds the entry titled "Flag Cleanup Checklist" because the words match. Beautiful when they match. Not so great when they don't.

Here's a query Claude tried recently:

```
$ ~/.brain/scripts/recall.py "how do i prevent silent failures from gitignore patterns" --mode bm25
(no results)
```

Zero hits. The brain has more than one entry about silent failures and gitignore traps (one I [wrote a whole post about](/blog/index-md-vs-macos)) but none of them happen to use the exact word "prevent" or the exact phrase "silent failures." BM25 saw the query vocabulary, didn't find it in any document, gave up.

This is the BM25 ceiling. The thing about BM25 is that it has a clear job (match the exact word, especially names, identifiers, jargon) and it does that job beautifully. The job it doesn't have is "find the entry where I described this in different words." I'd been pretending the second job didn't exist, because most days the words matched and retrieval felt fine.

A few days after the BM25 index settled in, I went back to Claude with a small question.

> *"How hard would it be to add semantic search?"*

The answer had the same shape as the first time.

> *"Small problem, really."*

Local embedding model, around 100MB on disk, sub-second over the whole corpus, RRF merges the two ranked lists. A day of work, not a week. (The model I ended up with turned out to be five times that size, but the shape of the pitch held.)

The math wasn't the problem. The problem was choosing a model without giving up the things I cared about: speed, simplicity, and not phoning home.

## The model nobody let me use

Google released EmbeddingGemma in late 2025, marketed as the best on-device embedding model. The benchmarks looked great. Apache-licensed... wait, no, gated. To download the model, I'd need to accept a Google license and authenticate with a HuggingFace token tied to a Google account.

I stopped right there.

"Local-first" has more layers than I'd thought. There's *execution* local (the model runs on my hardware), *install* local (no auth dance to download it), *metadata* local (no telemetry, no update checks), and *code* local (if custom code is involved, I can read it). EmbeddingGemma satisfies the first. The second one already breaks: installation requires a round trip to a Google-controlled gate. That's not local-first; that's local-execution-of-cloud-thing.

I pivoted to Nomic. `nomic-ai/nomic-embed-text-v1.5`, Apache 2.0, no gate, drop-in. Better dimension/speed trade-off for the size. Community pick across recent benchmarks. I downloaded the weights in five minutes and went to bed thinking I'd be running queries by morning.

I was wrong.

## `trust_remote_code=True`

The next morning, the loader script printed:

```
ValueError: The repository for nomic-ai/nomic-embed-text-v1.5 contains
custom code which must be executed to correctly load the model. You can
inspect the repository content at https://hf.co/nomic-ai/nomic-embed-text-v1.5.
You can avoid this prompt in future by passing the argument
trust_remote_code=True.
```

Translation: HuggingFace will download two `.py` files (the model's custom architecture) and execute them as part of loading the model into my process. To opt in, pass a flag.

I closed the laptop and went for a walk.

It's not that I think Nomic is malicious. It almost certainly isn't. It's that the entire shape of this is a textbook supply-chain attack vector. I download a model. I trust the maintainer. The maintainer is fine. But the maintainer's HuggingFace account gets compromised next week, the `.py` files get a few extra lines added, and the next time I (or anyone) loads the model, those extra lines run inside my process. With my filesystem permissions. With my SSH keys. With my AWS credentials. Quietly.

`trust_remote_code=True` is one keystroke. The friction is the whole point.

I came back from the walk with the answer I liked: containerize the thing. Network-isolated container, never let the model code touch my actual filesystem, eat whatever performance cost came with that. I typed it up. Claude pushed back. Three options ended up on the table:

1. **Drop Nomic for a standard model.** BGE, mxbai, e5 ship inside `transformers` directly and need no remote code at all. Nothing to audit because nothing custom gets downloaded. The trade-off was a step down on the retrieval benchmarks I cared about and an 8K → 512 token context cut. Workable, ugly.

2. **Audit the code, then pin.** Read the two `.py` files. Pin the exact commit. Hash-verify on every load. Re-audit on bumps.

3. **Containerize.** My original instinct. Run the loader in a network-isolated container, lose MPS acceleration on Apple Silicon (Docker on macOS runs a Linux VM with no Metal access), take the speed hit forever.

Option 1 sacrificed quality permanently. Option 3 sacrificed speed permanently. Option 2 sacrificed an evening, once. I picked option 2.

My first instinct was the most defensive option, and it was also the worst one. Containerization felt like the right move because it's what security-conscious people do. But "security-conscious" isn't a goal, it's a heuristic, and the heuristic was steering me toward permanent infrastructure cost for a one-time problem. Reading the code was cheaper. The only thing it required was being willing to read code.

## The audit

The two files were a config (55 lines, a clean Python dataclass) and a model (2,556 lines, mostly attention-and-MLP plumbing). I gave Claude the checklist (`subprocess`, `eval`, `exec`, `__import__`, `compile`, network calls, file writes, environment-variable reads, hardcoded paths to credential directories, `pickle.load`, `torch.load` on user-controlled paths) and we walked the files together. Claude grepped, surfaced anything that looked suspicious, and I ruled on each hit.

Zero real hits. Every "token" in the source was an ML token, every "load" was a tensor load, every "path" was a model checkpoint path. The model code was clean. The riskiest line was a `torch.load(model_path)` on line 440 that doesn't run in our flow because we use `safetensors`. Noted in the audit log, moved on.

Claude flagged one comment from the original author:

```python
# TODO: fix this
# Assuming we know what we're doing when loading from disk
# Prob a bad assumption but i'm tired and want to train this asap
```

This is, hand on heart, the most honest comment I've ever read in a model file. It's also a weirdly good argument for auditing: you get to see how the code was actually built, not how it's marketed in the README. *I'm tired and want to train this asap* is exactly the human reality of ML research, and it's exactly why I want to read the file before letting it run inside my process.

There was one wrinkle the README didn't warn me about. The `trust_remote_code` files don't live in `nomic-embed-text-v1.5`, which is the repo where the weights live. They live in a separate HuggingFace repo called `nomic-bert-2048`, and that's the one I needed to pin. I learned that the second time the loader ran, when the hash check failed because I'd pinned the commit on the model card. The first version of my pinning logic was confidently wrong for about an hour.

The whole audit took about 35 minutes. I stored the result in a checked-in text file:

```
# Audit trail for nomic-ai/nomic-bert-2048 trust_remote_code files
REVISION=7710840340a098cfb869c4f65e87cf2b1b70caca
AUDITED_AT=2026-04-27
AUDITED_BY=trogulja

SHA256_configuration_hf_nomic_bert.py=f7871694b8de3d3df4ac6640313d5799ce323261a0fb90c5cc567ecc34a0039e
SHA256_modeling_hf_nomic_bert.py=3b24a366c4cc31b869466ccfb7bbb8879e138c97f8de06c83d4fa1e31a21f149
```

The loader reads this file, hashes the cached `.py` files, and refuses to import the model on a mismatch. After the first cache populate, `HF_HUB_OFFLINE=1` and `local_files_only=True` are set, so subsequent loads do zero network. No metadata leaks. No silent updates. No surprises.

Bumping the revision is a deliberate act, not a side effect. That feels right.

## The hybrid

With Nomic loadable, the first encode pass covered the 151 documents in the brain at the time and finished in well under a minute. The vectors get stored as float32 BLOBs in the same SQLite database that holds the FTS5 index. 151 vectors × 768 floats × 4 bytes is about 460 KB of vector data.

The brain has nearly doubled since: 289 documents now, about 870 KB. Rebuilds are incremental, though: only files whose mtime has changed get re-embedded, so the everyday cost is a second or two.

That's the part I keep coming back to. Most blog posts about embedding stores have a section on sqlite-vec or Pinecone or DuckDB-VSS. None of those are the right tool here. Under a megabyte of vectors: cosine similarity over the whole set is sub-millisecond once the BLOB rows get read into a NumPy matrix. There is no scaling problem. There is no infrastructure problem. There is barely a *problem*.

The hybrid query: BM25 returns its top results, semantic similarity returns its top results, [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) merges the two ranked lists into one. That's the entire fusion algorithm: rank-based, no score normalization needed, k=60 by industry default. About 30 lines.

The same paraphrase query from earlier:

```
$ ~/.brain/scripts/recall.py "how do i prevent silent failures from gitignore patterns"
[1] [lore] lore/skip-log-sentinel-pattern.md
    Skip-log sentinel for audit-mode reads  (rrf=0.0164 bm25=- sem=#1)

[2] [lore] lore/worktree-gitignored-files.md
    Worktree gotcha: gitignored files are missing  (rrf=0.0161 bm25=- sem=#2)
```

Two hits, both relevant, neither found by BM25. The `bm25=-` annotation tells me the keyword search saw nothing; the semantic side ranked them #1 and #2. This is what hybrid is *for*. The brain isn't bigger. My ability to ask questions of it is.

A small honesty caveat. This is one query, hand-picked. The first query I tried after hooking hybrid up was *"stratified flag analysis"*, a phrase that doesn't appear literally anywhere in the brain. BM25 returned zero. Hybrid returned five flag-cleanup notes. That was the moment the choice sat in for me. But two queries is not a measurement. A real evaluation means writing 10 or 15 query-and-expected pairs and tracking recall@5 across them, and I haven't. The pattern is real, the failure mode is real, the frequency is unmeasured.

Cold load latency is 5 to 9 seconds because PyTorch loading a 137M-parameter BERT is just slow. Warm queries are roughly 50 milliseconds, dominated by the cosine math. There's an obvious next move (run the model in a daemon, query over a Unix socket) and I haven't done it yet, because 5 seconds three times a day is fine and the daemon would add lifecycle complexity I don't currently want. The boring choice keeps winning.

## What's about to ship

This stack is approximately 1,500 lines of Python, one SQLite database (holding both the FTS5 index and the embedding BLOBs), two audited remote-code files, and a text file of hashes. Nothing in it is exotic. None of the building blocks were invented for this; all of them have been around for years. BM25 over Pinecone, Nomic over Gemma, NumPy over sqlite-vec, audit over containerize, hybrid over either alone. The choices, not the parts.

The whole thing is being packaged into a public repo right now. The plan is that the architectural skeleton (schemas, scripts, the Claude skill, an installer that handles audit-on-demand and warm-up of the local model) ships at [`github.com/trogulja/brain`](https://github.com/trogulja/brain). Personal entries don't ship. Schemas, scripts, and skill do. Anyone with a similar setup (macOS, Apple Silicon, Python) can clone it and have a working brain by the end of an install command.

There's one piece of work I've been quietly dreading and haven't actually done: take a fresh machine, run the install command, see whether the whole thing comes up without me touching anything. So consider this post the announcement. If the boring answer wins one more time, the install will just work on your machine. If it doesn't, [open an issue](https://github.com/trogulja/brain/issues) and I'll find out what I missed.

I am not naive enough to believe the boring answer wins every time. But it's been my batting average for retrieval so far, so I'll take it. Whether the average holds in daily use is a different post: what queries I reach for, where the thing earns its keep, where it doesn't.
