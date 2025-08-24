import app from "./app.js";
import dotenv from "dotenv";
import { db } from "./db/index.js";

dotenv.config({
    path: "./.env",
})

const PORT = process.env.PORT || 4000;

(async () => {
    try {
        await db.$connect();
        console.log("✅ Connected");
        
        app.listen(PORT, () => {
            console.log(`Server running at PORT: ${PORT}`);
        })
        
    } catch (error) {
        console.log("❌ Disconnected");
    }
})();