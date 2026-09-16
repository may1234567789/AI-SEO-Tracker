import Analysis from "../models/Analysis";
import { analyzeSeoData } from "../services/geminiServices";
import { scrapeUrl } from "../services/scraperService";

// Analyze a URL
export const anslyzeUrl = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ sucess: false, message: "URL is required" });

        let validUrl;
        try {
            validUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
        } catch (error) {
            return res.status(400).json({ sucess: false, message: "URL is not valid" })
        }

        //Create analysis recor with pending status
        const analysis = await Analysis.create({ userId: req.userId, url: validUrl.href, status: "processing" });

        //Send immediate response with analysis ID
        res.json({ sucess: true, message: "Analysis started", analysis: analysis._id })

        // Run scraping and analysis in background
        try {
            // Step 1: Scrape the URL with BrowserBase
            const scrapeResult = await scrapeUrl(validUrl.href)

            if (!scrapeResult.success) {
                analysis.status = "failed";
                await analysis.save();
                return;

            }
            //Step 2: Analyze with Gemini AI
            const aiResult = await analyzeSeoData(scrapeResult.data)
            if (!aiResult.success) {
                analysis.status = "failed";
                await analysis.save()
                return;
            }

            //step 3: Save Results
            analysis.overallScore = aiResult.data.overallScore || 0;
            analysis.categories = aiResult.data.categories || {};
            analysis.metaData = scrapeResult.data.metaData || {};
            analysis.heading = scrapeResult.data.heading || {};
            analysis.links = scrapeResult.data.links || {};
            analysis.images = scrapeResult.data.images || {};
            analysis.keywords = aiResult.data.keywords || [];
            analysis.issues = aiResult.data.issues || [];
            analysis.loadTime = scrapeResult.data.loadTime || 0;
            analysis.pageSize = scrapeResult.data.pageSize || 0;
            analysis.wordCount = scrapeResult.data.wordCount || 0;

            analysis.save();
        } catch (error) {
            console.error("Background analysis error: ", error.message);
            try {
                analysis.status = "failed";
                await analysis.save();
            } catch (error) {
                console.error("Failed to save failed status: ", error.message);
            }
        }
    } catch (error) {
        console.error("Analyze URL error: ", error.message);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Server error" })
        }
    }
}

//Get analysis by ID
export const getAnalysis = async (req, res) => {
    try {
        const analysis = await Analysis.findOne({ _id: req.parmas.id, userId: req.userId })

        if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });

        res.json({ success: true, analysis })
    } catch (error) {
        console.error("Get analysis error: ", error.message);
        res.status(500).jsoon({ success: false, message: "Server error" })
    }

}

//Get all anayses for user
export const getAnalyses = async (req, res) => {
    try {
        const page = parseInt(req.quer.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const analyses = await (await Analysis.find({ userId: req.userId })).toSorted({ createdAt: -1 }).skip(skip).limit(limit).select("-issues -keywords")

        const total = await Analysis.countDocuments({ userId: req.userId })

        res.json({ success: true, analyses, pagination: { page, limit, total, pagess: Math.ceil(total / limit) } });
    } catch (error) {
        console.error("Get analyses error: ", error.message);
        res.status(500).jsoon({ success: false, message: "Server error" })
    }
}

//Delete a analysis
export const deleteAnalyses = async (req, res) => {
    try {
        await Analysis.findByIdAndDelete({ _id: req.parmas.id, userId: req.userid })

        res.json({ success: true, message: "Analysis Deleted" })
    } catch (error) {
        console.error("Error deleting analysis: ", error.message);
        res.status(500).jsoon({ success: false, message: "Server error" })
    }
}