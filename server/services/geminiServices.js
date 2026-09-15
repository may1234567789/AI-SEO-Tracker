import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const seoAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.INTEGER },
        categories: {
            type: Type.OBJECT,
            properties: {
                seo: { type: Type.INTEGER },
                performance: { type: Type.INTEGER },
                accessibility: { type: Type.INTEGER },
                bestPractices: { type: Type.INTEGER },
            },
            required: ["seo", "performance", "accessibility", "bestPractices"],
        },
        keywords: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    count: { type: Type.INTEGER },
                    density: { type: Type.NUMBER },
                },
                required: ["word", "count", "density"],
            },
        },
        issues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    severity: {
                        type: Type.STRING,
                        enum: ["critical", "warning", "info"],
                    },
                    category: { type: Type.STRING },
                    message: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                },
                required: ["severity", "category", "message", "recommendation"],
            },
        },
    },
    required: ["overallScore", "categories", "keywords", "issues"],
};

export function buildSeoPrompt(scrapedData) {
    const metaData = scrapedData?.metaData ?? {};
    const headings = scrapedData?.headings ?? {};
    const links = scrapedData?.links ?? {};
    const images = scrapedData?.images ?? {};
    const title = metaData.title ?? "";
    const description = metaData.description ?? "";

    return `You are an expert SEO analyst. Analyze the following website data and provide a comprehensive SEO audit.

Website URL: ${scrapedData?.url ?? ""}
Load Time: ${scrapedData?.loadTime ?? 0}ms
Status Code: ${scrapedData?.statusCode ?? 0}
Page Size: ${Math.round((scrapedData?.pageSize ?? 0) / 1024)}KB
Word Count: ${scrapedData?.wordCount ?? 0}

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
${scrapedData?.bodyText ?? ""}

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

export async function analyzeSeoData(scrapedData) {
    if (!scrapedData) {
        throw new Error("Scraped data is required for SEO analysis.");
    }

    const prompt = buildSeoPrompt(scrapedData);

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: seoAnalysisSchema,
        },
    });

    const rawText = typeof response?.text === "string" ? response.text : "";
    const parsed = JSON.parse(rawText || "{}");

    if (!parsed || typeof parsed !== "object") {
        throw new Error("Gemini returned an invalid SEO analysis payload.");
    }

    return parsed;
}