import { tabOnMessage, tabSendMessage } from "../types/messageType.js";
import { HTMLtarget } from "../types/targetType.js";

async function waitForClick(): Promise<HTMLtarget> {
    return new Promise((resolve) => {
        document.addEventListener('click', (event) => {
            const target = event.target;

            if (target instanceof HTMLElement) {
                resolve({
                    target: target,
                    text: target.innerHTML
                })
            }
        }, { once: true })
    })
}



chrome.runtime.onMessage.addListener((message: tabOnMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    if (message.action === "wait for click on text") {
        (async () => {
            const target = await waitForClick()
            const element = target.target

            if (!element.id) {
                element.id = `generated-${Math.random().toString(36).slice(2, 11)}`
            }



            chrome.runtime.sendMessage({ action: "clicked", text: target.text, targetId: element.id, mode: message.mode })
        })
    }

    if (message.action === "translated") {
        if (message.targetId && message.text) {
            const element = document.getElementById(message.targetId)
            if (element) {
                element.innerHTML = message.text
            }

        }
    }
})
