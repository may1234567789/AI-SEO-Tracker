import KeywordTracking from "../models/keywordTracking";
import { keywordTracking } from "../services/keywordTrackingService";

// Add a new keyword for tracking
export const addKeyword = async (req, res) => {
    try {
        const { keyword, url } = req.body;
        if (!keyword || !url) return res.status(400).json({ success: false, message: "Keyword and URL are required" });

        //Extract domain from URL
        let domain;
        try {
            const urlObj = new URL(url.startsWith("http") ? url : `http://${url}`);
            domain = urlObj.hostname.replace("www.", "");
        } catch (error) {
            return res.status(400).json({ success: false, message: "Invalid URL" });
        }


        //check if the keyword is already being tracked for the user
        const existing = await KeywordTracking.findOne({ userId: req.userId, keyword: keyword.toLowerCase().trim(), domain: domain });
        if (existing) return res.status(400).json({ success: false, message: "Keyword is already being tracked for this URL" });

        //create a new keyword tracking document
        const tracking = await KeywordTracking.create({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            url: url.startsWith("http") ? url : `http://${url}`,
            domain: domain,
            status: "checking",
        });

        res.status(201).json({ success: true, message: "Keyword added for tracking", tracking })
        keywordTracking(tracking).catch((e) => {
            console.error("Error occurred while tracking keyword:", e);
        });

    } catch (e) {
        console.log("Add keyword error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

//get all keywords for a user
export const getKeywords = async (req, res) => {
    try {
        const keywords = await KeywordTracking.find({ userId: req.userId }).sort({ createdAt: -1 }).select("-rankHistory");
        res.status(200).json({ success: true, keywords });
    } catch (e) {
        console.log("Get keywords error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }

}

//get a single keyword for a user
export const getKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.find({ _id: req.params.id, userId: req.userId }).sort({ createdAt: -1 });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        res.status(200).json({ success: true, tracking });
    } catch (e) {
        console.log("Get keyword error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

//update a keyword for a user
export const refreshKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId }).sort({ createdAt: -1 });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        tracking.status = "checking";
        await tracking.save();
        res.status(200).json({ success: true, tracking });
        keywordTracking(tracking).catch((e) => {
            console.error("Error occurred while tracking keyword:", e);
        })
    } catch (e) {
        console.log("Get keyword error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

//delete a keyword for a user
export const deleteKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findByIdAndDelete({ _id: req.params.id, userId: req.userId }).sort({ createdAt: -1 });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        res.status(200).json({ success: true, message: "Keyword Tracking deleted" });

    } catch (e) {
        console.log("Delete Keyword Error", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

//Toggle the active status of a keyword for a user
export const toggleTracking = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword not found" });
        tracking.active = !tracking.active;
        await tracking.save();

        res.status(200).json({ success: true, message: "Keyword Tracking deleted" });

    } catch (e) {
        console.log("Toggle Tracking Error", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}