# OpenSERP replacement analysis

Update: the later human-verification recovery successfully parsed two result pages and collected reviewable contact proposals. The isolated automated browser still failed. See `scrapers/outputs/openserp/recovery-report.md` and the verified-browser section of `scrapers/openserp/README.md`; the initial failure below is retained as history.

Researched and implemented 31 October 2026 for local, free company enrichment. No paid service was enabled.

## Research and decisions

- Reviewed the official [README](https://github.com/karust/openserp/blob/v0.8.17/README.md), [configuration](https://github.com/karust/openserp/blob/v0.8.17/config.yaml), [result schema](https://github.com/karust/openserp/blob/v0.8.17/core/result.go), [response schema](https://github.com/karust/openserp/blob/v0.8.17/core/response.go) and [Windows release](https://github.com/karust/openserp/releases/tag/v0.8.17).
- Version v0.8.17 has an approximately 10 MB Windows AMD64 archive and supports an existing Chrome binary. Verified its published SHA-256 before extraction. It does not require the old Python environment or Camoufox installation.
- Search results primarily expose titles, URLs and snippets. Additional SERP features may be present, but the schema does not guarantee dedicated phone/email/address fields. A separate website collector is therefore necessary.
- Disabled the upstream example's insecure TLS setting, external network binding, paid CAPTCHA solving, other engines and repeated source retries. Limited the browser pool to one and retained caching.
- Existing source records are facilities, so matching by company name alone is insufficient. Company website evidence requires distinctive name/domain and county agreement; exact branch contacts still require review.
- Public business emails must actually appear in source HTML, mailto links or structured data. No guessed addresses are generated. Phone links and structured addresses are collected with page-specific provenance.
- Imported values are preserved. Empty collected fields display `Not Available`; independent status fields distinguish missing data, unsearched companies and search failures.

## Live result

The local OpenSERP service started successfully. The first Google query, `ABACUS PHARMA Nairobi Kenya contact`, returned HTTP 429 with `error: blocked` and `error_detail: rate_limited`. It relates to existing profile `wholesale-3311`. The response is saved in `scrapers/outputs/openserp/probe.json` and imported once into the permanent attempt log. The queue stops after this block rather than repeating the same failed requests or changing engines silently.

This demonstrates that replacing the scraper did not resolve Google's access restriction on this connection. It does not establish that the queried company has no website, phone or email. No bulk run is represented as completed.

Google's [unusual-traffic explanation](https://support.google.com/websearch/answer/86640?hl=en) confirms that automated network traffic can trigger this response. OpenSERP's own README also states that browser mode does not eliminate CAPTCHA or rate limits.

## Replacement scope

Removed the old scraper paths and their active ignore/lint settings from the project. Because automatic approval review rejected permanent deletion, moved the old implementation, Python environment, vendor checkout, outputs and earlier research to a recovery archive outside this project. Retained previous data separately under the new output folder without presenting it as OpenSERP findings. The old code is not imported by the replacement.
