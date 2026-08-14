# AyeCalc Project Handbook

This file is the persistent project context for every AyeCalc change. Read it together with `FLOW.md` before editing the application.

## Product mission

AyeCalc is a fast, trustworthy collection of free online calculators, converters, developer utilities, and practical web tools at `https://ayecalc.com`.

Every change must support these priorities, in order:

1. Help people complete a calculation, conversion, or practical task correctly and understand the result.
2. Earn sustainable organic search visibility through useful, original, technically valid pages.
3. Keep the site ready for responsible AdSense and affiliate monetization without harming trust or usability.
4. Deliver a modern, attractive, accessible, responsive interface.

First-place Google rankings and perfect Lighthouse scores are goals, not outcomes that code alone can guarantee. Never use spam, misleading claims, fabricated signals, or poor UX to chase them.

## Current project

- Framework: Next.js 15 App Router
- Language: TypeScript with strict mode
- UI: React 19 and global CSS
- Fonts: `next/font` with Inter and Manrope
- Main site URL: `https://ayecalc.com`
- Path alias: `@/*`
- Current calculator: client component at `components/calculator.tsx`
- Global metadata: `app/layout.tsx`
- Search files: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`
- Social image: `app/opengraph-image.tsx`
- Global styles: `app/globals.css`

Keep Server Components as the default. Add `"use client"` only to the smallest interactive calculator or UI boundary that needs browser state.

## Non-negotiable SEO rules

### Search intent and URLs

- Give every substantial calculator or utility one permanent, crawlable page for one primary search intent.
- A tool does not need to be a traditional calculator. Converters, developer utilities, generators, formatters, estimators, and other useful search-driven tools are in scope.
- Use short, lowercase, hyphenated slugs that match natural search intent: `/loan-calculator`, `/percentage-calculator`, `/px-to-rem`, `/json-formatter`.
- Use the correct calculator name in the slug. The target loan route is `/loan-calculator`, not `/load-calculator`.
- Use the shortest clear route for utilities. For example, the pixels-to-REM tool belongs at `/px-to-rem`.
- Do not create near-duplicate doorway pages for minor keyword variants.
- Never change a published URL without a permanent redirect and updated internal links, sitemap entries, canonicals, and structured data.
- Link calculator cards and related tools to real routes, not placeholder fragments.

### Page content contract

Every indexable calculator or utility page must have:

- Unique metadata title and description aligned with the page intent.
- One self-canonical URL matching the production route.
- One clear, visible `h1` containing the natural tool name.
- A concise introduction that explains what the tool does.
- A usable calculator or utility visible early on the page.
- Server-rendered explanatory content with original value beyond the form itself.
- A plain-language result explanation and visible assumptions.
- The formula, conversion rule, or processing method, with variable definitions where useful.
- At least one worked example when it improves understanding.
- Guidance about how to use and interpret the result.
- Relevant limitations and financial, health, tax, or legal disclaimers.
- Useful internal links to related tools, calculators, converters, and relevant guides.
- Visible last-reviewed or last-updated information when facts can change.
- A helpful FAQ only when the questions and answers are also visible on the page.

Avoid filler, repetitive introductions, keyword stuffing, hidden text, copied content, mass-generated thin pages, and claims that cannot be verified.

### Metadata and indexing

- Generate page metadata with the Next.js Metadata API.
- Keep titles descriptive and distinct. Put the primary topic first and the brand last.
- Keep descriptions honest, useful, and unique; do not treat a character count as more important than clarity.
- Use absolute production URLs for canonical, Open Graph, structured data, and sitemap output.
- Set an intentional Open Graph title, description, image, and image alt text for important pages.
- Index only complete, useful production pages. Drafts, search results, private pages, duplicate variants, and empty category pages must be `noindex` or excluded.
- Add every canonical public tool page to `app/sitemap.ts` only when it is ready to index.
- Use a truthful `lastModified` value based on actual content updates. Do not generate a new timestamp on every request or deployment when content did not change.
- Keep `robots.ts` permissive for public pages and do not rely on `robots.txt` as a substitute for `noindex`.

### Structured data

- Structured data must describe visible page content and use the canonical page URL.
- Prefer relevant, supported schema such as `WebSite`, `WebPage`, `BreadcrumbList`, and an appropriate application type for a real calculator.
- Add `FAQPage` only when the same FAQ content is visible and eligible under current search-engine guidance.
- Never add fabricated reviews, ratings, authors, usage counts, prices, credentials, or awards.
- Do not expect structured data to guarantee a rich result.
- Validate JSON-LD syntax and confirm there are no conflicting entities or URLs.

### Trust and calculator accuracy

Calculator and utility pages can influence important work and decisions, so accuracy and trust outrank keyword targeting.

- Use established formulas and document all assumptions.
- For converters and developer utilities, state defaults and transformation rules clearly. For example, `/px-to-rem` must show that the default root font size is normally 16px and allow the user to change it.
- Handle zero values, decimals, minimums, maximums, invalid input, rounding, and unusually large values.
- Label estimates as estimates.
- Cite authoritative sources when a formula, threshold, rate, rule, or recommendation comes from an external authority.
- Show dates for time-sensitive rates or rules.
- Do not present AyeCalc as professional financial, medical, tax, or legal advice.
- Do not publish invented social proof or activity metrics.

## Images and media

- Use `next/image` for content images unless a framework-generated image has a specific reason not to.
- Every meaningful image needs concise, contextual alt text.
- Decorative images use empty alt text or the appropriate presentational treatment; do not describe decoration to screen readers.
- Always define intrinsic dimensions or a stable aspect ratio to prevent layout shift.
- Serve correctly sized modern formats and avoid oversized assets.
- Do not put essential explanatory text only inside an image.
- Give Open Graph images a 1200 by 630 layout and accurate alt text.

## Links, buttons, and forms

- Use links for navigation and buttons for actions.
- Every interactive control needs an accessible name and a visible keyboard focus state.
- Link text must describe its destination; avoid ambiguous text such as “click here.”
- Keep touch targets comfortably usable, normally at least 44 by 44 CSS pixels.
- Associate every input with a visible label and include units in visible text.
- Use appropriate input types, modes, constraints, autocomplete values, and error messages.
- Do not communicate an error or result through color alone.
- Result updates must be understandable to assistive technology without becoming disruptive.
- Do not create clickable cards with invalid nested interactive elements.
- External links opened in a new tab must be intentional and safe.

## UI and accessibility

- Aim for a polished, current visual style without sacrificing speed or clarity.
- Maintain a consistent design-token system for color, type, spacing, radius, shadow, and motion.
- Design mobile-first and verify common mobile, tablet, laptop, and wide-screen layouts.
- Preserve semantic landmarks and a logical heading hierarchy.
- Meet WCAG 2.2 AA contrast and interaction requirements.
- Respect `prefers-reduced-motion` and avoid motion that blocks tool use.
- Provide hover, focus, active, loading, empty, error, and disabled states where applicable.
- Avoid intrusive popups, forced sign-up, autoplay, layout jumps, and deceptive interfaces.
- Prefer progressive enhancement: essential content and tool meaning must not disappear when client JavaScript is delayed.

## Performance and Lighthouse

Target a mobile Lighthouse score of 100 in Performance, Accessibility, Best Practices, and SEO while prioritizing real-user Core Web Vitals.

- LCP target: 2.5 seconds or less at the 75th percentile.
- INP target: 200 milliseconds or less at the 75th percentile.
- CLS target: 0.1 or less at the 75th percentile.
- Keep JavaScript small and isolate client components.
- Avoid unnecessary packages, third-party scripts, animations, and hydration work.
- Reserve dimensions for tools, media, banners, consent UI, and advertisements.
- Load below-the-fold media and nonessential third-party code lazily.
- Keep font families and weights limited and use `next/font`.
- Do not block rendering with analytics or advertising code.
- Treat Lighthouse as a diagnostic snapshot, not proof of ranking or real-user speed.

## Advertising and monetization handbook

AyeCalc should be AdSense-, affiliate-, and direct-sponsor-ready, but content quality, user trust, tool usability, policy compliance, and performance always come before revenue.

Advertising policies and privacy requirements change. Before implementing or repairing monetization, recheck the current official policies linked in the source-of-truth section below. Never rely only on the date or wording in this file.

### Ownership and authorization

- The owner must create and control every advertising, affiliate, consent, analytics, payment, and tax account.
- Never invent a publisher ID, ad-slot ID, affiliate ID, seller record, company identity, consent choice, or approval status.
- Do not activate ads until the owner explicitly requests it and supplies the production identifiers.
- Publisher and slot IDs are visible in the browser and are not application secrets, but store them in centralized configuration so staging and production cannot be confused.
- Payment, identity, tax, API-secret, and account-login information must never be placed in public environment variables or committed to the repository.
- AdSense and Google Ads are different products: AdSense pays publishers to display ads; Google Ads is used to buy advertising traffic.

### Site readiness before applying

- Build a useful site with original tools, substantial supporting content, clear navigation, and no empty or under-construction routes.
- Remove or correct fabricated metrics, ratings, reviews, testimonials, authorship, and expertise claims.
- Publish accurate About, Contact, Privacy Policy, Cookie Policy, Terms, Disclaimer, and advertising or affiliate disclosure pages.
- Make the site usable on mobile and desktop, accessible without forced interactions, and crawlable without authentication.
- Ensure all pages intended for monetization comply with Google Publisher Policies and content restrictions.
- Do not place Google-served ads on low-value pages, empty states, error pages, navigation-only screens, or pages with more ads and paid promotion than publisher content.
- A page being indexable or receiving traffic does not by itself make it suitable for ads.

### Connecting AyeCalc to Google AdSense

When the owner is ready to connect AdSense:

1. Add the exact production domain `ayecalc.com` to the AdSense Sites list.
2. Choose an ownership-verification method supplied by AdSense: the AdSense code snippet, an `ads.txt` entry, or the account-specific meta tag.
3. If using the AdSense snippet, place the exact account-provided script in the site-wide document head and confirm it appears on production pages.
4. If using `ads.txt`, create `public/ads.txt` so it resolves at `https://ayecalc.com/ads.txt` with `200 OK`. Use only entries copied from verified advertising accounts. A typical Google record has this form:

   ```text
   google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
   ```

