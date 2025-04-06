document.addEventListener("DOMContentLoaded", () => {
    const statusElement = document.getElementById("status");
    const probabilityElement = document.getElementById("probability");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length || !tabs[0].url) {
            statusElement.textContent = "⚠️ No active tab found!";
            return;
        }

        const currentURL = tabs[0].url;

        statusElement.textContent = "🔍 Checking URL...";

        fetch("https://phisherman-node-server.onrender.com/check-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: currentURL }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("🔄 Response from server:", data);
        
            const isPhishing = String(data.isPhishing).toLowerCase() === "true" || data.isPhishing === true || data.isPhishing === 1;
        
            if (isPhishing) {
                statusElement.textContent = "🚨 Warning: Phishing Detected!";
            } else {
                statusElement.textContent = "✅ Safe Website!";
            }
        
            statusElement.style.color = "white";
            statusElement.style.padding = "10px";
            statusElement.style.borderRadius = "6px";
            statusElement.style.fontSize = "18px";
            statusElement.style.textAlign = "center";
        
            if (typeof data.probability === "number") {
                probabilityElement.textContent = `🔢 Confidence: ${(data.probability * 100).toFixed(2)}%`;
                probabilityElement.style.marginTop = "10px";
            } else {
                probabilityElement.textContent = "";
            }
        })

});
