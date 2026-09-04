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

    } catch (e) {
        console.log("Add keyword error: ", e.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

//get all keywords for a user
export const getKeywords = async (req, res) => {

}

//get a single keyword for a user
export const getKeyword = async (req, res) => {

}

//update a keyword for a user
export const refreshKeyword = async (req, res) => {

}

//delete a keyword for a user
export const deleteKeyword = async (req, res) => {

}

//Toggle the active status of a keyword for a user
export const toggleTracking = async (req, res) => {

}