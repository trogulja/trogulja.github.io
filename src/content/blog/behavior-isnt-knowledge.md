---
title: "Behavior Isn't Knowledge"
description: "Behavioral rules vs. factual knowledge in a personal AI memory system, and the one question that decides where something belongs."
date: 2026-05-08
tags: ["ai", "claude-code", "memory"]
series: "memorija-pamcenja"
draft: false
---

Here's a behavioral rule from my `CLAUDE.md`:

```markdown
## Communication

- When asked to explain something, explain it.
  Don't blindly change code.
- Push back if a request doesn't make sense.
  It's better to challenge the instruction
  than to make a wrong change and then revert it.
```

And here's a piece of knowledge from my brain:

```markdown
# Worktree gotcha: gitignored files are missing

Git worktrees share .git but not gitignored files.
Any config file in .gitignore (secrets, local overrides,
build artifacts) won't exist in a new worktree.

Fix: symlink gitignored config files from the main
checkout into the worktree before starting the service.
```

Both came from real work. For a few weeks I just had them in the same pile. The pile got weird fast.

## The one question that sorts it

When I'm not sure where something belongs, I ask: **would this be true for another user?**

"Push back on bad requests" - no. That's mine. Plenty of people want their AI to just do what they're told. It's a rule about how Claude works with *me*.

"Git worktrees don't include gitignored files" - yes. That's true regardless of who's using git. A fact about how the tool works.

The first is behavior. The second is knowledge. The split is the whole game.

## Where they live

```
~/.claude/CLAUDE.md     ← behavior (read every session, in full)
~/.brain/lore/          ← knowledge (queried when relevant)
```

There's an older version of this story where I had three folders: `~/.lore/` for knowledge, `~/.ideas/` for in-flight thinking, `~/.claude/CLAUDE.md` for behavior. They were "separate systems that needed integration." After some time I noticed I was describing the same problem three times. Now there's one store at `~/.brain/` with typed entries (`lore`, `idea`, `job`, `followup`, `research-link`). The behavior file stayed where it was.

The split between behavior and knowledge survived the reorg unchanged. I take that as a sign it's load-bearing.

## They behave completely differently at runtime

Behavior is loaded in full at the start of every session. Every rule active from the first keystroke, whether I'm debugging Rails or reviewing a PR. Knowledge gets pulled in only when something asks for it. Nobody needs 147 articles about git internals, Rails factories, and CI ordering cluttering the context for a CSS edit.

This split also forces different constraints. Behavior has to stay compact. `CLAUDE.md` is 14 bullet points across 7 categories, just under 1,000 tokens. If that ever crosses 2K, something has gone wrong. Meanwhile, knowledge can keep growing. The brain has 147 lore entries today and will probably end the year past 300. As long as retrieval works, that's fine. (Famous last words.)

Most LLM memory implementations I've seen treat everything as retrievable facts. "User prefers dark themes" goes in the same store as "the deployment pipeline uses GitHub Actions." Both get embedded, stored, retrieved by similarity. That works fine for knowledge. It quietly fails for behavior. A behavioral rule that only fires when retrieval thinks it's relevant is a behavioral rule that mostly doesn't work.

Question isn't *what* to remember, it's *when* each memory is active. Always-on versus on-demand.

## Two kinds of growing pains

Here's what I didn't expect: behavior and knowledge grow in opposite ways.

Behavior *consolidates*. Early on I had two separate rules: "research online before trying local fixes for dependency issues" and "check if there's a known issue before investigating build warnings." After a few weeks I noticed they were the same idea wearing different clothes. Two rules became one: research before local debugging. This keeps happening. Rules that seemed distinct turn out to be variations on a deeper principle. The list doesn't just grow, it compresses.

Knowledge just *accumulates*. The git worktree gotcha will never merge with the Rails factory lesson. They're about different things in different codebases. Every new entry is genuinely new.

So they face different entropy problems. Behavior risks bloating with redundant variations. Knowledge risks becoming a 500-entry pile where I can't find what I need.

## How I fight each one

For behavior: every few weeks I read the file and poke at each rule. Is this still how I want to work, or did I write it while annoyed about something? Are two rules secretly the same rule in different words? Does this rule actually create a difference from default behavior? If a rule doesn't change what Claude does, it's just decoration.

Had a "Wrapping work" rule for a while:

```markdown
## Wrapping work

- When finishing significant work (phase shipped, milestone closed,
  session ending with real output), scan for related tracking artifacts
  (idea `status.md`, `decisions.md`, linked spec/design docs, INDEX files)
  and update them before declaring done. The metadata layer drifts
  silently if you skip this: next session pickup is wrong, audit can't
  tell shipped from planned. Don't make the user prompt "did we update X?".
```

Sounded important. In practice it never fired on its own - I was always the one pinging "did we update the brain markdowns?" Decoration. Cut.

Pruning a bonsai tree, except the bonsai is my AI's personality.

For knowledge: my first instinct was to add a "flag articles older than 30 days for review" rule. I'm glad I didn't. A git worktree gotcha is just as true today as when I wrote it. The fact that it's six weeks old tells me nothing about whether it's still useful.

There's a line in the brain schema I like: **"No calendar-based staleness. Knowledge doesn't expire on a schedule."** Staleness gets caught when it matters, when I actually try to use something and the ground has shifted under it. Broken cross-links, outdated references, code that no longer exists. The system doesn't impose expiry dates. It assumes stale knowledge announces itself when poked. We'll see how that holds up.

## The trick I almost missed

The best defense against entropy isn't better rules. It's fewer rules.

When I was designing the brain, I kept catching myself adding heuristics. "Follow cross-links one level deep." "Prune outputs older than 30 days." "Require a status field on patterns but not on references." Each one felt reasonable in isolation. Together, they were a web of brittle edge cases.

I ripped most of them out. The system has structural rules (file formats, directory layout, required frontmatter) and everything else is a judgment call Claude makes at the time. How deep to follow cross-links? Depends on the question. When to prune an output? When it's no longer useful. What status to assign? Whatever fits.

This is directly inspired by [Steve Yegge's Zero Framework Cognition](https://steve-yegge.medium.com/zero-framework-cognition-a-way-to-build-resilient-ai-applications-56b090ed3e69) and [Richard Sutton's Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html). The short version: hardcoded heuristics feel productive in the moment but become maintenance liabilities. An LLM handles exponentially more edge cases than hand-coded rules, so let it.

This applies to the memory system itself. Don't add retrieval heuristics or scoring algorithms or expiry policies. Define the structure, define the goal, let the LLM figure out the rest. Fewer moving parts means less to break.

## Where this leaves me

15 rules in `CLAUDE.md`. 147 lore entries. 30 ideas in flight. The behavior side feels like it's finding its shape, changing slowly through real incidents. Knowledge is growing steadily and so far I can still find what I need.

But 147 entries is easy. 470 is a different animal. I'll probably need better retrieval at some point, beyond the current hybrid (BM25 plus local semantic embeddings). I'm deliberately not building any of that yet, because premature optimization of a memory system is itself a form of entropy. Future me's problem.

The split itself, behavior versus knowledge, always-on versus on-demand, feels solid. It was the first structural decision I made, and so far nothing has made me regret it.

What I still don't know: what happens when knowledge goes stale and I don't notice. What happens when two behavioral rules pull in opposite directions. How I'd even tell whether a rule is doing its job or just sitting there decorating the context window.

I'll probably find out the hard way.
