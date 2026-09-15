import Analysis from "../models/Analysis";
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

                //Step 2: Analyze with Gemini AI
            }
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

}

//Get all anayses for user
export const getAnalyses = async (req, res) => {

}

//Delete a analysis
export const deleteAnalyses = async (req, res) => {

}