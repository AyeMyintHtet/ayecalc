import { createPageMetadata } from "@/lib/metadata";

export type InfoSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: { title: string; text: string };
};

export type InfoPageDefinition = {
  slug: string;
  title: string;
  description: string;
  introduction: string;
  category: string;
  reviewed: string;
  sections: InfoSection[];
};

export const infoPages: InfoPageDefinition[] = [
  {
    slug: "about",
    title: "About AyeCalc",
    description:
      "Learn what AyeCalc builds, how its calculators and developer tools are designed, and the principles used to keep results clear and trustworthy.",
    introduction:
      "AyeCalc is a collection of free calculators, converters, developer utilities, and practical guides designed to turn a numerical task into a clear, understandable result.",
    category: "About the site",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "mission",
        title: "What AyeCalc is for",
        paragraphs: [
          "The site focuses on useful tasks people need to complete: converting units, checking design values, estimating quantities, and understanding the method behind an answer. Tools are intended to work quickly without requiring an account.",
          "AyeCalc currently emphasizes CSS, frontend-development, and unit-conversion workflows. New pages should add a distinct practical capability rather than exist only as a keyword variation.",
        ],
      },
      {
        id: "principles",
        title: "Product principles",
        paragraphs: [
          "Correctness and clarity come before traffic or monetization. Every substantial tool should show its assumptions, units, formula or transformation rule, rounding behavior, limitations, and an example where that context helps.",
        ],
        bullets: [
          "Keep calculations local to the browser when a network request is unnecessary.",
          "Use primary or authoritative references for standards and fixed conversion factors.",
          "Design for keyboard access, readable contrast, responsive layouts, and stable results.",
          "Avoid fabricated ratings, usage claims, credentials, testimonials, and artificial urgency.",
        ],
      },
      {
        id: "scope",
        title: "What the tools can and cannot do",
        paragraphs: [
          "A calculator applies its documented inputs and rules. It cannot infer missing real-world context, measurement uncertainty, local regulations, professional judgment, or project-specific requirements that were not supplied.",
          "Results should be independently reviewed when they affect financial, medical, tax, legal, safety, or other consequential decisions. AyeCalc provides informational utilities rather than professional advice.",
        ],
      },
      {
        id: "improvement",
        title: "How the site improves",
        paragraphs: [
          "Pages are reviewed when formulas, technical standards, product behavior, or supporting guidance changes. Visible review dates describe content review; they are not automatically refreshed on every deployment.",
          "The methodology page describes the implementation and verification standards applied to AyeCalc tools in more detail.",
        ],
      },
    ],
  },
  {
    slug: "methodology",
    title: "Calculation & Content Methodology",
    description:
      "See how AyeCalc selects formulas and sources, handles inputs and rounding, reviews tool limitations, and publishes supporting technical content.",
    introduction:
      "This methodology explains how AyeCalc turns a formula, conversion factor, or transformation rule into an interactive tool and a useful reference page.",
    category: "Trust and accuracy",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "sources",
        title: "Formula and source selection",
        paragraphs: [
          "Established definitions and primary technical sources are preferred. CSS behavior is checked against W3C specifications, accessibility thresholds against W3C WCAG material, framework behavior against official framework documentation, and physical conversion factors against measurement authorities such as NIST.",
          "When a value changes over time, the page should identify its effective date and source. Fixed definitions are distinguished from estimates, conventions, and configurable project assumptions.",
        ],
      },
      {
        id: "implementation",
        title: "Calculation implementation",
        paragraphs: [
          "Pure arithmetic and transformation logic is kept separate from presentation where practical. Interactive state runs in focused browser components, while formulas, examples, tables, guidance, and limitations remain available as server-rendered page content.",
        ],
        bullets: [
          "Handle empty, zero, decimal, boundary, negative, invalid, and unusually large values as relevant.",
          "Reject impossible contextual values such as a zero font-size divisor.",
          "Keep internal precision until display formatting is applied.",
          "State the displayed precision and remove unnecessary trailing zeros.",
          "Reserve stable space for changing results to reduce layout movement.",
        ],
      },
      {
        id: "review",
        title: "Static and owner verification",
        paragraphs: [
          "Code changes receive static TypeScript and targeted calculation checks without treating those checks as proof of every browser behavior. The site owner reviews the rendered pages on mobile and desktop, checks keyboard operation and console output, and runs production-oriented audits before release.",
          "A visible review date records when the content and assumptions were deliberately assessed. It should not imply continuous monitoring or professional certification.",
        ],
      },
      {
        id: "corrections",
        title: "Limitations and corrections",
        paragraphs: [
          "AyeCalc aims for accurate results but does not guarantee that every page is error-free or suitable for every purpose. Standards, frameworks, browser behavior, and legal requirements can change.",
          "When a material error is confirmed, the preferred response is to correct the calculation and its explanation together, update the review date truthfully, and avoid preserving a misleading result for search traffic.",
        ],
        callout: {
          title: "Independent checks still matter",
          text: "For important work, compare the result with a primary source, a second implementation, or a qualified professional as appropriate.",
        },
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description:
      "Read how AyeCalc handles calculator inputs, browser processing, standard hosting data, cookies, advertising, and future policy updates.",
    introduction:
      "AyeCalc is designed so ordinary calculator and converter inputs can be processed in the browser without being submitted to an AyeCalc calculation API.",
    category: "Privacy",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "inputs",
        title: "Calculator and tool inputs",
        paragraphs: [
          "The current calculators and developer tools perform their arithmetic in browser memory. Values entered into those tool fields are not intentionally transmitted to AyeCalc for calculation or stored in a user profile.",
          "The background remover passes the selected image to a worker inside the browser. The selected image is not intentionally uploaded to AyeCalc, Hugging Face, or jsDelivr for processing, and the generated PNG remains a local browser object unless the visitor chooses to download it.",
          "Do not enter confidential, personal, regulated, or security-sensitive information into a public web tool unless the page explicitly supports that use and explains the handling involved.",
        ],
      },
      {
        id: "technical-data",
        title: "Standard technical data",
        paragraphs: [
          "Like most websites, the hosting and delivery infrastructure may process standard request information needed to deliver and protect the site. This can include IP address, request time, requested URL, browser or device information, referrer, response status, and security-related logs.",
          "The exact infrastructure and retention behavior may depend on the production hosting provider. AyeCalc should update this policy when additional analytics, monitoring, forms, advertising, or other data-processing services are introduced.",
        ],
      },
      {
        id: "third-parties",
        title: "Analytics, advertising, and third parties",
        paragraphs: [
          "The current application code does not include live advertising or analytics integrations. External reference links lead to third-party websites with their own privacy practices.",
          "When a visitor starts the background remover, the browser downloads machine-learning model files from Hugging Face and WebAssembly runtime files from jsDelivr. Those asset requests can expose standard request information such as IP address, browser details, referrer, and request time to those providers, but AyeCalc does not intentionally include the selected image in the requests.",
          "If analytics, advertising, affiliate tracking, consent management, or another third-party service is enabled later, AyeCalc must update the relevant disclosures and consent behavior before or alongside that launch.",
        ],
      },
      {
        id: "choices",
        title: "Your choices and policy updates",
        paragraphs: [
          "Browser settings can control cookies, site storage, and some request information. Blocking essential requests may prevent the site from loading, while non-essential technology should not be required unless clearly explained.",
          "Material changes to this policy should be published here with a truthful updated date. Privacy questions can be sent to ayemyinthtet099@gmail.com through the public AyeCalc contact channel.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    description:
      "Understand AyeCalc's current use of cookies and browser storage, how future analytics or advertising would be handled, and available browser controls.",
    introduction:
      "The current AyeCalc application does not intentionally set non-essential cookies for calculator inputs, advertising, or behavioral analytics.",
    category: "Privacy",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "current-use",
        title: "Current use of cookies",
        paragraphs: [
          "Calculator values are held in temporary component state while the page is open. The current tool implementation does not require a user account or a persistent calculation-history cookie.",
          "After the background remover is started, the browser may store downloaded model and runtime files in its cache so they do not need to be downloaded for every image. This functional cache contains software assets rather than the selected image or generated PNG and can be cleared through browser site-data controls.",
          "The production hosting platform or security layer may use strictly necessary technical mechanisms for delivery, abuse prevention, load management, or security. Those mechanisms should be documented here when the final production configuration is confirmed.",
        ],
      },
      {
        id: "future-services",
        title: "Future analytics and advertising",
        paragraphs: [
          "If AyeCalc introduces analytics, advertising, personalization, affiliate tracking, or consent storage, the implementation must identify the provider, purpose, data involved, duration, and available user controls.",
          "Where consent is required, non-essential storage and related requests should wait for a valid choice. Rejecting should be as understandable and accessible as accepting, and a visitor should be able to revisit the choice.",
        ],
      },
      {
        id: "controls",
        title: "Browser controls",
        paragraphs: [
          "Most browsers let visitors inspect, block, or remove cookies and site data. These controls vary by browser and device. Removing strictly necessary data can affect security or site operation.",
          "A browser's global privacy setting is not a substitute for accurate site disclosure or legally required consent behavior. AyeCalc will update this page if its storage practices change.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Use",
    description:
      "Review the general conditions for using AyeCalc tools and content, including acceptable use, result limitations, external links, and updates.",
    introduction:
      "These terms describe the general conditions for using AyeCalc. By using the site, you agree to use its tools and content lawfully and to apply independent judgment to the results.",
    category: "Terms",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "service",
        title: "Informational service",
        paragraphs: [
          "AyeCalc provides calculators, converters, developer utilities, and educational material for general informational purposes. Access may change, be interrupted, or be discontinued, and a particular tool may not support every jurisdiction, browser, project, or professional use case.",
          "You are responsible for checking inputs, assumptions, units, sources, and the suitability of a result before relying on it.",
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use",
        paragraphs: [
          "You may use the public interface for ordinary personal, educational, and professional calculations. You may not use the site to disrupt its operation, bypass security, introduce malicious code, scrape it abusively, misrepresent its results, or violate applicable law or another person's rights.",
        ],
        bullets: [
          "Do not attempt unauthorized access to systems or accounts.",
          "Do not automate requests in a way that degrades service for others.",
          "Do not present AyeCalc output as professional certification.",
          "Do not copy substantial site content in a way that falsely implies ownership or affiliation.",
        ],
      },
      {
        id: "warranties",
        title: "Accuracy and availability",
        paragraphs: [
          "AyeCalc works to document formulas and correct confirmed errors, but the site and its results are provided without a guarantee that they are complete, continuously available, error-free, or appropriate for a particular purpose.",
          "To the extent permitted by applicable law, you remain responsible for decisions made using the site and for obtaining professional or authoritative review when the stakes require it.",
        ],
      },
      {
        id: "links-updates",
        title: "External links and updates",
        paragraphs: [
          "External links are provided for context or reference. AyeCalc does not control third-party content, availability, security, or policies.",
          "These terms may be updated when the service or legal requirements change. The displayed review date should reflect a real review rather than an automated deployment timestamp. These general terms should receive appropriate legal review before commercial launch in a specific jurisdiction.",
        ],
      },
    ],
  },
  {
    slug: "disclaimer",
    title: "Calculator & Information Disclaimer",
    description:
      "Understand the limitations of AyeCalc estimates, conversions, technical examples, external sources, and professional-use decisions.",
    introduction:
      "AyeCalc provides informational calculations and technical examples. Its outputs are not professional financial, medical, tax, legal, engineering, accessibility-certification, or other regulated advice.",
    category: "Disclaimer",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "results",
        title: "Results depend on inputs and assumptions",
        paragraphs: [
          "A calculation can be mathematically correct and still be inappropriate for a real decision if an input, unit, context, rule, or assumption is wrong. Review every displayed assumption and use values from authoritative sources for the specific situation.",
          "Rounded display values should not be treated as more precise than the original measurement. Keep adequate precision during further calculations and round the final result according to the task.",
        ],
      },
      {
        id: "technical",
        title: "Developer and accessibility tools",
        paragraphs: [
          "Generated CSS and code snippets are starting points. Browser support, framework versions, inheritance, build configuration, content, and user settings can change the rendered result.",
          "A passing color ratio or generated fluid type value is not an accessibility certification. Evaluate the complete interface against applicable WCAG requirements and real interaction conditions.",
          "Automatic background removal is an estimated segmentation result. Review fine edges, transparent materials, shadows, and missing foreground detail before publishing or relying on the generated image.",
        ],
      },
      {
        id: "professional",
        title: "Important decisions require independent review",
        paragraphs: [
          "Do not rely on AyeCalc as the sole basis for financial commitments, health decisions, tax filings, legal obligations, safety calculations, regulatory compliance, or other consequential actions.",
          "Consult an appropriately qualified professional or authoritative body where required. If two sources disagree, stop and resolve the underlying definitions and effective rules before proceeding.",
        ],
        callout: {
          title: "Use the method as well as the answer",
          text: "AyeCalc exposes formulas, sources, and limitations so a result can be checked instead of accepted blindly.",
        },
      },
    ],
  },
  {
    slug: "advertising-disclosure",
    title: "Advertising & Affiliate Disclosure",
    description:
      "Read AyeCalc's current advertising status and the standards that would apply to future ads, affiliate links, and sponsored placements.",
    introduction:
      "AyeCalc does not currently include live advertising or affiliate integrations in the application code. This disclosure describes the standards that apply if monetization is introduced later.",
    category: "Transparency",
    reviewed: "August 17, 2026",
    sections: [
      {
        id: "current-status",
        title: "Current monetization status",
        paragraphs: [
          "The current site code does not load an advertising network, render live ad units, or attach affiliate identifiers to outbound links. External references on tool and guide pages are included for technical context rather than compensation.",
          "This status can change only through an intentional implementation and account setup controlled by the site owner. The page and privacy disclosures must be updated when that happens.",
        ],
      },
      {
        id: "future-labeling",
        title: "How paid relationships will be labeled",
        paragraphs: [
          "Future network advertising should appear in stable, visually separate containers and should never be disguised as a calculator result, navigation item, system message, download button, or recommended next step.",
          "Affiliate and direct-sponsor links should be labeled clearly near the recommendation and use the appropriate sponsored link relationship. Payment must not secretly determine a formula, default input, result, ranking, or editorial conclusion.",
        ],
      },
      {
        id: "privacy-performance",
        title: "Privacy, consent, and performance",
        paragraphs: [
          "Advertising and affiliate tracking must follow applicable consent and privacy requirements. Live ads should remain disabled in development and preview environments, and visitor calculation values must not be passed to advertising providers.",
          "AyeCalc intends to keep the primary tool and explanation clear before advertising, reserve placement dimensions to limit layout shift, and remove placements that create accidental-click risk or unacceptable performance impact.",
        ],
      },
      {
        id: "editorial",
        title: "Editorial independence",
        paragraphs: [
          "Technical methods, conversion factors, limitations, and accessibility guidance should be selected for accuracy and usefulness. A commercial relationship must be disclosed and must not be represented as independent evidence.",
          "Sponsored claims and destinations require periodic review. Expired or misleading offers should be corrected or removed rather than preserved for revenue.",
        ],
      },
    ],
  },
];

export function getInfoPage(slug: string) {
  return infoPages.find((page) => page.slug === slug);
}

export function createInfoPageMetadata(page: InfoPageDefinition) {
  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    imageAlt: `${page.title} on AyeCalc`,
  });
}
