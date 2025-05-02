import { tabOnMessage, tabSendMessage } from "../types/messageType.js";
import { HTMLtarget } from "../types/targetType.js";

if (!(window as any).EasyReaderContentLoaded) {
    (window as any).EasyReaderContentLoaded = true;
    console.log("content geladen")


    async function waitForClick(): Promise<HTMLtarget> {
        return new Promise((resolve) => {
            document.addEventListener('click', (event) => {
                const target = event.target;

                if (target instanceof HTMLElement) {
                    resolve({
                        target: target,
                        text: target.innerText
                    })
                }
            }, { once: true })
        })
    }



    chrome.runtime.onMessage.addListener((message: tabOnMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
        if (message.action === "wait for click on text") {
            (async () => {
                const target = await waitForClick()
                const htmlElement = target.target

                if (target instanceof HTMLElement) {
                    let element

                    const displayType = window.getComputedStyle(target).display

                    if (displayType === "inline") {
                        const parent = htmlElement.parentElement
                        const grandparent = parent?.parentElement

                        element = grandparent ?? parent ?? htmlElement

                    } else {

                        element = target.target

                    }
                    if (element.parentElement) {

                        const parent = element.parentElement

                        for (const child of parent.children) {
                            if (!child.id) {
                                child.id = `generated-${Math.random().toString(36).slice(2, 11)}`
                            }



                            chrome.runtime.sendMessage({
                                action: "clicked",
                                text: (child as HTMLElement).innerText,
                                targetId: child.id,
                                mode: message.mode
                            })

                            sendResponse({ status: "clicked_sent" });
                        }
                    } else {
                        if (!element.id) {
                            element.id = `generated-${Math.random().toString(36).slice(2, 11)}`
                        }



                        chrome.runtime.sendMessage({
                            action: "clicked",
                            text: target.text,
                            targetId: element.id,
                            mode: message.mode
                        })

                        sendResponse({ status: "clicked_sent" });

                    }
                }


            })();

            return true;
        }

        if (message.action === "translated") {
            if (message.targetId && message.text) {
                const element = document.getElementById(message.targetId)
                if (element) {
                    element.innerText = message.text
                }

            }
        }
    })
}