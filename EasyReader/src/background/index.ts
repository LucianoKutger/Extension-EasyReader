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

            // Versuche zuerst, Nachricht zu schicken
            chrome.tabs.sendMessage(tabId, {
                action: "wait for click on text",
                mode: message.mode
            }, async (response) => {
                if (chrome.runtime.lastError) {
                    console.warn("Content Script nicht gefunden. Injektion wird versucht...", chrome.runtime.lastError.message);

                    // Dynamisch injecten
                    await chrome.scripting.executeScript({
                        target: { tabId },
                        files: ["EasyReader/src/content/main.js"]
                    });

                    // Dann nochmal senden
                    chrome.tabs.sendMessage(tabId, {
                        action: "wait for click on text",
                        mode: message.mode
                    }, () => {
                        sendResponse({ status: "nach Injektion gesendet" });
                    });
                } else {
                    sendResponse({ status: "angekommen" });
                }
            });
        });

        return true; // Damit sendResponse asynchron funktioniert
    }


    if (message.action === "clicked") {
        (async () => {
            if (message.text) {
                const translatedText = await getTranslation(message.text, message.mode)
                if (translatedText) {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs[0]?.id) {
                            chrome.tabs.sendMessage(tabs[0].id, {
                                action: "translated",
                                mode: message.mode,
                                text: translatedText,
                                targetId: message.targetId
                            })
                        }
                    })
                }
            }
        })();
    }
})