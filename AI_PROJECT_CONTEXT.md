# AyeCalc AI Project Context

Last updated: 2026-08-14

This is the single-file onboarding document for any AI model, developer, or new computer working on AyeCalc. Read it completely before making changes. It explains the product, codebase, owner preferences, quality standards, SEO strategy, monetization strategy, current risks, and required workflow.

`SKILLS.md` and `FLOW.md` contain expanded reference material, but this file is designed to provide enough context to begin safely by itself.

## 1. Product identity

- Product name: AyeCalc
- Production domain: `https://ayecalc.com`
- Product type: free calculators, converters, developer utilities, generators, formatters, estimators, and other useful search-driven web tools
- Example routes: `/loan-calculator`, `/percentage-calculator`, `/px-to-rem`, `/json-formatter`
- Brand promise: fast, accurate, private, clear, attractive, and easy to use
- Primary audience: people arriving from search who want an immediate answer or practical result
- Primary language at present: English

AyeCalc is not limited to traditional calculators. A page is a good fit when it satisfies a real searchable task with a useful interactive tool and enough original explanation to stand alone as a high-quality page.

## 2. Owner’s priorities

Every change should support these goals in this order:

1. Give users the correct result and help them understand it.
2. Build excellent organic search visibility for the AyeCalc brand and individual tool queries.
3. Maintain technically valid SEO and target 100 in all applicable Lighthouse categories.
4. Prepare the site to earn money through AdSense, other ad networks, affiliates, and direct sponsored links.
5. Keep the UI modern, attractive, responsive, accessible, and fast.

The owner wants `ayecalc.com` to rank first for the brand and relevant pages to compete for searches such as `loan calculator` and `px to rem`. First-place rankings and perfect Lighthouse scores cannot be guaranteed by code. Maximize eligibility and quality through correct technical work, genuinely useful content, authority, links earned through value, and ongoing measurement. Never use spam or deception.

## 3. Owner’s working preferences

These are standing instructions unless the owner explicitly changes them:

- Do not run `npm run build` after changes.
- Do not start localhost or run the development server.
- Ask the owner to check changes in their environment.
- Keep final responses brief.
- Do not explain implementation details unless the owner asks.
- Normally show only the files changed.
- Preserve unrelated owner changes in a dirty working tree.
- Do not deploy, publish, submit URLs, connect analytics, activate ads, or change external accounts without an explicit request.
- Use safe, non-destructive development practices.

## 4. Current technical stack

- Next.js 15 App Router
- React 19
- TypeScript with strict mode
- Global CSS
- `next/font` with Inter and Manrope
- npm with `package-lock.json`
- Import alias: `@/*`
- No database or external service is currently represented in the repository

Current important files:

- `app/layout.tsx`: root layout, global metadata, fonts, viewport
- `app/page.tsx`: current homepage, content, FAQ, and JSON-LD
- `components/calculator.tsx`: current client-side loan-payment calculator
- `app/globals.css`: complete visual system and responsive styles
- `app/sitemap.ts`: sitemap generation
- `app/robots.ts`: crawler rules
- `app/manifest.ts`: web-app manifest
- `app/opengraph-image.tsx`: generated 1200×630 social image
- `public/favicon.svg`: site icon
- `next.config.ts`: Next.js configuration
- `SKILLS.md`: detailed quality, SEO, advertising, and maintenance handbook
- `FLOW.md`: step-by-step implementation and validation flow

Prefer Server Components. Add `"use client"` only to the smallest boundary that needs state, effects, browser APIs, or interactive calculation behavior.

## 5. URL and information architecture

- Give every substantial tool one permanent canonical route targeting one primary intent.
- Use short, lowercase, hyphenated slugs matching natural searches.
- The correct loan route is `/loan-calculator`, not `/load-calculator`.
- The pixels-to-REM route is `/px-to-rem`.
- Do not add an unnecessary `calculator` suffix when the natural query and shorter tool name are clearer.
- Do not create near-duplicate pages for keyword variations.
- Do not create doorway pages, thin programmatic pages, location variants with no unique value, or pages whose only purpose is showing ads.
- Published route changes require permanent redirects plus updated links, canonicals, sitemap entries, and structured data.
- Every indexable page must be reachable through normal crawlable HTML links.

