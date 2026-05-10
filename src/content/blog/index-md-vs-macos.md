---
title: "Theory Said `index.md`. macOS Said No."
description: "A walk through how my personal AI brain is organized. 5 types, folder-or-file entries, and the `.gitignore` case-collision on macOS that quietly hid 19 files for 5 days and forced one of those conventions to flip."
date: 2026-05-10
tags: ["ai", "claude-code", "memory"]
series: "memorija-pamcenja"
draft: false
---

You know that idiom about picking someone's brain? Well, today's version is more literal: open the folder and poke around. The layout is roughly what you'd expect of anything that descended from [Karpathy's LLM wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Markdown files, type folders, light schema... you know, the usual.

Here's the top level:

```
~/.brain/
├── SCHEMA.md
├── lore/           # durable knowledge: "X means Y", "use Z, not W"
├── idea/           # pre-implementation thinking
├── job/            # in-flight work units
├── followup/       # things I owe
├── research-link/  # URLs I want to read later
└── scripts/        # recall, embed, regenerate-index
```

Each subdirectory is a *type* of entry, with its own `SCHEMA.md` describing the frontmatter, lifecycle, and conventions for that type. So `lore/` has a schema, `idea/` has a different schema, and so on. Adding a new type is a matter of creating a folder and writing its schema. No code changes.

Inside each type folder, an entry can be one of two shapes.

If it's small, it's a single file. `lore/croatian-pronoun-order.md`, for example, is one file about when "ja" goes at the end of a personal list in Croatian. A small thing, until I'm drafting a Slack message and need it.

If it grows, it promotes to a folder. The convention is **`<slug>/<slug>.md`**, plus siblings:

```
idea/lazy-output-tool/
├── lazy-output-tool.md     # the main entry
├── status.md               # in-progress tracker
├── decisions.md            # what I locked in and why
└── research.md             # raw material, references
```

That weird-looking duplication, `lazy-output-tool/lazy-output-tool.md`, is intentional. It's the convention from the [Obsidian Folder Notes](https://lostpaul.github.io/obsidian-folder-notes/) plugin. The wikilink `[[idea/lazy-output-tool]]` resolves to that file even without the plugin. Promotion from single-file to folder doesn't change any inbound link. The slug stays the slug.

It looks like a small choice. It wasn't.

## The version I locked in first

The original convention was `<slug>/index.md`. Cleaner path. Less duplication. Familiar from a hundred static site generators. I'd weighed it against the alternative, written it up as a lore entry, and concluded `index.md` was defensible.

The lore entry had a comparison table. Trade-offs spelled out. I'd put the work in.

Then I had Claude close out one of those folder entries (`lore-evolution`): bumped the phase in frontmatter, refreshed the status file, regenerated the type-level INDEX, committed.

```bash
$ git commit -m "close lore-evolution"
[main 9d65974] close lore-evolution
 1 file changed, 2 insertions(+), 2 deletions(-)
```

One file. I'd touched two. Closer reading of the diff confirmed it: the status file was tracked, the main entry file wasn't. Strange, because I was *sure* I'd added them all back when I first set up the repo.

```bash
$ git ls-files 'idea/*/index.md'
$
```

Zero files. Nineteen idea main entries. None of them tracked.

I'd been using this thing in production for five days. Compiling raw thoughts into wiki entries. Closing ideas. Linking across types. Locally, everything worked. In git, half of it had never happened.

## What ate them

`.gitignore` had this in it:

```ini
# Auto-regenerated indices
INDEX.md
lore/INDEX.md
idea/INDEX.md
research-link/INDEX.md
```

The intent was to ignore the auto-generated, type-level `INDEX.md` files (capitalized) at the root of each type folder. Those get rebuilt by a script every time something changes; checking them in just creates merge churn.

The problem is `core.ignorecase=true`, which is the macOS default because the filesystem itself is case-insensitive. To git, on this Mac, `INDEX.md` and `index.md` are the same name. The pattern matched both. Every per-entry main file (lowercase) got silently included in the ignore. No warning. No rejection on `git add`. Just absence.

This is the kind of bug I find genuinely upsetting, because it's not a bug in any one thing. The pattern is fine on Linux. The filename is fine on Linux. Git's behavior is documented. macOS being case-insensitive is documented. They just don't compose. And the failure mode is silence, which any husband can confirm is the worst failure mode there is.

