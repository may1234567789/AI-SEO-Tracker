export async function keywordTracking(tracking) {
    try {
        let result;

        for (let attempt = 0; attempt < 3; attempt++) {
            result = await rankTracker(tracking.keyword, tracking.domain);
            if (result.success && result.data.totalResultsScanned) break;
            if (attempt < 2) await new Promise((r) => setTimeout(r, result.success ? 3000 : 5000)); // Wait 2-4 seconds before retrying
        }
        if (result.success) {
            const prev = tracking.currentPosition;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            tracking.currentPosition = result.data.position;
            tracking.currentPage = result.data.page;
            // tracking.currentTitle = result.data.title;
            //tracking.currentSnippet = result.data.snippet;
            tracking.competitors = result.data.competitors;
            //tracking.totalResultsScanned = result.data.totalResultsScanned;
            tracking.lastChecked = new Date();
            tracking.status = "completed";

            // Update stats
            tracking.positionChange = prev && result.data.position ? prev - result.data.position : 0;
            if (result.data.position && (!tracking.bestPosition || result.data.position < tracking.bestPosition)) {
                tracking.bestPosition = result.data.position;
                //tracking.bestPositionDate = today;
            }

            // Update historyEntry 
            const historyEntry = {
                date: today,
                position: result.data.position,
                page: result.data.page,
                //competitors: result.data.competitors,
                snippet: result.data.snippet,
                title: result.data.title
            };
            const idx = tracking.rankHistory.findIndex((h) => h.date.toDateString() === today.toDateString());
            if (idx >= 0) tracking.rankHistory[idx] = historyEntry;
        } else {
            tracking.status = "failed";
        }
        await tracking.save();
        return result;
    } catch (error) {
        console.error("Error occurred while tracking keyword:", error);
        tracking.status = "failed";
        await tracking.save().catch(() => { });
        return {
            success: false,
            error: "Failed to save tracking status after error."
        }
            ;
    }
}