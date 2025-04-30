import { getTranslation } from "../core/translation.js"
import { runtimeMessage } from "../types/messageType.js"

console.log("aktiv")

chrome.runtime.onMessage.addListener((message: runtimeMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log(message)
    if (message.action === "wait for click") {
        console.log("wait for click angekommen");

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) return;

            try {
                // Direkt injecten
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ["EasyReader/src/content/main.js"]
                });

                // Dann Nachricht senden
                chrome.tabs.sendMessage(tabId, {
                    action: "wait for click on text",
                    mode: message.mode
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Fehler beim Senden an Content Script:", chrome.runtime.lastError.message);
                        sendResponse({ status: "Fehlgeschlagen beim Senden" });

                    } else {
                        console.log("Nachricht erfolgreich an Content Script gesendet");
                        sendResponse({ status: "nach Injektion gesendet" });
                    }
                });
            } catch (error) {
                console.error("Fehler beim Injektionsversuch:", error);
                sendResponse({ status: "Fehlgeschlagen" });
            }
        });


        return true; // Damit sendResponse asynchron funktioniert
    }


    if (message.action === "clicked") {
        (async () => {
            if (message.text) {
                const translatedText = await getTranslation(message.text, message.mode)
                if (translatedText) {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

                        const tabId = tabs[0]?.id;
                        if (!tabId) return;

                        chrome.tabs.sendMessage(tabId, {
                            action: "translated",
                            mode: message.mode,
                            text: translatedText,
                            targetId: message.targetId
                        })

                    })
                }
            }
        })();
    }
})