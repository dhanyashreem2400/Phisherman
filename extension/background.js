chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        if (!tab.url.startsWith("http")) {
            console.warn(" Ignoring non-http(s) URL:", tab.url);
            return;
        }

        console.log("🔍 Checking URL:", tab.url);

        fetch("http://localhost:5000/check-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: tab.url })
        })
        .then(response => response.json())
        .then(data => {
            console.log(" Prediction:", data);
            if (data.isPhishing == true || data.isPhishing === "true") {
                
                // Inject warning script only if the page is fully loaded and valid
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => {
                        const existingAlert = document.getElementById("phishing-alert");
                        if (!existingAlert) {
                            const alertDiv = document.createElement("div");
                            alertDiv.id = "phishing-alert";
                            alertDiv.innerHTML = `
                                🚨 <strong>Warning:</strong> This website is a phishing site!
                            `;
                            alertDiv.style.position = "fixed";
                            alertDiv.style.top = "50%";
                            alertDiv.style.left = "50%";
                            alertDiv.style.transform = "translate(-50%, -50%)";
                            alertDiv.style.background = "rgba(255, 0, 0, 0.9)";
                            alertDiv.style.color = "white";
                            alertDiv.style.padding = "20px";
                            alertDiv.style.borderRadius = "10px";
                            alertDiv.style.zIndex = "999999";
                            document.body.appendChild(alertDiv);
                        }
                    }
                }).catch(err => {
                    console.warn("⚠️ Could not inject script:", err.message);
                });
            }
        })
        .catch(error => console.error("❌ Fetch Error:", error));
    }
});