5. Replace the example publisher ID with the owner’s real AdSense publisher ID. Do not guess the relationship value or certification-authority ID for another network.
6. Make sure `robots.txt`, authentication, middleware, redirects, and security headers do not block the AdSense crawler or `/ads.txt`.
7. Complete the account tasks and request site review in AdSense. Do not claim that ads can serve until the site status is `Ready`.
8. Create clearly named responsive ad units for intentional placements and record each account-provided slot ID.
9. Configure regional consent before sending advertising requests where consent is required.
10. Verify the production implementation, policy status, responsive behavior, accessibility, and Core Web Vitals before increasing ad coverage.

AdSense review and ad availability are controlled by Google; passing technical checks does not guarantee approval, fill, revenue, or a review time.

### Next.js implementation architecture

- Load the official AdSense loader once at the root layout level, not once per ad unit. Use the exact account-provided URL containing `client=ca-pub-...` and preserve `crossOrigin="anonymous"`.
- Use the Next.js script mechanism or another framework-supported implementation that keeps the script asynchronous and non-render-blocking. Confirm the final production HTML and network request match Google’s current instructions.
- Gate live advertising behind an explicit production feature flag. Development and preview environments should render a labeled placeholder and must not request live ads by default.
- Create a small reusable client-side `AdSlot` component for manual units. Its inputs should include a stable placement name, verified slot ID, format, responsive behavior, and reserved-size class.
- Keep publisher configuration and placement mapping centralized. Never scatter raw publisher or slot IDs throughout page components.
- Initialize a manual unit only after its `<ins class="adsbygoogle">` element mounts and only once for that mounted element. Guard client-side route transitions and React rerenders from duplicate pushes.
- Do not rewrite, wrap, intercept, resize, animate, refresh, or trigger clicks on Google ad creative except through modifications explicitly allowed by Google.
- Never put an AdSense unit inside an anchor, button, draggable area, swipe target, calculator label, form control, result card, or other clickable container.
- Do not pass calculation values, user input, personal data, or sensitive page state to an ad network through attributes, URLs, targeting values, or analytics events.
- If a Content Security Policy is introduced, integrate the ad provider using its current CSP guidance. Do not weaken the whole policy merely to make an ad appear.
- Keep an emergency site-wide kill switch and per-placement feature flags so a broken, slow, or noncompliant unit can be disabled without redesigning pages.