Planned categories can include:

- Finance
- Everyday Math
- Health
- Time and Date
- Converters
- Developer Tools
- Text and Data Tools

Category pages must provide context and useful navigation, not only link grids.

## 6. Standard tool-page blueprint

Every indexable calculator or utility page should contain:

1. Unique metadata title with the topic first and AyeCalc last.
2. Unique honest meta description.
3. One self-canonical production URL.
4. Intentional Open Graph and social metadata.
5. Breadcrumb navigation when useful.
6. Exactly one clear visible `h1` containing the natural tool name.
7. A concise introduction explaining the task and result.
8. A complete usable tool near the top.
9. Visible labels, units, defaults, constraints, validation, and accessible errors.
10. A result explanation with visible assumptions.
11. The formula, conversion rule, or transformation method.
12. Variable definitions and rounding policy when relevant.
13. At least one worked example when helpful.
14. Guidance for interpreting and using the result.
15. Limitations and appropriate financial, medical, tax, legal, or technical disclaimers.
16. Authoritative sources for external rules, rates, thresholds, or formulas.
17. Relevant FAQs only when the visible page answers them.
18. Descriptive internal links to related tools and guides.
19. A truthful reviewed or updated date for time-sensitive content.
20. Structured data that describes visible content and uses the canonical URL.

Avoid filler, repeated sections written only for word count, keyword stuffing, copied text, hidden content, fake freshness, and mass-generated low-value copy.

## 7. Calculator and utility correctness

Correctness is more important than ranking or visual design.

- Use established formulas and document assumptions.
- Keep pure calculation or transformation logic easy to test.
- Handle empty values, zero, negatives, decimals, minimums, maximums, invalid values, rounding, and large inputs as applicable.
- Do not silently replace a meaningful zero with another default.
- Make units and precision explicit.
- Label estimates as estimates.
- For `/px-to-rem`, explain that the usual default root font size is 16px and allow it to be changed.
- Cite authoritative sources when logic depends on external standards or current rules.
- Show the effective date for changing rates or regulations.
- Do not present results as professional financial, medical, tax, or legal advice.
- Never change a result, recommendation, default, or ranking because a sponsor paid for placement without a clear disclosure.

## 8. SEO requirements

### Metadata and indexing

- Use the Next.js Metadata API.
- Align title, description, canonical, Open Graph data, `h1`, visible content, and primary search intent.
- Use absolute production URLs for canonical, social metadata, structured data, and sitemap output.
- Index only complete, useful canonical pages.
- Draft, duplicate, internal search, empty, private, and unfinished pages should be excluded or `noindex` as appropriate.
- Add a route to `app/sitemap.ts` only when it is ready for indexing.
- Sitemap `lastModified` values must reflect actual content changes, not the current request or deployment time.
- Do not rely on `robots.txt` to remove an indexed URL; use the correct indexing control.
- Keep important content server-rendered and available without waiting for client interaction.

### Structured data

- Use only schema types that truthfully match the page, such as `WebSite`, `WebPage`, `BreadcrumbList`, and an appropriate application type.
- JSON-LD content must also be visible to users where applicable.
- FAQ schema requires matching visible questions and answers and does not guarantee a rich result.
- Never fabricate aggregate ratings, reviews, prices, usage counts, credentials, awards, or authors.
- Use the canonical page URL consistently across entities.
- Validate syntax and eligibility before release.

### Content and authority

- Build topic clusters around strong tools, related tools, and useful guides.
- Prevent keyword cannibalization; consolidate competing pages.
- Use descriptive internal-link anchors.
- Cite original or authoritative primary sources for facts that require evidence.
- Do not purchase spam links, exchange links at scale, hide links, cloak pages, or generate fake engagement.
- Improve pages using real Search Console queries and user needs rather than stuffing keywords.

