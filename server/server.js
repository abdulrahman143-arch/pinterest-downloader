const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Pinterest Downloader API is running!");
});

// Detect supported URL
function detectPlatform(url) {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname.toLowerCase();

        if (
            hostname === "pinterest.com" ||
            hostname === "www.pinterest.com"
        ) {
            return "pinterest";
        }

        if (
            hostname === "instagram.com" ||
            hostname === "www.instagram.com"
        ) {
            if (parsedUrl.pathname.startsWith("/reel/")) {
                return "instagram-reel";
            }

            return "instagram";
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
        title: title
    });
});

// Direct video URL download
app.get("/api/download-video", async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send("Video URL is required.");
    }

    try {
        const parsedUrl = new URL(videoUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).send("Invalid video URL.");
        }

        const response = await fetch(videoUrl);

        if (!response.ok) {
            return res.status(400).send(
                "Could not access the video."
            );
        }

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.startsWith("video/")) {
            return res.status(400).send(
                "The provided URL is not a video file."
            );
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="video.mp4"'
        );

        const buffer = await response.arrayBuffer();

        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error(error);
        res.status(500).send("Download failed.");
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});