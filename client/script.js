const API_URL = "https://pinterest-downloader-api.onrender.com";

const button = document.getElementById("downloadButton");
const input = document.getElementById("pinterestUrl");
const status = document.getElementById("status");

button.addEventListener("click", async () => {
    const url = input.value.trim();

    if (!url) {
        status.textContent = "❌ Please enter a video URL.";
        return;
    }

    button.disabled = true;
    button.textContent = "Checking...";
    status.textContent = "🔍 Checking URL...";

    try {
        // Check the URL first
        const checkResponse = await fetch(
            API_URL + "/api/check-url",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url: url })
            }
        );

        const data = await checkResponse.json();

        if (!checkResponse.ok || !data.valid) {
            throw new Error(data.error || "Invalid URL.");
        }

        status.innerHTML =
            "✅ Valid URL<br>" +
            "🎬 " + data.title;

        /*
         * The download endpoint requires a DIRECT video URL.
         * A Pinterest Pin or Instagram Reel page URL is not
         * itself a video file.
         */
        if (
            data.platform === "pinterest" ||
            data.platform === "instagram-reel"
        ) {
            status.innerHTML +=
                "<br>ℹ️ A direct video file URL is required for download.";

            return;
        }

        // Download a direct video URL
        button.textContent = "Downloading...";

        const downloadUrl =
            API_URL +
            "/api/download-video?url=" +
            encodeURIComponent(url);

        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error("Could not download the video.");
        }

        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "video.mp4";

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(blobUrl);

        status.textContent = "✅ Download started!";

    } catch (error) {
        console.error(error);

        status.textContent =
            "❌ " + error.message;

    } finally {
        button.disabled = false;
        button.textContent = "↓ Download";
    }
});
