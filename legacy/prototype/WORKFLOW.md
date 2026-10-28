# Infoxem — product demonstration

Open `index.html` in a current browser. It is a standalone HTML file with embedded Inter, CSS, SVG icons, and browser interactions. No installation or network is required. The original prototype is preserved as `workflow-v1.html`.

## Current discovery workflow

The default screen is Companies with an empty primary search bar, empty additional filters, and **no records loaded**. People also starts empty. Users must submit a search, apply at least one filter, or explicitly choose an example search before discovery records appear.

### People

The primary search bar accepts a medicine, product category, country, or a combined query such as **Paracetamol in Kenya**. Product searches match people through their employer's product categories, while country queries use the person's location. Additional filters refine by company name/domain, job title, personal location (country, Kenyan county, optional city/region), industry, and professional keywords. The separate Keywords refinement continues to match professional name, role, skills, and biography rather than product associations.

### Companies

The primary search bar accepts medicines, product categories, countries, or combined queries. Additional filters refine by company name/domain, headquarters location, employee size range, industry, and business keywords. Company sizes use familiar employee bands: Self-employed, 1–10, 11–50, 51–200, 201–500, 501–1,000, 1,001–5,000, 5,001–10,000, and 10,001+.

Each filter group narrows the search; comma-separated alternatives within a text field broaden that group. Medicine keywords recognise acetaminophen as Paracetamol and antimalarial variants as the demonstration's antimalarial category. Filters and saved-list searches are independent across People and Companies.

### Apply, review, save

1. Type a medicine/product category or country in the prominent search bar. Editing the query or filters alone does not load records or alter previously applied results.
2. Select **Search**, press Enter in the search bar, or select **Apply filters** after adding refinements. Search and filters commit one combined set of criteria. A Kenya query also enables the county refinement without selecting Kenya a second time. Applied chips and a result count explain the current results; an Unapplied changes indicator distinguishes subsequent edits.
3. Inspect five-column results, sort, and paginate. Click a company for its detail screen or a person for their professional profile.
4. Bookmark specific people or companies. Saving a company does not save its employees, and saving a person does not save their company.
5. Use the **Discover** and **Saved** tabs inside the People or Companies screen. There are no separate Saved screens or sidebar destinations. The Saved tab contains only explicitly saved records of that screen's type, with its own optional filters and removal controls. Arrow keys, Home, and End switch tabs.
6. Return from company details to the same Discover or Saved view with criteria intact. Refresh resets discovery to its empty start; saved records persist when browser storage is available.

The filter panel keeps Apply filters visible on shorter desktop screens. Mobile layouts stack the filter panel and workspace; wide result tables scroll within the workspace.

## Data requests and detail screens

Company details retain the overview, business type, location, products, company contacts, LinkedIn placeholder, employee list, and missing-data indicators. Employee profiles expose available contacts and illustrative LinkedIn profiles. Both company details and employee tables support saving.

Request Data lets users select missing fields, add optional context, and record a browser-only request. It shows a reference and Pending status, prevents duplicate field requests, and combines multiple requests for the same company/person. Requests remain in their existing browser storage key.

## Existing enrichment journey

The earlier Enriched Companies and Data Enrichment flows remain available in the sidebar: CSV/sample import → choose fields → follow-up questions → review → simulated AI matching/enrichment/quality checks → browser-stored visual results. No actual AI, external database, live search, LinkedIn lookup, or email verification is connected.

The **Enrichment** navigation section follows the journey order: **Data Enrichment** for importing and enriching a list, then **Enriched Companies** for completed results. Actions use **Start enrichment**, **View enriched companies**, **View enrichment settings**, and **Enrich another list**. The empty results screen explains how to create the first enriched list. Discovery Companies and its Saved tab remain separate from imported enrichment results.

## Design research

Reviewed on 16 October 2026:

- [Apollo: search filters](https://knowledge.apollo.io/hc/en-us/articles/4412665755661-Use-Search-Filters-to-Find-Prospects) — separate role, company, geography, and industry criteria; narrowing between groups and alternatives within groups.
- [Apollo: People search](https://knowledge.apollo.io/hc/en-us/articles/4412658716941-Search-for-People) — distinguish personal location from employer geography.
- [Clay: Find People](https://university.clay.com/docs/find-people-overview) — role/company/location criteria and professional profile attributes.
- [Clay: company discovery](https://university.clay.com/fr/lessons/finding-companies-in-clay) — industry, headcount, location, and keyword filters.
- [Clay: Search](https://university.clay.com/docs/search) — choose People or Companies, refine in a filter panel, then save reviewed records.
- [LinkedIn Sales Navigator: advanced search](https://business.linkedin.com/sell/sales-navigator/advanced-search-filters) — separate people/company search and company headcount criteria.
- [Apollo product UI reference](https://www.apollo.io/product/b2b-data) — filters alongside people results, compact records, and a workspace layout.

Applied these patterns as an original Infoxem design: compact navigation, a persistent filter panel, restrained typography, a clear results toolbar, applied-filter chips, empty starting states, bookmark controls, and separate saved lists. No brand assets or product interfaces were copied.

## Demo boundaries and storage

- All companies, employees, industries, company sizes, products, and discovered contact values are fictional. Domains use `.example`; phones contain masked placeholders. This is not a verified pharmaceutical supplier list, a licensing record, or current stock information.
- Search runs against a small browser fixture directory. Kenya, Uganda, and Tanzania are available; Kenyan county fixtures cover Nairobi, Mombasa, Kisumu, Nakuru, and Kiambu.
- `infoxem-saved-entities-v1` stores independent saved record IDs; `infoxem-data-requests-v1` stores missing-data requests; `infoxem-demo-v2` stores the latest completed enrichment list. Storage is local to a browser/origin. If storage is unavailable, saves remain session-only and the interface reports the limitation.
- No requests or outbound messages are actually sent. There are no CRM, campaign, billing, authentication, or unrelated modules.
- Brand colors: Blue `#0145f2`, White `#ffffff`, Light Gray `#edf1f5`, Black `#000000`, with transparency for hierarchy. Inter is embedded for offline use; its license is in `INTER-LICENSE.txt`.
- `search-ui.css` and `search-ui.js` are editable source copies of the new discovery system, also embedded in `index.html`. The HTML file remains the standalone presentation artifact.

## Validation

Checked in a real browser: empty initial screens; required search/filter input; independent People/Companies criteria; company size, medicine, industry, keyword, job-title and location matching; professional-keyword separation from product matching; unapplied-edit behavior; five-column tables; bookmark/unbookmark; separate saved tabs; browser-refresh persistence; company-detail return state; person-profile saving; missing-data requests; mobile layouts; visibility of Apply filters on a 768px-high desktop; and access to the earlier enrichment journey.

The latest shared-search update was also checked for country-only queries, combined product/country queries, People employer-product matching, county/job-title refinements, Enter-key submission, Saved-tab search, mobile overflow, and short desktop layouts. The earlier exclusion of People product searches has been intentionally superseded by the latest request.

## HTML user-journey comments

The HTML file contains separately labelled SCREEN / FEATURE USER JOURNEY comment blocks for Home, Companies search, company details, People search, person details, Discover/Saved, Request Data, existing-list enrichment, and completed results. Each explains what the user does, what they see, and what happens next. Supporting comments beside each relevant feature describe the same user-facing flow rather than code internals. These comments are source documentation and do not appear in the visible UI.

The application scripts were checked to ensure this reorganisation of HTML comments did not change their contents.
