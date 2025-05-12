import { tabOnMessage, tabSendMessage } from "../types/messageType.js";
import { HTMLtarget } from "../types/targetType.js";

if (!(window as any).EasyReaderContentLoaded) {
    (window as any).EasyReaderContentLoaded = true;
    console.log("content geladen")

    let rightClickedElement: HTMLElement

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

    function idCheck(element: HTMLElement) {

        if (!element.id) {

            element.id = `generated-${Math.random().toString(36).slice(2, 11)}`
        }
    }

    function sendMessage(action: string, text: string, targetId: string, mode: string) {

        chrome.runtime.sendMessage({
            action: action,
            text: text,
            targetId: targetId,
            mode: mode
        })
    }

    function parentCheck(htmlElement: HTMLElement): HTMLElement {

        const displayType = window.getComputedStyle(htmlElement).display

        if (displayType === "inline") {
            const parent = htmlElement.parentElement

            return parent ?? htmlElement

        } else {

            return htmlElement

        }
    }

    /*document.addEventListener("contextmenu", (element) => {
        const target = (element.target) as HTMLElement

        console.log(target)

        sendMessage("right click", target.innerHTML, target.id, "leicht")
    })*/

    document.addEventListener("contextmenu", (event) => {
        const htmlElement = event.target as HTMLElement

        if (htmlElement instanceof HTMLElement) {


            const htmlElement = event.target as HTMLElement

            if (htmlElement instanceof HTMLElement) {

                rightClickedElement = parentCheck(htmlElement)

            }

        }
    })

    chrome.runtime.onMessage.addListener((message: tabOnMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
        if (message.action === "approved") {

            sendResponse("transmitted");

            (async () => {

                const htmlElement: HTMLElement = rightClickedElement

                if (htmlElement instanceof HTMLElement) {

                    if (htmlElement.parentElement) {

                        const parent = htmlElement.parentElement

                        for (const child of parent.children) {
                            if ((child as HTMLElement).innerText) {

                                idCheck(child as HTMLElement)

                                sendMessage
                                sendMessage("approved element", (child as HTMLElement).innerText, child.id, message.mode)
                            }

                        }
                    } else {

                        if (htmlElement.innerText) {

                            idCheck(htmlElement)

                            sendMessage("approved element", htmlElement.innerText, htmlElement.id, message.mode)

                        }

                    }

                } else {
                    console.log("kein html element")
                }


            })();

            return false;
        }

        if (message.action === "translated") {
            console.log("translation erhalten");
            if (message.targetId && message.text) {
                const element = document.getElementById(message.targetId)
                console.log(message)
                console.log(element)
                if (element) {
                    element.innerText = message.text
                }

            }
        }
    })
}