A system whose entire purpose is to remember things spent five days quietly forgetting half of it.

## The first fix wasn't the fix

The immediate move was a path-anchored un-ignore:

```ini
INDEX.md
lore/INDEX.md
idea/INDEX.md

# rescue per-entry main files
!idea/*/index.md
!lore/*/index.md
```

That worked. `git status` lit up. I committed nineteen rescued files in one commit, pushed, and exhaled.

But it kept feeling wrong. The collision between `INDEX.md` and `index.md` was still there. I'd just papered over it. If I added another similar pattern later, the trap would re-arm. I'd attached myself to this convention by an inclined plane wrapped helically around an axis.

The next morning I had Claude run the migration. Five minutes from `<slug>/index.md` to `<slug>/<slug>.md`: nineteen files renamed, wikilinks rewritten, schema doc updated.

The folder-entry path went from `idea/lore-evolution/index.md` to `idea/lore-evolution/lore-evolution.md`. The duplication is right there, visible, ugly. But there's no collision. Cmd-P in either VS Code or Obsidian shows me the entry I want by name, not nineteen tabs all called "index.md". Vanilla Obsidian wikilinks resolve to the right file because the basename matches. The gitignore stopped lying.

## What the research couldn't tell me

The lore entry I'd written before all of this had both options on it. It had pros and cons. It even had a "decision factors" section. What it didn't have, because no comparison table can have it, was: *which one does your actual filesystem swallow?*

This is the part I keep thinking about. Research gave me defensible options. The literature was telling the truth. `<slug>/index.md` is fine. Half of every static-site generator on Earth uses it. People are happily writing knowledge bases that way today. The convention isn't broken; it's just sharp on macOS in a way that doesn't show up until you cut yourself.

I've had a lurking suspicion for a while that I lock decisions in too early. There's a Claude skill I use called `/grill-me`, a copy of [Matt Pocock's original](https://www.aihero.dev/use-the-grill-me-skill-k029d), that interrogates a plan until every branch is resolved. I'd run it on this exact convention choice. It works well at surfacing problems I can articulate. It can't surface problems I can't.

The thing that fixed the convention wasn't more research. It was five days of using it. Production exposure with real workflows: editor tabs, fuzzy finders, commit logs, regen scripts. The filesystem ran the experiment for me.

I'm not sure what to do with that yet. "Don't lock in early" overcorrects, because some things genuinely benefit from a defensible choice up front. But locking in feels like safety, and safety can be misleading. A grilled plan with a bow on it looks done. It isn't done. It's a hypothesis with good packaging.

## The layout that stuck

So this is what I have now:

```
idea/lazy-output-tool/
├── lazy-output-tool.md
├── status.md
├── decisions.md
└── research.md
```

The path duplication is uglier than the original. But it survives a `git status` after a week of real use, which turns out to be the only test that matters.

The lore entry that locked in `<slug>/index.md` now ends with a footnote:

> *Switched to `<folder>/<folder>.md` on 2026-04-25 after the gitignore case-collision incident.*

I read it with a slight wince every time I open the entry. The wince is the point. It's the brain reminding me that I had it figured out, and I didn't.

## Five types, for now

Five types right now: `lore`, `idea`, `job`, `followup`, `research-link`. Each lives in its own folder with its own `SCHEMA.md` describing the frontmatter, the lifecycle, and what the LLM should ask when something transitions between states. There's no per-type CRUD skill, no validator. Just the folder, the schema doc, and a convention the LLM follows when working inside that type.

Adding a new type is creating a folder and writing its schema. No code changes anywhere. Types are data, not classes.

That's the part I keep coming back to. The brain isn't *my* shape, it's whatever shape I want this week. These five fit how I work right now. If I started teaching, I'd add `compass` for task-keyed dense context. If I started reading on a schedule, I'd add `digest` for processed source material. The recall script wouldn't notice. The folder *is* the schema engine.

Anyone cloning this could pick three types, or eight, or none of mine. The rest still works.

~150 entries are sitting in this version of the shape. Some of them are wrong in ways I haven't bumped into yet. I'll know when they bite me.