### Manual units versus Auto ads

- Prefer a small number of intentional manual placements at launch because AyeCalc pages contain dense interactive controls.
- Auto ads may be tested later through the AdSense preview and experiment tools.
- When using Auto ads, exclude navigation, calculator inputs, result panels, copy buttons, menus, sticky controls, and any region where an injected ad could cause accidental clicks or hide content.
- Use page exclusions for pages that should not contain Auto ads, such as legal pages, error pages, unfinished tools, or deliberately ad-free landing pages.
- Review overlay, anchor, vignette, intent-driven, and in-page formats individually. Do not enable every format by default.
- Run a controlled experiment before site-wide changes, then compare revenue, engagement, complaints, and Core Web Vitals.
- Google-provided Auto ad exclusions and experiments are account settings; document them in the repository’s monetization record even though they are not represented in code.

### Recommended placement strategy

Every ad must be visually separate from the product interface and associated with real publisher content.

For tool and calculator pages:

- Keep the page title, introduction, complete primary tool, inputs, result, and essential result explanation free from interruption.
- A first manual unit may appear after the complete tool section, with generous separation from result, calculate, reset, copy, or download controls.
- A second unit may appear naturally between substantial long-form content sections after the visitor has received useful content.
- An optional final unit may appear before related tools or near the end of the article when the page has enough original content.
- A desktop sidebar unit is acceptable only when it has its own stable column, never covers content, remains separated from controls, and collapses cleanly on smaller screens.

