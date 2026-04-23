---
title: "Three Stabs and One Cmd+Shift+."
description: "Fifteen minutes of engineering. Three failed attempts. The answer was three keystrokes."
date: 2026-04-23
tags: ["ai", "claude-code", "memory"]
series: "memorija-pamcenja"
draft: false
---

I wanted to browse my ideas folder in Obsidian. The folder lives at `~/.ideas/` - a hidden directory, because I like keeping my dotfiles tidy and because I have the aesthetic sensibilities of someone who still thinks `tree` is a valid UI.

One problem: Obsidian's vault picker doesn't show hidden folders. You open the file dialog, navigate to your home directory, and `~/.ideas/` simply isn't there.

So I asked Claude to fix it.

## Stab #1: the URI scheme

Claude's first instinct was to bypass the file picker entirely. Obsidian supports `obsidian://` URIs - maybe we could open the vault directly through a protocol handler.

```bash
open "obsidian://open?path=/Users/tibor/.ideas"
```

It didn't work. Obsidian requires the vault to be registered first, and you register vaults through... the file picker. The one that doesn't show hidden folders. Circular.

## Stab #2: the symlink

Next idea: create a visible symlink pointing to the hidden directory.

```bash
ln -s ~/.ideas ~/Ideas
```

This technically worked - Obsidian could see `~/Ideas` and open it. But now I had a visible `Ideas` folder cluttering my home directory, defeating the purpose of hiding it in the first place. And Obsidian would track it as a vault named "Ideas," not ".ideas," creating a naming mismatch everywhere.

I rejected it. Claude moved on.

## Stab #3: editing obsidian.json

The most creative attempt. Obsidian stores its vault registry in `~/.config/obsidian/obsidian.json`. Claude proposed editing this file directly to register the hidden path:

```json
{
  "vaults": {
    "some-generated-id": {
      "path": "/Users/tibor/.ideas",
      "ts": 1712000000000
    }
  }
}
```

It worked. One restart and the vault showed up. Problem solved.

Except it didn't feel solved. I was manually editing config files of a third-party app to do something that should be simple. What happens when Obsidian updates and overwrites the file? What if the format changes? Three stabs, each more deeper than the last, and even the one that worked left me uneasy.

## The three-keystroke problem

Something felt wrong about the entire approach. We'd spent fifteen minutes engineering around a file picker, and I couldn't shake the feeling that we were overthinking this.

"Have you tried searching online for how to show hidden folders in a macOS file dialog?"

Ten seconds later: **Cmd+Shift+.** - the standard macOS shortcut to toggle hidden files in any file picker. It's been there since macOS Sierra. You open the Obsidian vault picker, press Cmd+Shift+., and `~/.ideas/` appears. Done.

## Fifteen minutes I won't get back

The shortcut is trivial. Anyone who's used macOS long enough probably knows it. I probably knew it at some point and forgot. The question that stuck with me wasn't "why didn't I know this" - it was why neither of us thought to *look it up* before spending fifteen minutes engineering around a file picker.

Claude wasn't doing bad work. That's what made it weird. The URI scheme made sense. The symlink worked, technically. Editing the config was creative. Each attempt was a reasonable response to the problem as stated. We just never questioned whether the problem needed solving at all.

## So I wrote it down

That evening, I added this to my behavioral rules file:

```markdown
# Research Online Before Local Debugging

When a problem originates in a dependency or framework,
research online before attempting local fixes.

Local debugging of third-party issues is blind
trial-and-error. Online research typically surfaces
context in minutes that would take many failed
local attempts to approximate.
```

Notice what this rule *isn't*. It's not "Cmd+Shift+. toggles hidden files in macOS file pickers." That's a fact, and it's useful exactly once. This rule is about how to approach problems - any problem where the answer might already exist somewhere outside your local context. I touched on this split in the [first post](/blog/memorija-pamcenja). It turned out to be more important than I expected.

Anyway. Sometime later, it happened again.

Different project, different problem. Upgrading packages in a Next.js app, we hit a Turbopack build warning about unexpected files in the NFT list. Claude immediately started engineering local fixes:

1. Added `serverExternalPackages` to the Next.js config - didn't help because NFT tracing runs after externalization.
2. Tried a `turbopackIgnore` comment - didn't help because the dynamic requires were inside a transitive dependency, not our code.

Two attempts in, I paused. "Can you research this online first?"

Five minutes of searching revealed: it's a known Turbopack issue ([vercel/next.js#84960](https://github.com/vercel/next.js/issues/84960)), a partial fix was already merged upstream, the warning is cosmetic, and there's nothing to fix on the consumer side. The two local attempts were not just ineffective - they were impossible. There was no fix on our end.

The behavioral rule existed by then. I'd written it down after the Obsidian incident. Claude had read it at the start of this session. And it still went straight to local debugging.

## Rules don't work like you'd expect

Writing a rule down doesn't mean it gets followed every time. Claude read it, "knew" it, and still defaulted to the instinct of seeing a problem and immediately trying to fix it locally. That instinct is what makes it useful - and also what needs redirecting.

What the rule *did* do was give me a shared vocabulary. Instead of explaining from scratch why we should look this up, I could say "research first" and Claude immediately understood. Two words instead of a paragraph. So that's something.

But it's a weird place to be. I have a rule. It's written down. Claude reads it. And it still doesn't reliably follow it. I guess that's the next thing I need to figure out.
