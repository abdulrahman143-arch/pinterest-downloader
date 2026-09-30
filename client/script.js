const API_URL = "https://pinterest-downloader-api.onrender.com";

const button = document.getElementById("downloadButton");
const input = document.getElementById("pinterestUrl");
const status = document.getElementById("status");

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
        const response = await fetch(API_URL + "/api/check-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: url })
        });

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

        status.textContent =
            "❌ " + error.message;

    } finally {
        button.disabled = false;
        button.textContent = "↓ Download";
    }
});