For category and homepage layouts:

- Do not interrupt the brand header, hero message, primary navigation, or first call to action.
- Place ads only between complete content sections with clear separation and adequate original content around them.
- Start with fewer placements on the homepage and measure whether they harm discovery of tools.

Never:

- Put an ad directly beside or inside a button, input, dropdown, menu, result, copy action, download action, pagination control, previous or next link, or other high-interaction element.
- Make an ad look like AyeCalc content, a recommended tool, a system alert, a result, navigation, or a required next step.
- Use arrows, animation, images, headings, or copy to draw unnatural attention to an ad.
- Ask visitors to click, view, or support the site through ads, or offer a reward for doing so.
- Overlay ads on publisher content or allow content to overlay ads.
- Place ads in pop-ups, pop-unders, new windows, email content, browser extensions, or non-approved software contexts.
- Auto-refresh ad units or programmatically open, redirect, inspect, or alter an advertiser destination.
- Allow the combined amount of ads, affiliate promotions, and sponsored material to exceed the page’s publisher content.

If a visible heading is used for an ad container, use an honest neutral label such as `Advertisement`. Never use a misleading heading. Maintain sufficient visual spacing on every breakpoint; there is no universal safe pixel distance for calculator controls.

### Responsive ads and layout stability

- Use responsive ad units unless a verified fixed size is intentionally required.
- Give every slot a stable container with breakpoint-specific `min-height`, fixed dimensions, or an appropriate aspect ratio before the request begins.
- Choose reserved sizes based on allowed formats and real production measurements, not arbitrary oversized whitespace.
- Do not collapse an in-flow slot immediately when no ad fills; removing reserved space can create another layout shift.
- Keep ads out of the initial LCP region when possible and lazy-load noncritical below-the-fold slots.
- Load the provider script asynchronously once and measure its impact on LCP, INP, CLS, long tasks, transfer size, and interaction responsiveness.
- If an ad harms the page’s CLS or covers content, disable that placement first and fix its container before restoring it.
- Do not hide normal ad code with unsupported CSS. Use only responsive behaviors and modifications allowed by the provider’s current documentation.

