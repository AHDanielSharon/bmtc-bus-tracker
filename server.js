const express = require("express");
const axios = require("axios");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public")); // Serve index.html

// SEARCH STOP API
app.post("/api/searchStop", async (req, res) => {
    const { q } = req.body;

    try {
        const response = await axios.post(
            "https://bmtcmobileapi.karnataka.gov.in/WebAPI/FindNearByBusStop_v2",
            { stationName: q },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Origin": "https://nammabmtcapp.karnataka.gov.in",
                    "Referer": "https://nammabmtcapp.karnataka.gov.in/commuter/journey-planner"
                }
            }
        );

        const stops = response.data.data || [];
        res.json({ ok: true, stops });

    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

// TRIP PLANNER API
app.post("/api/getTrip", async (req, res) => {
    const { fromStationId, toStationId } = req.body;

    try {
        const response = await axios.post(
            "https://bmtcmobileapi.karnataka.gov.in/WebAPI/TripPlannerMSMD",
            {
                fromStationId,
                toStationId,
                filterBy: 0,
                lan: "en"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Origin": "https://nammabmtcapp.karnataka.gov.in",
                    "Referer": "https://nammabmtcapp.karnataka.gov.in/commuter/journey-planner"
                }
            }
        );

        // Keep only useful fields
        const direct = response.data.data.directRoutes || [];
        const transfer = response.data.data.transferRoutes || [];

        const trips = [...direct, ...transfer];

        res.json({ ok: true, trips });

    } catch (err) {
        res.json({ ok: false, error: err.message });
    }
});

// FALLBACK FOR FRONTEND
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚍 Server running on port ${PORT}`);
});
