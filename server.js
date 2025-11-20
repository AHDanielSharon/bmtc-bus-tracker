const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ===============================================
// 1) SEARCH STOP
// ===============================================
app.post("/api/searchStop", async (req, res) => {
    let q = req.body.q || "";
    console.log("📌 Searching stop:", q);

    try {
        const bmtcRes = await axios.post(
            "https://bmtcmobileapi.karnataka.gov.in/WebAPI/FindNearByBusStop_v2",
            { stationName: q, lan: "en" },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Origin": "https://nammabmtcapp.karnataka.gov.in",
                    "Referer": "https://nammabmtcapp.karnataka.gov.in/"
                }
            }
        );

        console.log("✔ Stop search success");
        return res.json({ ok: true, stops: bmtcRes.data.data });
    } catch (err) {
        console.log("❌ Stop search error");
        return res.json({ ok: false, error: "Failed to fetch stops" });
    }
});

// ===============================================
// 2) GET TRIP
// ===============================================
app.post("/api/getTrip", async (req, res) => {
    const { fromStationId, toStationId } = req.body;
    console.log(`📌 Trip request: ${fromStationId} → ${toStationId}`);

    try {
        const response = await axios.post(
            "https://bmtcmobileapi.karnataka.gov.in/WebAPI/TripPlannerMSMD",
            {
                fromStationId: fromStationId,
                toStationId: toStationId,
                filterBy: 0,
                serviceTypeId: null,
                fromDateTime: null,
                lan: "en"
            },
            {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6,kn;q=0.5",
                    "Content-Type": "application/json",
                    "Origin": "https://nammabmtcapp.karnataka.gov.in",
                    "Referer": "https://nammabmtcapp.karnataka.gov.in/",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
                    "Devicetype": "WEB",
                    "Dnt": "1",
                    "Host": "bmtcmobileapi.karnataka.gov.in",
                    "Lan": "en",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    "Connection": "keep-alive"
                }
            }
        );

        console.log("✔ Trip fetch success");

        const trips = response.data.data.transferRoutes || [];
        return res.json({ ok: true, trips });
    } catch (err) {
        console.log("❌ Trip fetch error");
        return res.json({ ok: false, error: "Failed to fetch trips" });
    }
});

// ===============================================
// 3) FIX FOR RENDER (VERY IMPORTANT)
// ===============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚍 Server running on port " + PORT);
});