## 9. Image, link, form, and accessibility rules

- Use `next/image` for content images unless a generated or special asset has a clear reason not to.
- Give meaningful images concise contextual alt text.
- Give decorative images empty alt text or appropriate presentational treatment.
- Always reserve image dimensions or aspect ratio.
- Do not place essential instructions only inside images.
- Use links for navigation and buttons for actions.
- Use descriptive link text instead of `click here`.
- Give every control an accessible name and visible keyboard focus.
- Keep touch targets normally at least 44×44 CSS pixels.
- Associate every input with a visible label and unit.
- Use suitable input types, modes, constraints, autocomplete, and inline errors.
- Do not rely on color alone for results, status, or validation.
- Announce dynamic results accessibly without producing disruptive repeated announcements.
- Preserve landmarks and logical heading order.
- Meet WCAG 2.2 AA contrast and interaction requirements.
- Respect `prefers-reduced-motion`.
- Test keyboard order, zoomed text, mobile layout, long content, and error states.

## 10. UI direction

- Maintain the existing AyeCalc identity: dark green, mint accents, warm paper backgrounds, Manrope headings, Inter body text, clean geometry, and gentle depth.
- Use design tokens for colors, typography, spacing, radii, shadows, and motion.
- Keep interfaces attractive but quieter than the user’s task.
- Design mobile-first, then support tablet, laptop, and wide desktop.
- Provide hover, focus, active, loading, empty, invalid, and disabled states where applicable.
- Avoid intrusive modals, forced sign-up, autoplay, excessive decoration, horizontal overflow, and motion that blocks use.
- Prefer progressive enhancement and small client components.
- Reuse patterns when repetition becomes real; do not create premature abstraction for a single page.

## 11. Performance and Lighthouse targets

Target mobile Lighthouse scores of 100 for Performance, Accessibility, Best Practices, and SEO, but treat Lighthouse as a diagnostic snapshot rather than proof of ranking or field performance.

Core Web Vitals targets at the 75th percentile:

- LCP: 2.5 seconds or less
- INP: 200 milliseconds or less
- CLS: 0.1 or less

Implementation rules:

- Keep client JavaScript and hydration work small.
- Avoid unnecessary packages and third-party scripts.
- Load fonts through `next/font` and limit families and weights.
- Reserve stable dimensions for images, calculators, results, consent UI, and ads.
- Lazy-load below-the-fold media and noncritical advertising.
- Do not put ad or analytics code on the critical rendering path.
- Measure real-user Core Web Vitals after release when instrumentation exists.
- Never claim a 100 score without running the actual audit on the relevant page and device profile.

## 12. Monetization strategy

AyeCalc will eventually earn money from Google AdSense, other ad networks, affiliate links, and direct sponsor placements. Monetization must never make the site deceptive, difficult to use, slow, or untrustworthy.

### Readiness

Before ads launch:

- Build enough original tools and supporting content for the site to have clear publisher value.
- Remove unverified claims and unfinished routes.
- Publish About, Contact, Privacy Policy, Cookie Policy, Terms, Disclaimer, and advertising or affiliate disclosure pages.
- Confirm navigation, crawlability, mobile usability, accessibility, and policy eligibility.
- Ensure no page has more advertising or paid promotion than publisher content.

### Connecting AdSense

1. The owner creates and controls the AdSense account.
2. Add `ayecalc.com` to the AdSense Sites list.
3. Verify ownership using the account-provided AdSense snippet, `ads.txt` line, or meta tag.
4. Site-wide AdSense code belongs in the document head and must contain the owner’s exact `ca-pub-...` ID.
5. If used, `public/ads.txt` must resolve at `https://ayecalc.com/ads.txt` with `200 OK` and exact verified records. A typical Google line is:

   ```text
   google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
   ```

