import { runtimeMessage } from "../types/messageType.js"
import * as localStorage from "../core/local-storage.js"

import { getTranslation } from "../core/translation.js"
console.log("aktiv")

localStorage.localStorageCron();

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "easyReader",
        title: "in Leichte Sprache Übersetzen",
        contexts: ["all"]
    })

    chrome.alarms.create("localStorageCron", { periodInMinutes: 1 })
})

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "localStorageCron") {

        localStorage.localStorageCron();
    }
})


chrome.runtime.onMessage.addListener((message: runtimeMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log(message)
    if (message.action === "wait for click") {
        console.log("wait for click angekommen");

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) return;

            try {

                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ["EasyReader/src/content/main.js"]
                });


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


        return true;
    }


    if (message.action === "approved element") {
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

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "easyReader") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) return;

            chrome.tabs.sendMessage(tabId, {
                action: "approved",
                mode: "leicht"
            });
        });


    }
})