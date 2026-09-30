const API_URL = "https://pinterest-downloader-api.onrender.com";
const button = document.getElementById("downloadButton");
const input = document.getElementById("pinterestUrl");
const status = document.getElementById("status");

app.post("/api/check-url", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            valid: false,
            error: "URL is required."
        });
    }

    try {
        const parsedUrl = new URL(url);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                valid: false,
                error: "URL must use HTTP or HTTPS."
            });
        }

        // Basic Pinterest URL check
        if (!parsedUrl.hostname.includes("pinterest.com")) {
            return res.status(400).json({
                valid: false,
                error: "This is not a Pinterest URL."
            });
        }

        res.json({
            valid: true,
            title: "Pinterest video",
            message: "Valid public Pinterest URL"
        });

    } catch (error) {
        res.status(400).json({
            valid: false,
            error: "Invalid URL."
        });
    }
});
button.addEventListener("click", async () => {

    const url = input.value.trim();

    if (!url) {
        status.textContent = "❌ Please enter a Pinterest URL.";
        return;
    }

    button.disabled = true;
    button.textContent = "Checking...";
    status.textContent = "🔍 Checking URL...";

    try {

        const response = await fetch(
            "http://pinterest-downloader-api.onrender.com",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.valid) {
            throw new Error(data.error || "Invalid URL.");
        }

        status.innerHTML =
            "✅ Valid URL<br>" +
            "🎬 Title: <strong>" +
            data.title +
            "</strong>";

    } catch (error) {

        console.error(error);

        status.textContent = "❌ " + error.message;

    } finally {

        button.disabled = false;
        button.textContent = "↓ Download";

    }
});
