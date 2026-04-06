---
title: P-Scripts
description: A collection of zsh scripts for developer productivity — AWS auth, PR navigation, CI status, and test selection.
tags: ['Zsh', 'fzf', 'AWS CLI', 'DevOps']
status: Active
github: https://github.com/trogulja/shell
order: 4
---

This one started the way all good scripts start: "I keep typing the same five commands and I'm tired of it."

Developer workflows have a lot of small repetitive steps — log into AWS, open a PR in the browser, check if CI passed, run the right subset of tests. Each one is trivial. But string enough trivial things together and you've lost twenty minutes and your train of thought.

P-Scripts is a collection of interactive zsh scripts, each tackling one workflow:

- **paws** — AWS SSO authentication with profile selection via fzf
- **ppr** — open GitHub PRs from the current branch, or fuzzy-search recent ones
- **pci** — check Semaphore CI status for the current branch, with direct links to failing jobs
- **ptest** — interactively pick and run cucumber test scenarios with tag filtering

They all lean on tools I already use — fzf for selection, jq for JSON, ripgrep for searching. Each one has built-in help and proper error handling, because future-me will absolutely forget how they work.

What started as a personal itch became something the wider team adopted. There's a special kind of satisfaction when a coworker says "wait, how did you do that?" and the answer is a three-letter command.