6. Do not replace the example until the owner supplies the real publisher ID.
7. Ensure crawlers are not blocked by robots, authentication, middleware, redirects, or security headers.
8. Complete account tasks and wait until the site is marked `Ready` before claiming ads can serve.
9. Create stable, clearly named responsive units and record their real slot IDs.
10. Configure appropriate consent before eligible advertising requests.

### Next.js ad architecture

- Load one official asynchronous provider script at root level; never one loader per slot.
- Keep publisher and slot mappings in centralized configuration.
- Use an explicit production feature flag plus a site-wide emergency kill switch and per-placement switches.
- Keep live ads disabled in local development, tests, and preview deployments.
- Use a focused client `AdSlot` component for manual AdSense units.
- Initialize each mounted unit once and guard React rerenders and client navigation from duplicate pushes.
- Preserve `crossOrigin="anonymous"` and the exact account-provided loader URL.
- Do not modify creative, intercept clicks, auto-refresh, animate ads, or pass calculator data into ad targeting.
- Do not weaken Content Security Policy broadly to make ads load.
- Use provider adapters for additional networks instead of scattering scripts through pages.

### Safe placement

For a calculator or utility page:

- Keep the `h1`, introduction, complete tool, inputs, result, and essential result explanation uninterrupted.
- The first ad may be placed after the complete tool section with generous separation from result, reset, copy, download, and calculate actions.
- Another ad may appear between substantial explanatory sections.
- A final ad may appear before related tools or near the end when enough original content exists.
- An optional desktop rail must have a stable column, never overlap content, and collapse safely on small screens.

For home and category pages:

- Do not interrupt the header, hero, navigation, or first primary action.
- Place ads only between complete content sections.
- Start with few placements and measure impact on tool discovery.

Never place ads inside or directly beside buttons, inputs, menus, results, copy areas, download controls, pagination, or other frequent click targets. Never make an ad resemble a tool, result, notification, navigation item, or required next step. Never ask users to click ads or “support us” through ads.

Use a neutral visible label such as `Advertisement` when a label is present. Do not use arrows, animation, misleading headings, or nearby images to attract unnatural attention.

### Auto ads

- Prefer intentional manual placements at launch.
- Test Auto ads later with preview and experiments.
- Exclude navigation, forms, result cards, buttons, sticky tool controls, and other interactive regions.
- Use page exclusions for legal, error, unfinished, low-value, or intentionally ad-free pages.
- Review in-page, overlay, anchor, vignette, and intent-driven formats separately; never enable everything by default.
- Document account-side exclusions and experiments because they are not visible in repository code.

### Consent and privacy

- Use a Google-certified CMP integrated with the IAB Transparency and Consent Framework for AdSense traffic in the EEA, UK, and Switzerland when required by current Google rules.
- Google Privacy & messaging or a reviewed certified third-party CMP may be used.
- Do not assume non-personalized ads are automatically consent-free.
- Allow users to understand, reject where required, and later change their choices.
- Consent UI must be accessible and free from dark patterns.
- The Privacy Policy must truthfully explain providers, purposes, cookies or storage, beacons, IP addresses, identifiers, sharing, retention, and user choices.
- Apply consent requirements to analytics and affiliate tracking too.
- Seek appropriate legal advice when regional requirements are uncertain.

### Layout stability and speed

- Give every ad container a breakpoint-specific reserved size using dimensions, `min-height`, or an appropriate aspect ratio.
- Do not collapse an in-flow empty slot immediately if that creates layout shift.
- Prefer below-the-fold lazy-loaded units.
- Keep ads away from the LCP region when possible.
- Measure LCP, INP, CLS, long tasks, transfer size, and user engagement before and after changes.
- Disable a harmful placement first, fix it, and only then restore it.

### Affiliate links and direct clickable sponsors

