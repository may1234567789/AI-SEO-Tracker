import cron from "node-cron";
import keywordTracking from "../models/keywordTracking"

export function startRankTrackingCron() {
    cron.schedule("0 6 * * *", async () => {
        console.log("Starting daily rank tracking...");
        try {
            const activeTrackings = await keywordTracking.find({ active: true })
            for (const tracking of activeTrackings) {
                tracking.status = "checking";
                await tracking.save()

                const result = await keywordTracking(tracking)
                await new Promise((r) => setTimeout(r, 1000 + Math.random() * 5000))
            }
        } catch (error) {
            console.error("[Corn] Rank Tracking Cron error: ", error.message);
        }
    })
    console.log("Rank tracking cron job scheduled")
}