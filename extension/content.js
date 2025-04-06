chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "showWarning") {
        console.log("🚨 Phishing alert received!");

        if (document.getElementById("phishing-alert")) return;

        const overlay = document.createElement("div");
        overlay.id = "phishing-alert";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "rgba(0, 0, 0, 0.7)";
        overlay.style.display = "flex";
        overlay.style.justifyContent = "center";
        overlay.style.alignItems = "center";
        overlay.style.zIndex = "9999";

        const popup = document.createElement("div");
        popup.style.background = "#ff3b30";
        popup.style.color = "#fff";
        popup.style.padding = "20px";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
        popup.style.textAlign = "center";
        popup.style.fontSize = "18px";
        popup.style.maxWidth = "400px";

        popup.innerHTML = `
            <h2>⚠️ Phishing Alert!</h2>
            <p>This website is flagged as a phishing site.</p>
            <button id="closeWarning" style="margin-top: 10px; background: white; color: #ff3b30; border: none; padding: 8px 16px; font-size: 16px; border-radius: 5px; cursor: pointer;">Close</button>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        document.getElementById("closeWarning").addEventListener("click", () => {
            overlay.remove();
        });
    }
});
