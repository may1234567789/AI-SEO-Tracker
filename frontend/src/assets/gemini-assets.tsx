export type SeoMetricCategory = {
    seo: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
};

export type SeoKeyword = {
    word: string;
    count: number;
    density: number;
};

export type SeoIssueSeverity = "critical" | "warning" | "info";

export type SeoIssue = {
    severity: SeoIssueSeverity;
    category: string;
    message: string;
    recommendation: string;
};

export type SeoAnalysis = {
    overallScore: number;
    categories: SeoMetricCategory;
    keywords: SeoKeyword[];
    issues: SeoIssue[];
};

export type ScrapedDataLike = {
    url: string;
    loadTime: number;
    statusCode: number;
    pageSize: number;
    wordCount: number;
    metaData?: {
        title?: string;
        description?: string;
        canonical?: string;
        robots?: string;
        ogTitle?: string;
        ogDescription?: string;
        ogImage?: string;
        twitterCard?: string;
        viewport?: string;
        charset?: string;
    };
    headings?: {
        h1?: number | string;
        h2?: number | string;
        h3?: number | string;
        h4?: number | string;
        h5?: number | string;
        h6?: number | string;
        h1Texts?: string[];
    };
    links?: {
        internal?: number;
        external?: number;
        total?: number;
    };
    images?: {
        total?: number;
        missingAlt?: number;
        withAlt?: number;
    };
    bodyText?: string;
};

export const seoAnalysisSchema = {
    type: "object",
    properties: {
        overallScore: { type: "integer" },
        categories: {
            type: "object",
            properties: {
                seo: { type: "integer" },
                performance: { type: "integer" },
                accessibility: { type: "integer" },
                bestPractices: { type: "integer" },
            },
            required: ["seo", "performance", "accessibility", "bestPractices"],
        },
        keywords: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    word: { type: "string" },
                    count: { type: "integer" },
                    density: { type: "number" },
                },
                required: ["word", "count", "density"],
            },
        },
        issues: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    severity: {
                        type: "string",
                        enum: ["critical", "warning", "info"],
                    },
                    category: { type: "string" },
                    message: { type: "string" },
                    recommendation: { type: "string" },
                },
                required: ["severity", "category", "message", "recommendation"],
            },
        },
    },
    required: ["overallScore", "categories", "keywords", "issues"],
} as const;

export function buildSeoPrompt(scrapedData: ScrapedDataLike) {
    const metaData = scrapedData.metaData ?? {};
    const headings = scrapedData.headings ?? {};
    const links = scrapedData.links ?? {};
    const images = scrapedData.images ?? {};
    const title = metaData.title ?? "";
    const description = metaData.description ?? "";

    return `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.

Website URL: ${scrapedData.url}
Load Time: ${scrapedData.loadTime}ms
Status Code: ${scrapedData.statusCode}
Page Size: ${Math.round((scrapedData.pageSize || 0) / 1024)}KB
Word Count: ${scrapedData.wordCount}

META DATA:
- Title: "${title}" (${title.length} chars)
- Description: "${description}" (${description.length} chars)
- Canonical: "${metaData.canonical ?? ""}"
- Robots: "${metaData.robots ?? ""}"
- OG Title: "${metaData.ogTitle ?? ""}"
- OG Description: "${metaData.ogDescription ?? ""}"
- OG Image: "${metaData.ogImage ?? ""}"
- Twitter Card: "${metaData.twitterCard ?? ""}"
- Viewport: "${metaData.viewport ?? ""}"
- Charset: "${metaData.charset ?? ""}"

HEADINGS:
- H1: ${headings.h1 ?? 0} (texts: ${JSON.stringify(headings.h1Texts ?? [])})
- H2: ${headings.h2 ?? 0}
- H3: ${headings.h3 ?? 0}
- H4: ${headings.h4 ?? 0}
- H5: ${headings.h5 ?? 0}
- H6: ${headings.h6 ?? 0}

LINKS:
- Internal: ${links.internal ?? 0}
- External: ${links.external ?? 0}
- Total: ${links.total ?? 0}

IMAGES:
- Total: ${images.total ?? 0}
- Missing Alt Text: ${images.missingAlt ?? 0}
- With Alt Text: ${images.withAlt ?? 0}

PAGE CONTENT (first 3000 chars):
${scrapedData.bodyText ?? ""}

Scoring guidelines:
- Title: 50-60 chars optimal, must exist
- Description: 150-160 chars optimal, must exist
- H1: exactly 1 is ideal
- Images: all should have alt text
- Load time: <3s good, <5s ok, >5s poor
- Page size: <3MB good
- Must have viewport meta, charset, canonical
- OG tags and Twitter cards are important
- Internal linking is good for SEO
- Word count: >300 words for content pages
- Check heading hierarchy

Severity levels must be exactly one of: "critical", "warning", or "info".
Provide 5-15 issues sorted by severity (critical first). Be specific and actionable with recommendations.
Extract top 10 keywords by frequency from the page content.`;
}