import { getTranslation } from "../core/translation.js"
import { runtimeMessage } from "../types/messageType.js"

console.log("aktiv")

chrome.runtime.onMessage.addListener((message: runtimeMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log(message)
    if (message.action === "wait for click") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "wait for click on text",
                    mode: message.mode
                });


                sendResponse({ status: "angekommen" })
            }
        })

        return true
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
        })
    }
})