### Consent and privacy

- Do not treat a privacy policy as a substitute for valid consent where consent is legally required.
- For AdSense traffic in the EEA, UK, and Switzerland, use a Google-certified consent management platform integrated with the IAB Transparency and Consent Framework when required by current Google rules.
- Google’s Privacy & messaging CMP is an available option; a certified third-party CMP may also be used after reviewing cost, performance, regional coverage, accessibility, and data processing.
- Do not assume non-personalized ads are automatically consent-free. Configure storage and ad requests according to applicable law, the certified CMP, and current provider documentation.
- Users must be able to understand their choices, reject as easily as they accept where required, and later revisit or withdraw consent.
- Keep the consent UI keyboard-accessible, readable, responsive, and free from dark patterns.
- The Privacy Policy must accurately disclose advertising data collection, sharing, usage, cookies or local storage, web beacons, IP addresses, identifiers, providers, purposes, retention, and user choices.
- Apply the correct consent behavior to analytics and affiliate tracking as well as advertising.
- Never store a visitor’s consent choice only in an undocumented component state.
- Obtain appropriate legal review when regional privacy, children’s privacy, health data, or financial data requirements are uncertain.

### Affiliate links, direct sponsors, and other clickable ads

- Distinguish network-rendered ads from AyeCalc-authored affiliate or sponsor cards. Never wrap or modify network-rendered ads to create a custom clickable region.
- Clearly label direct sponsor placements as `Sponsored` or `Advertisement` and make the destination and offer understandable before the click.
- Add `rel="sponsored"` to paid, affiliate, and compensated outbound links. `nofollow` may be combined when appropriate, but `sponsored` is the preferred relationship signal.
- When an external sponsored link intentionally opens a new tab, also use `noopener noreferrer` and communicate the behavior when it may surprise the user.
- Place a clear affiliate disclosure near the relevant recommendation and maintain a complete site-wide disclosure page.
- Never let payment determine an undisclosed editorial ranking, calculator result, default input, formula, or recommendation.
- Do not use fake comparison tables, false scarcity, preselected paid offers, misleading download buttons, disguised redirects, or claims not supported by the advertiser’s current terms.
- Use first-party redirect or click tracking only when it is transparent, secure, privacy-compliant, and does not cloak the final destination from users or search engines.
- Do not include user-entered calculator data, email addresses, or other personal data in outbound ad or affiliate URLs.
- Add campaign start and end dates, owner, destination URL, creative, disclosure text, tracking parameters, and review date to the campaign record.
- Expire or remove outdated offers promptly and regularly test destination status, HTTPS, redirects, mobile usability, claims, and disclosure.
- Sponsored images must have defined dimensions and appropriate alt text. A sponsor card must remain accessible without relying only on the image.
- Paid outbound links must not be included in structured data as editorial recommendations unless the schema truthfully supports that relationship.

### Adding another ad network

