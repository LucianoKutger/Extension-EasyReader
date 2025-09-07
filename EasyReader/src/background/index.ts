import { runtimeMessage } from "../types/messageType.js"
import * as localStorage from "../core/local-storage.js"
import { getTranslation } from "../core/translation.js"


localStorage.localStorageCron();

function translationTimeout(promise: Promise<any>, ms: number, timeoutError: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(timeoutError)), ms)

        promise.then((res) => {
            clearTimeout(timer)
            resolve(res)

        }).catch((err) => {
            clearTimeout(timer)
            reject(err)
        })
    })
}

function startTranslation(tabId: number) {
    chrome.tabs.sendMessage(tabId, { action: "active" }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Fehler beim Aktiv-Senden:", chrome.runtime.lastError.message);
            return;
        }

        if (response?.status === "ready") {

            chrome.tabs.sendMessage(tabId, {
                action: "approved",
                mode: "leicht"
            }, () => {

                if (chrome.runtime.lastError) {
                    console.error("Fehler beim Senden an Content Script:", chrome.runtime.lastError.message);


                } else {

                    console.log("Nachricht erfolgreich an Content Script gesendet");

                }
            });
        } else {
            console.log("content script not ready")
        }
    })
}


chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "easyReader",
        title: "In einfache Sprache übersetzen",
        contexts: ["all"]
    });

    chrome.alarms.create("localStorageCron", { periodInMinutes: 1 })


    chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
            if (tab.id && tab.url?.startsWith("http")) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["EasyReader/src/content/main.js"]
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn("Fehler beim initialen Injizieren:", chrome.runtime.lastError.message);
                    }
                });
            }
        }
    });

})

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "localStorageCron") {

        localStorage.localStorageCron();
    }
})



chrome.runtime.onMessage.addListener((message: runtimeMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {


    if (message.action === "approved element") {
        (async () => {
            if (message.text) {
                const tabId = sender.tab?.id;
                if (!tabId) return;

                let translatedText: string | undefined
                //TODO: try catch für error handeling
                try {

                    translatedText = await translationTimeout(
                        getTranslation(message.text, message.mode),
                        10000,
                        "Timemout")

                } catch (error) {

                    chrome.tabs.sendMessage(tabId, {
                        action: "error",
                        mode: message.mode,
                        originalText: message.parentElement ? message.parentElement : message.text,
                        error: (error as Error).message,
                        targetId: message.targetId,
                        parentId: message.parentId
                    });

                    return;
                }


                if (translatedText) {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

                        chrome.tabs.sendMessage(tabId, {
                            action: "translated",
                            mode: message.mode,
                            originalText: message.text,
                            text: translatedText,
                            targetId: message.targetId,
                            parentId: message.parentId,
                            parentElement: message.parentElement,
                            tableTag: message.tableTag,
                            tableId: message.tableId
                        })

                    })
                }
            }
        })();
    }

    if (message.action === "reload") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) return;

            chrome.tabs.sendMessage(tabId, {
                action: "reload"
            })

        })
    }

    if (message.action === "retry" && sender.tab?.id) {

        startTranslation(sender.tab.id);
    }


})


chrome.contextMenus.onClicked.addListener((info) => {

    if (info.menuItemId === "easyReader") {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tabId = tabs[0]?.id;
            if (!tabId) return;
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ["EasyReader/src/content/main.js"]
                });

                startTranslation(tabId)

            } catch (e) {
                throw e
            }


        });


    }
})