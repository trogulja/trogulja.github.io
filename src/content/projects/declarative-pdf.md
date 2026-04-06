---
title: declarative-pdf
description: An npm library for generating PDF documents from declarative HTML templates.
tags: ['Node.js', 'Puppeteer', 'npm']
status: Published
github: https://github.com/productiveio/declarative-pdf
npm: https://www.npmjs.com/package/declarative-pdf
order: 1
---

Generating PDFs programmatically is one of those things that sounds simple until you're three days in, questioning your career choices, and wondering why a page break just split a table row in half.

Most tools either hand you low-level drawing primitives ("place text at x:142, y:857") or expect you to learn some custom templating DSL. What we needed at Productive was neither. We needed: write HTML, get a proper PDF. With headers that repeat. Footers with page numbers. Page breaks that don't land in the middle of a sentence.

So I built it. declarative-pdf lets you write a document as plain HTML with a few semantic attributes — mark your header, footer, and content sections, and the library handles the rest. It figures out page breaks, repeats headers and footers, inserts page numbers, and renders the whole thing via Puppeteer.

The API is deliberately boring: pass in HTML, get back a PDF buffer. No config files. No build step. If you can write a `<div>`, you can use it.

It's been running in production at Productive for a while now — invoices, reports, all the unglamorous stuff that needs to look professional and not break when someone adds a second page. I open-sourced it because the problem is universal and the existing solutions were... not great.