- Clearly label direct placements as `Sponsored` or `Advertisement`.
- Add `rel="sponsored"` to paid and affiliate links; combine with `nofollow` when appropriate.
- If opening a new tab, use `noopener noreferrer` and avoid surprising users.
- Put a clear affiliate disclosure near relevant links and keep a complete disclosure page.
- Never wrap or alter network-rendered ads to create a custom clickable area.
- Never let sponsor payment secretly affect formulas, results, default values, or editorial rankings.
- Avoid fake scarcity, misleading downloads, disguised redirects, and unsupported claims.
- Never add user-entered data or personal data to advertiser URLs.
- Record campaign owner, destination, creative, disclosure, tracking, dates, and review status.
- Remove expired offers and test destinations, HTTPS, redirects, mobile behavior, and claims regularly.

### Invalid traffic

- The owner, developers, testers, friends, and contractors must never click live AyeCalc ads.
- Never automate or repeatedly generate impressions, clicks, or refreshes.
- Never buy low-quality traffic, use click exchanges, bots, paid-to-click programs, or encourage ad clicks.
- Monitor sources, geography, pages, devices, CTR anomalies, repeated requests, and server logs.
- If suspicious traffic appears, preserve evidence, stop the source or placement, investigate, and use the provider’s reporting process when appropriate.

### Maintenance schedule

- After relevant releases: verify loader, consent, visible placements, console, network requests, dimensions, and kill switch.
- Weekly: review Policy Center, account messages, site status, `ads.txt`, suspicious traffic, CTR anomalies, broken units, and expiring campaigns.
- Monthly: compare RPM, revenue, viewability, coverage, engagement, Core Web Vitals, consent, and mobile behavior by placement.
- Quarterly: reread provider and privacy policies, audit legal pages and disclosures, review account access, test affiliate links, and reassess ad density.
- Keep a monetization change log with date, provider, page scope, unit or campaign ID, placement, hypothesis, metrics, consent impact, performance impact, and rollback plan.

### Troubleshooting missing or broken ads

Check in this order:

1. Account active, correct domain in Sites, and `Ready` status.
2. Exact production publisher ID and slot ID, not placeholder or staging values.
3. One `adsbygoogle.js` loader in rendered output; inspect Network and console for CSP, DNS, or `ERR_BLOCKED_BY_CLIENT` errors.
4. Confirm an ad request is sent after the slot mounts.
5. Confirm the slot has nonzero width, supported dimensions, is visible, and is initialized once.
6. Confirm the CMP and regional consent signals work as intended.
7. Check Policy Center, page eligibility, restrictions, content value, and inventory availability.
8. Open `/ads.txt`; verify `200 OK`, plain text, exact formatting, correct account ID, and crawler access.
9. Check every breakpoint for overlap, zero-width ancestors, and unsupported CSS modifications.
10. Retest production without an ad blocker while never clicking the ad.

For policy enforcement, read the exact issue, audit the entire affected site scope, fix the root cause, and request review only after compliance. For CLS, reserve the correct size. For slow pages, reduce units or formats and move noncritical ads below the fold.

Current official references to recheck before ad work:

