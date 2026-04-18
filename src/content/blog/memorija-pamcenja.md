---
title: "Memorija Pamćenja"
description: "Why I'm building a memory system for my AI coding assistant, and what I mean by that."
date: 2026-04-18
tags: ["ai", "claude-code", "memory"]
series: "memorija-pamcenja"
draft: false
---

*Memorija pamćenja.* In Croatian, it literally means "the memory of remembering." My dad and I use this phrase as a running joke - memory is important, so important that we emphasize it through redundancy. It sounds ridiculous and we both know it. That's the point.

But it's also, accidentally, precise. Because that's exactly what I've been building: a *memory system* (memorija) that enables an AI to *remember* (pamćenje). The infrastructure of recall.

This is the first post in an open-ended series about building that system. Not a tutorial. Not a "definitive guide." Just an honest account of what I'm doing, why, and what I'm learning along the way.

## The problem with a brilliant amnesiac

I use [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as my daily coding assistant. It's remarkably capable - it reads my codebase, writes code, runs tests, fixes its own mistakes. And it works. Every time. The problem isn't competence - it's all the small stuff.

Every new session, I'm correcting the same things. Don't silently change code when I ask you to explain something - explain it. When you hit a dependency error, search online before spending 40 minutes on local workarounds. And for the love of god, stop referencing Productive tasks by number - `#123` links to a GitHub PR, not our task tracker. Use the task ID.

None of these are obvious. An LLM can't know them from the codebase alone. So each session becomes a small onboarding: a genius colleague who does great work, but needs the same gentle corrections every morning.

## Auto-memory exists. It's not bad.

Claude Code already has a built-in memory system, and it's more sophisticated than most people realize. It has typed memories (user preferences, feedback, project context, references), each stored in separate files with structured metadata. There's a background extraction agent that watches conversations and saves things you didn't explicitly ask it to save. There's even a "dreaming" process - a consolidation agent that runs roughly every 24 hours to prune, merge, and clean up memories. It's genuinely impressive engineering.

But it's a black box. I have no real insight into what's being remembered, why it was selected, or when it gets consolidated. It just... happens. Magically, automatically, opaquely. Sometimes I notice it remembered something useful. Sometimes I notice it didn't remember something important. I can't tell you why in either case.

That opacity is the gap. Not capability - control. Not quality - understanding.

## What I'm building instead

I wanted to understand the problem by building my own solution. Not because auto-memory is bad - but because I find the problem fascinating, and you learn things by building that you can't learn by using.

The system is still evolving, but the core idea is a separation that turned out to be surprisingly important: **behavior is not knowledge.**

Here's what I mean. This is a behavioral rule:

```
# Communication

- Push back if a request doesn't make sense.
  It's better to challenge the instruction than
  to make a wrong change and then revert it.
```

And this is a piece of knowledge:

```
# Research Online Before Local Debugging

When a problem originates in a dependency or framework,
research online before attempting local fixes.

## Why
Local debugging of third-party issues is blind
trial-and-error. Online research typically surfaces
context in minutes that would take many failed
local attempts to approximate.
```

The first one shapes *how Claude works with me*. The second is a *fact about the world* that happens to be useful.

This distinction matters because they age differently, they get retrieved differently, and they degrade differently when there are too many of them. A behavioral rule like "push back on bad requests" is true forever. A knowledge entry like "Obsidian stores vault paths in `obsidian.json`" might become stale when Obsidian ships an update.

I store them separately. Behavioral rules live in a compact file that Claude reads at the start of every session - think of it as personality. Knowledge lives in a wiki that grows over time and gets queried when relevant.

There's more to it - an ideas pipeline, a review process, a feedback loop - but I'll get to those in future posts.

## Why write about this

Two reasons.

**For me:** Writing forces me to crystallize half-formed intuitions into actual claims. Right now, a lot of this system lives as "it works, I think, mostly." Blogging about it means I have to be specific about what works and what doesn't.

**For you:** When I started building this, I looked for prior art. I found Andrej Karpathy's [LLM knowledge base gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) - brilliant, widely forked, and spawned dozens of implementations. But almost every one of them is a variation on the same idea: store facts in markdown, retrieve them when needed.

Nobody was writing about the *experience* of building and using such a system over weeks. Nobody was talking about the failures, the blind alleys, the moments where the system's limitations become painfully obvious. The tutorials are great for getting started; I want to write about what happens after that.

## What's coming

This series follows the chronological arc of how I built the system. The next post is about a specific incident - three failed workarounds and a two-keystroke solution - that accidentally became the founding story of the whole approach.

No fixed schedule. I'll publish when a post is ready. Let's see where this goes.
