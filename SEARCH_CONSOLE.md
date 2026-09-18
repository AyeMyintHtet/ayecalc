# Search Console and SEO release checklist

Audience: worldwide English. Canonical origin: `https://www.ayecalc.com`.
The owner confirmed Search Console verification on September 18, 2026. No Search Console reports were accessed and no URLs were submitted during this change.

## Check before publishing

- Run `npm ci` and `npm run check` with Node 22.13 or newer. These checks run ESLint, TypeScript, and unit tests; they do not build or serve the site.
- Review desktop and mobile layouts, keyboard navigation, error states, and browser console output in your own environment.
- In `/ai-image-upscaler`, try a small JPEG, a transparent PNG, an odd-sized image, an oversized file, cancellation, retry, comparison, download, and transfer to the compressor. Confirm the image itself is absent from network requests. First use downloads model and runtime assets.
- Try saving, restoring, and forgetting settings in the image resizer. Reloading must not restore images. Next-step transfers work within the current tab only.
- Check the homepage and dedicated loan page at 0% interest, a normal rate, an empty field, and an invalid term. Check generated CSS at values above 1,000; code must not contain grouping commas.
- Run the deployment platform's release checks. No production build or local server was started by the assistant. Browser rendering, production bundling, and field Core Web Vitals remain owner checks.

## After deployment

1. Check that these URLs return HTTP 200 and the intended page, with a self-referencing `https://www.ayecalc.com` canonical:
   - `/ai-image-upscaler`
   - `/image-tools`
   - `/loan-calculator`
   - `/guides/ai-upscaling-vs-resizing`
2. Confirm the host permanently redirects HTTP and the non-www domain to the chosen HTTPS www origin, without a loop. Host redirects must be verified on the deployed hosting platform.
3. Open `/robots.txt` and `/sitemap.xml`. The sitemap must contain canonical, indexable pages with truthful modification dates. Google treats sitemap submission as a discovery hint, not a promise to index or rank. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
4. In the verified property, open **Sitemaps** and submit `https://www.ayecalc.com/sitemap.xml` if it is not already registered. For an existing sitemap, inspect its latest read and processing status instead of repeatedly submitting it.
5. Use **URL Inspection → Test live URL** for the four pages above. Check crawl access, rendered content, mobile usability, and the declared canonical. Once crawled, compare Google's selected canonical. Request indexing after the deployed page passes your review; repeated requests do not accelerate crawling. [Google recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
6. Validate structured data with Schema.org's validator and Google's Rich Results Test. WebApplication and BreadcrumbList describe the visible content; valid markup does not guarantee a rich result. Do not add fabricated ratings or expect general FAQ content to earn FAQ rich results.
7. Review Page indexing, HTTPS, and Core Web Vitals reports when data is available. A lack of field data is not evidence of a passing score.

## Measure and improve

- Save the deployment date and baseline Search Console performance for all countries. Compare equivalent periods with page, query, country, and device filters.
- Track impressions, clicks, CTR, and average position for the upscaler page and actual queries such as image upscaler or photo enhancer. These are target intents, not verified search-volume or trend claims.
- If impressions appear but CTR is weak, review the real queries and improve the title and description to match the page's actual capabilities. If a page is not indexed, inspect the reported reason, canonical, and rendered content before editing keywords.
- Use real feedback and recurring queries to prioritize further features. Avoid duplicate pages for “photo enhancer,” “image enhancer,” and “2× upscaler” when one tool serves the same task.
- Maintain useful sources, clear examples, working tools, and descriptive internal links. No implementation can guarantee a first-place Google ranking. [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Every future tool page

1. Choose one distinct task and canonical URL. Check the existing tool registry for overlapping intent.
2. Implement the usable tool with limits, errors, cancellation where needed, and independent reference cases.
3. Add a definition to `lib/developer-tools.ts` (or the appropriate registry) and a server page. Use `createPageMetadata` and the shared page template. Titles and descriptions must be unique and accurate.
4. Provide original instructions, a worked example, limitations, sources, and related links. Keep essential content server-rendered; do not load the AI model until the visitor starts processing.
5. Add the page to the relevant directory. Registry pages automatically enter the sitemap; standalone pages need an explicit entry. Redirect aliases must stay out of the sitemap.
6. Use an honest review date after a substantive change. Never reset all dates on deployment.
7. Update privacy and storage disclosures when behavior changes. Retain original image/model licenses and record model revisions.
8. Run `npm run check`, inspect the diff, ask the owner to review the UI, and repeat the post-deployment checks above.

No country-specific duplicate pages or invented `hreflang` variants are needed for the current single English version.