- Review the network’s publisher policies, privacy terms, data processors, script security, supported regions, ad quality controls, payment terms, `ads.txt` or `sellers.json` requirements, and conflict rules before integration.
- Use a provider adapter and feature flag rather than embedding third-party code directly across pages.
- Load only the active provider for a placement. Do not auction, stack, refresh, or rotate networks unless the selected platforms explicitly support the implementation.
- Add only the exact `ads.txt` seller lines issued by the approved account.
- Map the provider into the consent platform before any request that requires consent.
- Apply the same placement, accessibility, content-density, performance, disclosure, and invalid-traffic standards used for AdSense.
- Remove a provider promptly if it serves deceptive creative, unsafe redirects, forced downloads, malware, policy-breaking content, or unacceptable performance regressions.

### Invalid traffic prevention

- The owner, developers, testers, friends, and contractors must never click live AyeCalc ads, including for testing or to discover the destination.
- Do not repeatedly reload production pages to generate impressions and never automate impressions, clicks, or ad interactions.
- Do not ask visitors to click ads, purchase low-quality traffic, use traffic exchanges, paid-to-click programs, bots, or work with partners that generate suspicious traffic.
- Keep live ads disabled in local development, automated tests, visual regression runs, and preview deployments.
- Monitor traffic sources, geography, pages, devices, sudden CTR changes, repeated requests, and server logs for suspicious patterns.
- Use URL channels, custom channels, or stable placement names so anomalies can be isolated.
- If suspicious activity appears, preserve evidence, stop the suspect traffic source or placement, review logs and provider reports, and use Google’s invalid-click contact process when appropriate.
- Do not attempt to conceal invalid traffic or repeatedly recreate disabled accounts.

### Measurement and maintenance

Measure revenue without optimizing for accidental clicks.

- Track page RPM, ad RPM, viewability, fill or coverage, estimated earnings, engagement, bounce behavior, Core Web Vitals, consent rate, and policy status by page type and placement.
- Treat an unexpected CTR spike as a possible placement or traffic-quality problem, not automatically as success.
- Compare performance by stable placement ID and device; do not change multiple variables at once during an experiment.
- Keep a monetization change log containing date, page scope, provider, unit or campaign ID, placement, hypothesis, consent impact, performance impact, and rollback method.
- Check the AdSense Policy Center, Sites status, messages, and `ads.txt` status regularly and after significant releases.
- Review the Search Console Ad Experience Report when available and correct experiences that violate Better Ads Standards.
- Review responsive placement and Core Web Vitals after layout, navigation, consent, or ad-format changes.
- Recheck privacy disclosures, affiliate disclosures, account users, payment details, expiring campaigns, broken destinations, and provider policies on a recurring schedule.
- Use experiments or measured staged rollouts; keep the simpler, less intrusive placement when revenue improvement is small or user impact is unclear.

Minimum maintenance rhythm after ads launch:

- After every relevant release: verify the loader, consent path, visible placements, console, network requests, responsive sizing, and emergency switch.
- Weekly: review the Policy Center, account messages, site and `ads.txt` status, suspicious traffic, CTR anomalies, broken units, and campaign expiration.
- Monthly: compare revenue and engagement by placement, review Core Web Vitals and ad viewability, test mobile layouts, and remove low-value or disruptive units.
- Quarterly: re-read provider and privacy policies, audit disclosures and legal pages, review account access and providers, test affiliate destinations, and reassess ad density.

### Troubleshooting ads that do not show

Check these in order:

