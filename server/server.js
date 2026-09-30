const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// Home
app.get("/", (req, res) => {
    res.send("Pinterest Downloader API is running!");
});


// Detect platform
function detectPlatform(url) {

    try {

        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.toLowerCase();

        // Instagram
        if (
            hostname === "instagram.com" ||
            hostname === "www.instagram.com"
        ) {

            if (parsedUrl.pathname.startsWith("/reel/")) {
                return "instagram-reel";
            }

            return "instagram";
        }


        // Pinterest
        if (
            hostname === "pinterest.com" ||
            hostname === "www.pinterest.com"
        ) {
            return "pinterest";
        }


        return "unknown";

    } catch {

        return "invalid";

    }
}


// Check URL
app.post("/api/check-url", (req, res) => {

    const { url } = req.body;

    if (!url) {

        return res.status(400).json({
            valid: false,
            error: "Please enter a URL."
        });

    }


    const platform = detectPlatform(url);


    if (platform === "invalid") {

        return res.status(400).json({
            valid: false,
            error: "Invalid URL."
        });

    }


    if (platform === "unknown") {

        return res.status(400).json({
            valid: false,
            error: "Only Pinterest and Instagram URLs are supported."
        });

    }


    let title = "Media";


    if (platform === "pinterest") {
        title = "Pinterest media";
    }


    if (platform === "instagram-reel") {
        title = "Instagram Reel";
    }


    res.json({

        valid: true,

        platform: platform,

        title: title,

        message: "URL detected successfully."

    });

});


// Original Pinterest test endpoint
app.post("/api/download", (req, res) => {

    const { url } = req.body;

    if (!url) {

        return res.status(400).json({
            error: "Pinterest URL is required."
        });

    }


    if (!url.includes("pinterest.com")) {

        return res.status(400).json({
            error: "Invalid Pinterest URL."
        });

    }


    res.json({
        message: "Pinterest URL received successfully!"
    });

});


// Direct video download
app.get("/api/download-video", async (req, res) => {

    const videoUrl = req.query.url;

    if (!videoUrl) {

        return res.status(400).send(
            "Video URL is required."
        );

    }


    try {

        const response = await fetch(videoUrl);

        if (!response.ok) {

            return res.status(400).send(
                "Could not access the video."
            );

        }


        const contentType =
            response.headers.get("content-type") ||
            "video/mp4";


        res.setHeader(
            "Content-Type",
            contentType
        );


        res.setHeader(
            "Content-Disposition",
            'attachment; filename="video.mp4"'
        );


        const buffer =
            await response.arrayBuffer();


        res.send(Buffer.from(buffer));

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Download failed."
        );

    }

});


// Start server
app.listen(3000, () => {

    console.log(
        "Server running at http://localhost:3000"
    );

});