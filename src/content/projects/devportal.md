---
title: DevPortal — AI Platform
description: Internal observability platform for AI products — dashboards, trace triage, and automated quality monitoring.
tags: ['React', 'Rails', 'AI', 'Observability']
status: Active
order: 3
---

When your company ships AI products that handle thousands of conversations a day, you need to know when things go wrong — ideally before a customer tells you. That's what this platform does.

DevPortal started as a modest internal tool at Productive — run some data migrations, track a few errors. Then we started building AI products, and suddenly we needed a proper observability layer. Dashboards, trace browsers, eval tracking, cost monitoring, latency analysis. The kind of thing where you go from "we should probably have this" to "how did we ever work without it" in about a week.

The part I own is the AI Platform module — a React SPA that gives the team visibility into everything our AI products are doing:

- **Dashboards** for KPIs: cost, latency, user satisfaction, adoption trends
- **Trace browser** for drilling into individual conversations and multi-turn sessions
- **Eval tracking** for monitoring AI quality across releases
- **Automated triage** — an LLM-powered pipeline that classifies traces, flags problems, and routes them to the right team for review

That last one is probably the most interesting bit. We can't manually review every AI interaction, so I built a classifier that processes traces automatically, surfaces the ones that look problematic in an annotation queue, and lets humans confirm or dismiss. It's the kind of system where the hard part isn't writing the code — it's figuring out the right abstractions so it stays maintainable as the product evolves.

The whole thing syncs summary data from Langfuse — just enough to power fast queries without duplicating the entire dataset — and runs background pipelines for classification. It's not glamorous work, but it's the infrastructure that lets the AI team move fast without flying blind.