1. **Authorization:** Confirm the owner’s AdSense account is active, `ayecalc.com` is in Sites, and its status is `Ready`.
2. **Identifiers:** Compare the rendered publisher ID and slot ID character-for-character with the AdSense account. Confirm production did not receive placeholder or staging configuration.
3. **Loader:** Inspect the rendered document and browser Network panel for `adsbygoogle.js`. Load it once and look for blocked, CSP, DNS, or `ERR_BLOCKED_BY_CLIENT` errors.
4. **Request:** Filter the Network panel for ad requests and inspect browser console errors. A loaded script does not prove that a unit request was initialized.
5. **Component lifecycle:** Confirm the `<ins>` element has a nonzero width when initialized, is mounted only once per request, is not hidden, and is not receiving duplicate `push` calls after React rerenders or client navigation.
6. **Consent:** Confirm the CMP is active in the visitor’s region and passes the required signals. A rejected or missing consent path may intentionally prevent or limit ads.
7. **Policy and inventory:** Check the Policy Center, page restrictions, account notices, and whether the page has enough eligible publisher content. A technically correct slot can remain blank when no eligible ad is available.
8. **`ads.txt`:** Open `/ads.txt` directly and confirm `200 OK`, plain text, exact publisher ID, valid comma-separated formatting, crawler access, and no redirect or HTML fallback.
9. **Responsive container:** Confirm supported dimensions at each breakpoint, no overlap, no zero-width ancestor, and only Google-approved responsive modifications.
10. **Environment:** Retest in a normal production browser without an ad blocker or privacy extension, while continuing to avoid clicking live ads.

For layout shifts, reserve or correct the slot size and retest field and lab CLS. For slow interaction, reduce units and formats, keep ads below the fold, and inspect long tasks. For a Policy Center enforcement, read the exact issue and example, audit the entire affected scope, fix the root cause, and request review only after the site is genuinely compliant. Keep an emergency switch available while repairs are underway.

### Official advertising sources

Last reviewed: 2026-08-14. Recheck these sources before monetization work:

- [Connect a site to AdSense](https://support.google.com/adsense/answer/7584263)
- [Google Publisher Policies](https://support.google.com/adsense/answer/10502938)
- [AdSense Program policies](https://support.google.com/adsense/answer/48182)
- [Ad placement policies](https://support.google.com/adsense/answer/1346295)
- [Allowed and prohibited AdSense code modifications](https://support.google.com/adsense/answer/1354736)
- [Responsive ad-code guidance](https://support.google.com/adsense/answer/9183363)
- [Set up Auto ads](https://support.google.com/adsense/answer/9261307)
- [Exclude pages from Auto ads](https://support.google.com/adsense/answer/9262311)
- [Make `ads.txt` crawlable](https://support.google.com/adsense/answer/7679060)
- [Google-certified CMP requirements](https://support.google.com/adsense/answer/13554020)
- [Prevent invalid traffic](https://support.google.com/adsense/answer/1112983)
- [Troubleshoot missing ads with DevTools](https://support.google.com/adsense/answer/10858959)
- [Use the AdSense Policy Center](https://support.google.com/adsense/answer/9485926)
- [Fix policy issues and request review](https://support.google.com/adsense/answer/7003627)
- [Qualify paid outbound links for Google Search](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)
- [Optimize layout shift from ads](https://web.dev/articles/optimize-cls)

## Content and internal-link strategy

- Build topic clusters instead of isolated pages: a strong tool page, related calculators or utilities, and genuinely helpful supporting guides.
- Use descriptive internal-link anchors and link only where the destination helps the reader.
- Ensure every indexable page is reachable through normal HTML links.
- Category pages must contain useful context and real navigation, not only a grid of links.
- Avoid publishing many pages before each one meets the full page content contract.
- When two pages compete for the same intent, consolidate them instead of creating keyword cannibalization.
- Group tools in meaningful categories such as Finance, Math, Health, Time, Converters, and Developer Tools while keeping every important tool reachable through crawlable links.

## Current facts that must be verified before launch

The current homepage contains catalog counts, a monthly calculation count, and aggregate-rating structured data. Keep these only if they are backed by real, current evidence; otherwise remove them. The homepage loan application schema should not substitute for dedicated schema and content on `/loan-calculator`.

## Project working rules

- Read this file and `FLOW.md` before implementation.
- Preserve unrelated user changes in the working tree.
- Do not run `npm run build` after changes unless the owner explicitly changes this instruction.
- Do not start localhost or run the development server. Ask the owner to check the result in their environment.
- Do not publish, deploy, submit a sitemap, connect analytics, or activate ads without an explicit request.
- Keep explanations brief unless the owner asks for details.
