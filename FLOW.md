# AyeCalc Development Flow

Use this workflow for every feature, page, calculator, converter, developer utility, content update, and visual change.

## 1. Understand the request

- Identify the user problem, primary search intent, and desired route.
- Confirm whether the work affects a calculator or utility, content, navigation, metadata, structured data, accessibility, performance, or future advertising.
- Inspect the relevant existing files and preserve established patterns where they still meet `SKILLS.md`.
- Check for overlapping routes or pages that could target the same search intent.

## 2. Define the page before coding

For a new calculator or utility page, record:

- Primary query: for example, `loan calculator` or `px to rem`.
- Canonical route: for example, `/loan-calculator` or `/px-to-rem`.
- User goal: the exact decision, conversion, transformation, or answer the tool supports.
- Inputs, units, valid ranges, defaults, and error states.
- Formula or transformation rule, rounding policy, assumptions, and authoritative sources.
- Primary result and any useful secondary results.
- Unique title, description, `h1`, introduction, method, example, guidance, limitations, FAQ, and related links.
- Appropriate structured-data types supported by visible content.
- Potential ad locations that do not interfere with the tool or answer.

Do not start a new indexable page if it would be thin, duplicative, or factually unsupported.

## 3. Plan the implementation

- Keep the route page server-rendered.
- Put only interactive calculation state inside a focused Client Component.
- Reuse shared layout, navigation, content, metadata, and tool patterns when repetition becomes real.
- Prefer native platform and Next.js capabilities over new dependencies.
- Plan stable dimensions for media, dynamic results, consent elements, and future ad slots.
- Define mobile behavior before adding decorative complexity.

## 4. Implement the calculator or utility

- Use a documented, testable calculation or transformation function.
- Sanitize and constrain inputs without preventing valid real-world values.
- Cover zero interest, empty input, decimals, boundaries, invalid values, and large values as relevant.
- Make rounding and displayed precision intentional.
- Display units, formats, defaults, and assumptions beside the relevant inputs or results.
- Provide a useful initial server-rendered page while keeping interactivity fast.
- Use visible labels, helpful validation, accessible status updates, and complete keyboard operation.

## 5. Implement the search page

- Add unique Metadata API values and a self-canonical.
- Use exactly one natural, visible `h1` for the main topic.
- Place the calculator or utility and a plain-language introduction near the top.
- Add original supporting content that fully satisfies the query.
- Add method, formula, worked example, interpretation, limitations, disclaimer, and helpful FAQs where appropriate.
- Add relevant breadcrumb and related-tool links using crawlable anchors.
- Add truthful JSON-LD that matches visible content and the canonical route.
- Add the finished canonical route to the sitemap with a truthful update date.
- Ensure robots settings allow the page only when it is ready for indexing.

## 6. Apply the UI quality gate

- Check narrow mobile, wide mobile, tablet, desktop, zoomed text, and long-content behavior.
- Check visual hierarchy, alignment, spacing, contrast, typography, and content density.
- Check every control’s hover, focus, active, invalid, and disabled states.
- Confirm touch targets, keyboard order, landmarks, headings, labels, and status announcements.
- Confirm motion is restrained and reduced-motion preferences are respected.
- Confirm decorative elements do not create horizontal overflow or cover content.

## 7. Apply the SEO quality gate

- The route is short, stable, correctly spelled, and uses lowercase hyphens.
- Title, description, canonical, Open Graph data, headings, and on-page intent agree.
- Content is unique, visible, useful, and server-rendered where possible.
- The page is reachable through normal internal links and has helpful outgoing internal links.
- Images have correct dimensions, loading behavior, formats, and alt treatment.
- Structured data is syntactically valid, eligible, visible-content-aligned, and free of unsupported claims.
- The sitemap contains only the canonical production URL and an honest `lastModified` value.
- There are no broken links, redirect chains, accidental `noindex`, duplicate canonicals, or orphan pages.
- There are no fabricated metrics, ratings, reviews, testimonials, or expertise claims.
- The page does not compete with another AyeCalc page for the same primary intent.

## 8. Apply the performance and monetization gate

- Minimize client JavaScript and third-party work.
- Prevent layout shifts from results, images, fonts, consent UI, and future ads.
- Keep the primary tool and answer clear above advertising.
- Ensure planned ad slots cannot be confused with navigation or tool controls.
- Keep ad and analytics code absent until explicitly requested and correctly consented.
- Protect LCP, INP, and CLS budgets defined in `SKILLS.md`.

When the owner explicitly requests monetization work:

- Read the complete Advertising and monetization handbook in `SKILLS.md` and recheck its current official sources.
- Classify the integration as AdSense, another ad network, affiliate links, or a direct sponsor campaign.
- Confirm the account, production domain, approval state, publisher IDs, slot or campaign IDs, consent provider, disclosures, and legal pages.
- Choose intentional placements before adding scripts and document why each placement is safe.
- Implement one provider loader, centralized configuration, stable responsive containers, consent behavior, feature flags, and an emergency kill switch.
- Keep live ads disabled in local, test, and preview environments.
- Verify production requests and rendered placement without clicking any live ad.
- Record placement IDs, account-side Auto ad exclusions, experiments, consent settings, launch date, metrics, and rollback steps.

## 9. Validate without starting the app

Project-owner rule: do not run `npm run build` and do not start localhost.

- Review the final diff for accidental or unrelated edits.
- Inspect TypeScript, metadata, routes, links, content claims, and JSON-LD statically.
- Use existing non-server checks only when they are relevant and do not invoke a production build.
- Do not claim a Lighthouse score without a real test.
- Ask the owner to check the page in their environment and run mobile and desktop Lighthouse.

Owner verification checklist:

- Calculator, converter, or utility results match independent reference cases.
- Layout works on mobile and desktop with no horizontal scrolling.
- Keyboard navigation and visible focus work throughout.
- Browser console has no errors.
- Lighthouse reports no unresolved Performance, Accessibility, Best Practices, or SEO issues.
- Rich Results Test and schema validation report no blocking errors.
- Canonical, robots directives, sitemap entry, Open Graph preview, and production status code are correct.
- If monetization is enabled, consent, disclosures, `ads.txt`, placement separation, provider requests, policy status, and reserved slot dimensions are correct.

## 10. Release and measure

Only perform these actions when the owner explicitly requests them:

- Deploy the completed page.
- Verify the production URL returns `200` and is not blocked from indexing.
- Submit or refresh the sitemap in Google Search Console.
- Request indexing for the canonical URL when appropriate.
- Monitor indexing, Core Web Vitals, impressions, queries, click-through rate, engagement, and tool errors.
- Improve content based on real user needs and search data, not keyword stuffing.
- Recheck time-sensitive formulas, rules, sources, disclosures, and page review dates.

Ranking improvement is an ongoing cycle of technical health, correct calculations, valuable content, authority, internal linking, backlinks earned through usefulness, and measured iteration.

## Definition of done

A change is complete only when:

- It solves the requested user problem.
- Calculation or utility behavior and edge cases are correct.
- It follows the page, SEO, accessibility, performance, and monetization rules in `SKILLS.md`.
- Claims and structured data are truthful and supported.
- Mobile and desktop behavior are ready for owner verification.
- No unrelated files were changed.
- The owner has been asked to check the result; no local server or production build was started by the assistant.
