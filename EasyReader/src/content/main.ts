import { tabOnMessage, tabSendMessage } from "../types/messageType.js";
import { HTMLtarget } from "../types/targetType.js";




if (!(window as any).EasyReaderContentLoaded) {
    (window as any).EasyReaderContentLoaded = true;
    console.log("content geladen")


    let rightClickedElement: HTMLElement
    let parentSnapshot: { parentId: string | null; tag: string } = {
        parentId: null,
        tag: ""
    }


    let _sanitizeHTML: ((dirty: string) => string) | null = null;

    async function getSanitizeHTML(): Promise<(dirty: string) => string> {
        if (!_sanitizeHTML) {
            // ✅ korrigierter Pfad
            const mod = await import(
                chrome.runtime.getURL("EasyReader/src/core/sanitization.js")
            );

            // ✅ akzeptiere named oder default; werf klaren Fehler, falls nichts passt
            const fn = (mod as any).sanitizeHTML || (mod as any).default;
            if (typeof fn !== "function") {
                throw new Error(
                    "sanitization.js exportiert keine Funktion sanitizeHTML (named oder default)."
                );
            }
            _sanitizeHTML = fn as (dirty: string) => string;
        }
        return _sanitizeHTML!;
    }

    function getDarkOrLight() {

        const body = document.body;
        const html = document.documentElement;

        const htmlBg = window.getComputedStyle(html).backgroundColor;
        const bodyBg = body ? window.getComputedStyle(body).backgroundColor : "";

        const baseColor = (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" && bodyBg !== "transparent")
            ? bodyBg
            : htmlBg;


        const nums = baseColor.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];

        if (
            baseColor === "transparent" ||
            (nums.length === 4 && nums[3] === 0)
        ) {
            return "black";
        }

        if (!nums || nums.length < 3) {

            return "black";
        }


        const [r, g, b] = nums;

        const avg = (r + g + b) / 3;

        console.log(avg)
        console.log(nums)

        return avg > 128 ? 'black' : 'white'

    }

    function createOriginalTextButton() {
        const originalButton = document.createElement('button')

        originalButton.style.padding = "6px 12px";
        originalButton.style.backgroundColor = "#2A9DF4";
        originalButton.style.color = "#FFFAFA";
        originalButton.style.border = "none";
        originalButton.style.borderRadius = "10px";
        originalButton.style.cursor = "pointer";
        originalButton.style.fontFamily = "'Inter', sans-serif"
        originalButton.style.fontWeight = "700";
        originalButton.style.fontSize = "16px";
        originalButton.style.marginBottom = "10px"
        originalButton.style.marginTop = "10px"

        //hover
        originalButton.addEventListener("mouseover", () => {
            originalButton.style.backgroundColor = "rgb(106, 183, 243)";
            originalButton.style.color = "rgba(255, 250, 250, 0.74)"
        });

        originalButton.addEventListener("mouseout", () => {
            originalButton.style.backgroundColor = "#2A9DF4";
            originalButton.style.color = "#FFFAFA";
        });


        return originalButton as HTMLButtonElement
    }

    function hTagCheck(element: HTMLElement) {
        return /^H[1-6]$/.test(element.tagName);
    }

    function idCheck(element: HTMLElement) {

        if (!element.id) {

            element.id = `generated-${Math.random().toString(36).slice(2, 11)}`
        }
    }

    function getParentSnapshot(parent: HTMLElement): string {
        idCheck(parent)

        if (parentSnapshot.parentId !== parent.id) {
            parentSnapshot = { parentId: parent.id, tag: parent.innerHTML }
        }

        return parentSnapshot.tag
    }

    function tableCheck(element: HTMLElement) {
        switch (element.tagName) {
            case "TR":
            case "TH":
            case "TD":
            case "TBODY":
            case "THEAD":
            case "TFOOT":
                return true;
            default:
                return false;
        }
    }

    function errorHeaderCheck(element: HTMLElement) {
        if (element.id === "errorHeader") {
            return true
        } else {
            return false
        }

    }

    function sendMessage(action: string, text: string, targetId: string, parentId: string, parentElement: string, mode: string) {

        chrome.runtime.sendMessage({
            action: action,
            text: text,
            targetId: targetId,
            parentId: parentId,
            parentElement: parentElement,
            mode: mode,
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

    function findTableTag(el: HTMLElement) {
        let current: HTMLElement | null = el
        let countLoops = 0
        let maxcountLoops = 10

        while (current && countLoops < maxcountLoops) {
            if (current.tagName === "TABLE") {
                return current as HTMLElement
            }

            current = current.parentElement
            countLoops++
        }

        return null
    }


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
        (async () => {
            const sanitizeHTML = await getSanitizeHTML();
        })();
        if (message.action === "active") {

            sendResponse({ status: "ready" });
        }

        if (message.action === "approved") {

            sendResponse("transmitted");

            (async () => {

                const htmlElement: HTMLElement = rightClickedElement

                if (htmlElement instanceof HTMLElement) {

                    if (!(htmlElement.classList.contains("EasyReader-marker"))) {

                        if (htmlElement.parentElement) {
                            const parent = htmlElement.parentElement
                            const originalParent = getParentSnapshot(parent)
                            let tableTag: HTMLTableElement | null = null
                            let tableBodyTag: HTMLTableSectionElement | null = null
                            let newParent: HTMLElement | null = parent
                            let loops = 0;
                            const maxLoops = 10

                            if (tableCheck(htmlElement)) {

                                while (newParent.tagName && loops < maxLoops) {

                                    if (newParent.tagName === "TABLE") {
                                        tableTag = newParent as HTMLTableElement
                                        break;
                                    }

                                    if (newParent.tagName === "TBODY") {
                                        tableBodyTag = newParent as HTMLTableSectionElement
                                    }

                                    newParent = newParent.parentElement!
                                    loops++
                                }

                                if (!tableTag) return;

                                if (!tableBodyTag) {
                                    tableBodyTag = tableTag.tBodies?.[0] ?? null;
                                }



                                const beforTableP = document.createElement("p");
                                beforTableP.innerHTML = "<b>Tabelle wird übersetzt</b>"
                                beforTableP.className = "tableTranslationNotice"

                                tableTag.parentElement?.insertBefore(beforTableP, tableTag)

                                if (!tableBodyTag) {
                                    idCheck(tableTag);
                                    sendMessage("approved element", tableTag.innerHTML, tableTag.id, tableTag.parentElement?.id ?? "", tableTag.innerHTML, message.mode);

                                } else {
                                    idCheck(tableTag)
                                    idCheck(tableBodyTag!)
                                    for (const child of tableBodyTag!.children) {
                                        const row = child as HTMLElement
                                        idCheck(child as HTMLElement);

                                        chrome.runtime.sendMessage({
                                            action: 'approved element',
                                            text: row.innerHTML,
                                            targetId: row.id,
                                            parentId: tableTag.id,
                                            mode: message.mode,
                                            tableTag: tableTag ? tableTag.innerHTML : tableBodyTag.innerHTML,
                                            tableId: tableTag.id
                                        })

                                    }
                                }

                            } else {
                                idCheck(parent)

                                for (const child of parent.children) {
                                    const el = child as HTMLElement

                                    if (el.innerText && !hTagCheck(el) && !errorHeaderCheck(el)) {

                                        idCheck(el);

                                        sendMessage("approved element", el.innerHTML, el.id, parent.id, originalParent, message.mode);

                                        el.innerHTML = "<b>Text wird übersetzt: </b>" + el.innerHTML
                                    }

                                }

                            }
                        } else {

                            if (htmlElement.innerText && !hTagCheck(htmlElement) && !errorHeaderCheck(htmlElement)) {

                                idCheck(htmlElement)

                                sendMessage("approved element", htmlElement.innerHTML, htmlElement.id, "", '', message.mode)

                                htmlElement.innerHTML = "<b>Text wird übersetzt: </b>" + htmlElement.innerHTML;

                            }

                        }

                    }

                } else {
                    console.log("kein html element")
                }


            })();

            return false;
        }

        if (message.action === "translated") {
            (async () => {

                if (message.targetId && message.text) {
                    const element = document.getElementById(message.targetId)
                    let parent: HTMLElement | null | undefined = null;
                    let isTable = false
                    const tableBannerFlag = 'easyReaderTableBanner'


                    if (message.parentId) {
                        if (element?.tagName === 'LI') {
                            parent = document.getElementById(message.parentId)?.parentElement
                        } else if (tableCheck(element as HTMLElement)) {
                            isTable = true;

                            const originalTable = findTableTag(element as HTMLElement)
                            parent = originalTable

                            if (originalTable) {
                                const prev = originalTable.previousElementSibling as HTMLElement | null;
                                if (prev && prev.classList.contains('tableTranslationNotice')) {
                                    prev.remove();
                                }

                                if (!originalTable.dataset[tableBannerFlag]) {
                                    originalTable.dataset[tableBannerFlag] = '1'

                                    const tableBanner = document.createElement('div');
                                    tableBanner.className = "easyReaderTableBanner"

                                    const tabelNotice = document.createElement('b')
                                    tabelNotice.textContent = "Tabelle in einfache Sprache übersetzt"

                                    const br = document.createElement('br')

                                    const originalTableButton = createOriginalTextButton()
                                    originalTableButton.innerText = "Originale Tabelle anzeigen"

                                    tableBanner.appendChild(tabelNotice)
                                    tableBanner.appendChild(br)
                                    tableBanner.appendChild(originalTableButton)

                                    originalTable.parentElement?.insertBefore(tableBanner, originalTable)

                                    originalTableButton.addEventListener("click", (event) => {
                                        const btn = event.currentTarget as HTMLButtonElement

                                        if (message.tableTag && message.tableId) {
                                            const table = document.getElementById(message.tableId)

                                            if (table) {
                                                table.innerHTML = message.tableTag

                                                btn.closest('.easyReaderTableBanner')?.remove()
                                            }
                                        } else {
                                            location.reload()

                                        }

                                        delete originalTable.dataset[tableBannerFlag];
                                    })
                                }

                            }


                        } else {
                            parent = document.getElementById(message.parentId)
                        }

                        const marker = parent?.querySelector('b.EasyReader-marker')

                        if (!marker) {
                            if (!isTable) {
                                const translationBanner = document.createElement('div')
                                translationBanner.className = "easyReaderBanner"


                                const beginBold = document.createElement('b')
                                beginBold.className = 'EasyReader-marker'
                                beginBold.textContent = "Der eingerahmte Text wurde in einfache Sprache übersetzt."

                                const br = document.createElement('br')


                                const originalButton = createOriginalTextButton()
                                originalButton.textContent = "Originaltext anzeigen"


                                translationBanner.appendChild(beginBold)
                                translationBanner.appendChild(br)
                                translationBanner.appendChild(originalButton)

                                if (parent) {

                                    const mode = getDarkOrLight()

                                    console.log(mode)

                                    parent.style.border = '1px';
                                    parent.style.borderStyle = 'solid'
                                    parent.style.borderColor = mode
                                    parent.style.padding = '10px'
                                }

                                parent?.prepend(translationBanner)


                                originalButton.addEventListener("click", (event) => {
                                    const btn = event.currentTarget as HTMLButtonElement

                                    if (message.originalText) {
                                        if (message.parentElement && parent) {
                                            parent.innerHTML = message.parentElement
                                        } else if (element) {
                                            (element as HTMLElement).innerHTML = message.originalText
                                        }

                                        document.getElementById('originalButton')?.remove()
                                        document.getElementById('beginBold')?.remove()

                                        if (parent) {
                                            parent.style.border = "0px"
                                            parent.style.padding = "0px"
                                        }

                                    } else {
                                        location.reload()
                                    }

                                    btn.closest(".easyReaderBanner")?.remove()
                                })



                            }


                        }


                        if (element) {
                            const sanitizeHTML = await getSanitizeHTML();

                            element.innerHTML = sanitizeHTML(message.text);


                        }

                    } else {
                        if (element) {
                            const headingButtonHTML = `<p>
                            <b>Der eingerahmte Text wurde in Einfache Sprache Übersetzt.</b>
                            </p>
                            <button type="button" id="button">Originaltext anzeigen</button>
                            <br>`
                            const sanitizeHTML = await getSanitizeHTML();
                            element.innerHTML = headingButtonHTML + sanitizeHTML(message.text)

                        }
                    }
                }
                sendResponse?.({ ok: true })
            })();
            return false;
        }

        if (message.action === "error") {
            const parent = document.getElementById(message.parentId!)
            const target = document.getElementById(message.targetId!)

            const errorHeader = document.createElement('p');
            const errorText = document.createElement('b')
            const br = document.createElement('br')
            const retryTranslation = createOriginalTextButton()
            retryTranslation.innerText = 'Übersetzung erneut versuchen'
            retryTranslation.addEventListener('click', () => {
                chrome.runtime.sendMessage({
                    action: 'retry'
                })

                const header = document.getElementById("errorHeader")

                if (header) {
                    header.remove()
                }
            })
            errorHeader.style.color = 'red'
            errorHeader.id = 'errorHeader'
            errorText.innerText = "Beim übersetzen ist ein Fehler aufgetreten versuche es erneut!"

            errorHeader.append(errorText)
            errorHeader.append(br)
            errorHeader.append(retryTranslation)

            const isError = document.getElementById('errorHeader')

            if (!isError) {
                if (parent) {
                    parent.prepend(errorHeader);
                    (target as HTMLElement).innerHTML = message.originalText!
                } else {
                    target?.prepend(errorHeader);
                    (target as HTMLElement).innerHTML = message.originalText!
                }
            } else {

                (target as HTMLElement).innerHTML = message.originalText!

            }
        }

        if (message.action === "reload") {
            location.reload();
        }
    })
}