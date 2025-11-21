const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const BMTC_HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://nammabmtcapp.karnataka.gov.in",
    "Referer": "https://nammabmtcapp.karnataka.gov.in/commuter/journey-planner",
    "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-A507FN) AppleWebKit/537.36 Chrome/91.0 Mobile Safari/537.36",
    "devicetype": "WEB",
    "dnt": 1,
    "lan": "en"
};

// ---------------------------
// SEARCH STOP
// ---------------------------
app.post("/api/searchStop", async (req, res) => {
    const { q } = req.body;

    try {
        const response = await axios.post(
            "https://bmtcmobileapi.karnataka.gov.in/WebAPI/FindNearByBusStop_v2",
            { stationName: q },
            { headers: BMTC_HEADERS }
        );

        res.json({ ok: true, stops: response.data.data || [] });
    } catch (err) {
        console.error(err);
        res.json({ ok: false, error: err.message });
    }
});

// ---------------------------
// TRIP PLANNER
// ---------------------------
app.post("/api/getTrip", async (req, res) => {
    const { fromStationId, toStationId } = req.body;

    try {
        const response = await axios.post(
            "https://bmtcmobileapi.karnataka.gov.in/WebAPI/TripPlannerMSMD",
            {
                fromStationId,
                toStationId,
                filterBy: 0,
                lan: "en",
                serviceTypeId: null,
                fromDateTime: null
            },
            { headers: BMTC_HEADERS }
        );

        const direct = response.data.data.directRoutes || [];
        const transfer = response.data.data.transferRoutes || [];

        res.json({ ok: true, trips: [...direct, ...transfer] });
    } catch (err) {
        console.error(err);
        res.json({ ok: false, error: err.message });
    }
});

// ---------------------------
// Serve frontend
// ---------------------------
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚍 Server running on port", PORT));
