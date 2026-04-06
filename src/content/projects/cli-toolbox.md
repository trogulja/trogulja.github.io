---
title: cli-toolbox
description: A Cargo workspace of Rust CLIs for querying development services — built for both humans and AI agents.
tags: ['Rust', 'SQLite', 'CLI', 'Async']
status: Active
github: https://github.com/productiveio/cli-toolbox
order: 2
---

I interact with a ridiculous number of services every day — project management, LLM observability, CI pipelines, error tracking. Each one has its own web UI, its own mental context, and its own way of making you click through five pages to find the one thing you needed.

So I did the only reasonable thing: I wrote a bunch of CLIs in Rust to query all of them from the terminal.

cli-toolbox is a Cargo workspace monorepo with six tools (and counting) that share common infrastructure:

- **tb-prod** — tasks, todos, time entries, and project structure from Productive.io
- **tb-lf** — LLM traces, evaluations, and triage queue from Langfuse
- **tb-sem** — pipeline status, CI failures, and deploys from Semaphore
- **tb-bug** — errors, releases, and stability trends from Bugsnag
- **tb-devctl** — local dev environment orchestrator for Productive services
- **tb-session** — full-text search over Claude Code sessions, so you can find and resume past conversations

Each one caches data in local SQLite (because hammering APIs is rude), outputs structured JSON for AI consumption, and supports interactive prompts for when I'm the one driving. They're also registered as Claude Code skills, so when I ask my AI assistant "why did CI fail?" — it just reaches for the right tool automatically.

This is probably the project that saves me the most time daily. It's also the one I keep tinkering with, because there's always one more API endpoint that would be *so useful* to have.

"I'll just add one more subcommand" is the Rust equivalent of "I'll just check one more thing on Reddit."
