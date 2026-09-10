import Analysis from "../models/Analysis";

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


    } catch (error) {

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