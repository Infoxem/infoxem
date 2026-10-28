# Data Enrichment: workflow research and design

This phase implements the interaction flow without choosing an AI provider or introducing a database. Searches return one clearly labeled, fictional Meridian Healthcare sample.

## Research findings

- **Apollo:** research starts from company/person context, produces structured fields, and makes results reusable on records. [AI Research Overview](https://knowledge.apollo.io/hc/en-us/articles/29193277882125-AI-Research-Overview).
- **Clay:** account research combines persistent company context with structured, auditable outputs. [Account Research Agents](https://university.clay.com/docs/account-research-agents).
- **Common Room:** organization research lives within the company profile, supports specific questions, and takes longer than a simple search. [Organization Research](https://www.commonroom.io/docs/using-common-room/roomie-ai/organization-research/).
- **Nielsen Norman Group:** long waits benefit from current-stage information, elapsed time, and completed/remaining steps. Use stages when reliable percentage estimates are unavailable. [Designing for Long Waits and Interruptions](https://www.nngroup.com/articles/designing-for-waits-and-interruptions/).

## Workflow

1. Validate company name and website, then create a browser-local preview session.
2. Navigate to `/enrichment/research/[id]` with company context, an animated intelligence visual, five named stages, elapsed time, and activity feedback.
3. Keep demo status visible. No stage claims that live sources were accessed.
4. Restore progress after refresh or returning from another page, using the saved start time. Blocked storage falls back to memory with a notification.
5. Persist cancellation. Restart resets the preview. Unknown or replaced sessions offer a new-search recovery path.
6. On completion, replace the progress route with `/enrichment/records/ENR-0001`.
7. Show overview, location, industry, products, keywords, experience, contacts, provenance, and data gaps. The report is refreshable and directly linkable.
8. Stack panels on small screens, respect reduced motion, and announce stage changes without announcing each clock tick.

## State model and integration boundary

Input -> running preview -> complete -> sample report.

Running -> cancelled -> restart -> running.

Missing or corrupt session -> recovery -> new search.

The current preview follows an explicit 14.5-second demo schedule. A future provider adapter should replace that schedule with genuine research events. Browser-local progress is not a durable background queue. No AI credentials, live research, or database are used in this phase. Live reports should show supporting sources, honest missing-data states, and genuine service-error recovery. The sample is never represented as verified research for an arbitrary submitted company.
