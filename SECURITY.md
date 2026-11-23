# Security policy

## Reporting a vulnerability

Please report security problems privately, not in a public issue. Use GitHub's private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability** ([direct link](https://github.com/canalesb93/iron-untangled/security/advisories/new)).

Include what you found, how to reproduce it and what an attacker could do with it. You will get a reply on the report itself. This is a one-person fan project, so please allow a few days, and give a reasonable time for a fix before disclosing publicly.

## In scope

- The site at https://ironuntangled.app (and its `workers.dev` address): the static pages, assets and response headers in this repository.
- The reader-report endpoint, `POST /api/feedback` (`worker/`), which files GitHub issues on the reader's behalf. For example: getting it to post somewhere other than this repository, to bypass its validation or rate limits, or to leak its GitHub token.

## Out of scope

- Spoilers and factual errors. They matter a lot here, but they are not security issues: please use the in-app "Report an inaccuracy" button or open an issue (see [CONTRIBUTING.md](CONTRIBUTING.md)).
- Cloudflare's and GitHub's own platforms, and findings that need a compromised device or browser.
- Reports from automated scanners without a demonstrated impact, and denial of service by sheer volume.