- [Connect a site to AdSense](https://support.google.com/adsense/answer/7584263)
- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938)
- [AdSense Program policies](https://support.google.com/adsense/answer/48182)
- [Ad placement policies](https://support.google.com/adsense/answer/1346295)
- [AdSense code modifications](https://support.google.com/adsense/answer/1354736)
- [Responsive ad code](https://support.google.com/adsense/answer/9183363)
- [Set up Auto ads](https://support.google.com/adsense/answer/9261307)
- [Auto ads page exclusions](https://support.google.com/adsense/answer/9262311)
- [`ads.txt` crawlability](https://support.google.com/adsense/answer/7679060)
- [Google-certified CMP requirements](https://support.google.com/adsense/answer/13554020)
- [Prevent invalid traffic](https://support.google.com/adsense/answer/1112983)
- [Troubleshoot missing ads](https://support.google.com/adsense/answer/10858959)
- [AdSense Policy Center](https://support.google.com/adsense/answer/9485926)
- [Fix policy issues](https://support.google.com/adsense/answer/7003627)
- [Qualify sponsored links for Search](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)
- [Prevent layout shift from ads](https://web.dev/articles/optimize-cls)

## 13. Current known project risks and backlog

These items were observed in the current repository and should be verified or fixed before public claims or serious monetization:

- Homepage JSON-LD contains an aggregate rating of `4.9` with `1240` ratings. Remove it unless real evidence supports it.
- Homepage UI contains a `1,240,000+ calculations this month` claim. Remove it unless measured evidence supports it.
- Homepage category counts such as `18 calculators` and `24 calculators` must reflect real published tools.
- Category cards currently link to a homepage calculator fragment instead of real crawlable category or tool routes.
- Homepage loan `SoftwareApplication` schema uses the homepage URL; dedicated loan schema and content belong on `/loan-calculator` when that page exists.
- The sitemap currently creates `lastModified` with the current date. Replace it with truthful content update dates.
- A dedicated `/loan-calculator` page is not currently represented in the known file list.
- A dedicated `/px-to-rem` page is not currently represented in the known file list.

Do not silently preserve misleading content because it already exists.

## 14. Required development flow

For every request:

1. Read this file and inspect the current relevant code.
2. Identify the user task, search intent, canonical route, inputs, formula or transformation, output, edge cases, and content needs.
3. Check for existing pages that compete for the same intent.
4. Plan server and client boundaries, responsive layout, metadata, structured data, internal links, and future ad-safe spaces.
5. Implement correctness first, then content, SEO, accessibility, UI polish, and performance.
6. Keep unrelated files and owner changes untouched.
7. Review the final diff statically for TypeScript, links, metadata, claims, schema, accessibility, and responsive risks.
8. Do not run the production build or start localhost.
9. Ask the owner to check the result in their environment.

For a new tool, define before coding:

- Primary search query
- Canonical slug
- Exact user goal
- Inputs and units
- Valid ranges and error states
- Formula or transformation rule
- Rounding and precision
- Defaults and assumptions
- Primary and secondary outputs
- Independent reference cases
- Unique content outline
- Sources and disclaimers
- Structured-data choice
- Related internal links
- Safe future ad locations

## 15. Owner verification checklist

Ask the owner to check:

- Results match independent reference cases.
- Mobile and desktop layouts work without horizontal scrolling.
- Long text, zoom, keyboard navigation, and visible focus work.
- Inputs, validation, result updates, buttons, and links behave correctly.
- Browser console has no errors.
- Mobile and desktop Lighthouse have no unresolved issues.
- Structured-data validators and Rich Results Test have no blocking errors.
- Canonical, robots directives, sitemap, Open Graph preview, and production status code are correct.
- If monetization is active: consent, disclosures, `ads.txt`, provider requests, reserved dimensions, placement separation, and Policy Center status are correct.

## 16. Definition of done

A change is done only when:

- It solves the requested user problem.
- Calculation or utility behavior is correct across relevant edge cases.
- Content is useful, original, and honest.
- Metadata, canonical, indexing, internal links, and structured data agree.
- Accessibility and responsive behavior are ready for owner verification.
- Performance and future monetization were considered.
- Ads, affiliate links, and claims comply with the current rules when present.
- No unrelated files were changed.
- No production build or localhost server was started by the assistant.
- The owner was asked to verify the result.

## 17. Guidance for the next AI model

- Treat this file as project memory, not as proof that the repository is unchanged. Inspect current files before acting.
- Treat external SEO, privacy, browser, framework, and advertising rules as time-sensitive. Verify current primary documentation when implementing them.
- Do not promise rankings, approval, revenue, or perfect scores.
- Do not invent facts to make the website appear established.
- Prefer a smaller number of excellent pages over a large number of thin pages.
- Prefer a smaller number of safe ads over aggressive placement.
- Prefer correct, accessible, fast tools over decorative complexity.
- When the owner asks for a change, implement it within scope, preserve their work, and hand back only the changed file links unless more detail is requested.
