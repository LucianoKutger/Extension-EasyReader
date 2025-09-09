import { tabOnMessage, tabSendMessage } from "../types/messageType.js";
import { HTMLtarget } from "../types/targetType.js";



/**
 * Content-Script Guard:
 * Stelle sicher, dass der Code nur einmal pro Seite läuft.
 */
if (!(window as any).EasyReaderContentLoaded) {
    (window as any).EasyReaderContentLoaded = true;
    console.log("content geladen")


    let rightClickedElement: HTMLElement
    let parentSnapshot: { parentId: string | null; tag: string } = {
        parentId: null,
        tag: ""
    }


    let _sanitizeHTML: ((dirty: string) => string) | null = null;

    /**
   * Lazy-Loader für Sanitizer-Funktion.
   * Wird erst beim ersten Bedarf nachgeladen (aus extension bundle).
   */
    async function getSanitizeHTML(): Promise<(dirty: string) => string> {
        if (!_sanitizeHTML) {

            const mod = await import(
                chrome.runtime.getURL("EasyReader/src/core/sanitization.js")
            );


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

    /**
     * Ermittelt, ob der Seitenhintergrund eher hell oder dunkel ist,
     * um Rahmenfarbe (schwarz/weiß) für Banner/Markierung zu wählen.
     */

    function getDarkOrLight() {

        const body = document.body;
        const html = document.documentElement;

        const htmlBg = window.getComputedStyle(html).backgroundColor;
        const bodyBg = body ? window.getComputedStyle(body).backgroundColor : "";

        // Fallback: verwende body-Farbe, wenn vorhanden, sonst html
        const baseColor = (bodyBg && bodyBg !== "rgba(0, 0, 0, 0)" && bodyBg !== "transparent")
            ? bodyBg
            : htmlBg;

        // RGBA/HSLA Zahlen extrahieren
        const nums = baseColor.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];

        if (
            baseColor === "transparent" ||
            (nums.length === 4 && nums[3] === 0)
        ) {
            return "black";
        }

        //Default
        if (!nums || nums.length < 3) {

            return "black";
        }


        const [r, g, b] = nums;

        const avg = (r + g + b) / 3;

        console.log(avg)
        console.log(nums)

        return avg > 128 ? 'black' : 'white'

    }


    /**
    * Erzeugt einen einheitlich gestylten Button für "Originaltext anzeigen".
    */
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

    // Prüft, ob Element eine Überschrift (H1–H6) ist
    function hTagCheck(element: HTMLElement) {
        return /^H[1-6]$/.test(element.tagName);
    }

    // Stellt sicher, dass ein Element eine ID hat
    function idCheck(element: HTMLElement) {

        if (!element.id) {

            element.id = `generated-${Math.random().toString(36).slice(2, 11)}`
        }
    }

    // Merkt sich innerHTML des Parents (Snapshot) für "Original wiederherstellen"
    function getParentSnapshot(parent: HTMLElement): string {
        idCheck(parent)

        if (parentSnapshot.parentId !== parent.id) {
            parentSnapshot = { parentId: parent.id, tag: parent.innerHTML }
        }

        return parentSnapshot.tag
    }

    // Erkennung von Tabellenelementen (Zellen/Zeilen/Section-Tags)
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

    // Banner/Fehler-Header erkennen, um nicht doppelt zu arbeiten
    function errorHeaderCheck(element: HTMLElement) {
        return (
            element.id === "errorHeader" ||
            element.classList.contains("errorHeader") ||
            element.closest(".errorHeader") !== null
        );

    }

    // Kleiner Wrapper für Runtime-Messages (vereinheitlicht)
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

    /**
    * Wenn Inline-Element angeklickt wurde, arbeite stattdessen mit dem Block-Parent,
    * damit Banner/Rahmen sauber dargestellt werden.
    */
    function parentCheck(htmlElement: HTMLElement): HTMLElement {

        const displayType = window.getComputedStyle(htmlElement).display

        if (displayType === "inline") {
            const parent = htmlElement.parentElement

            return parent ?? htmlElement

        } else {

            return htmlElement

        }
    }

    /**
     * Läuft vom aktuellen Element nach oben und findet das <table>-Element (max. 50 Ebenen).
     */
    function findTableTag(el: HTMLElement) {
        let current: HTMLElement | null = el
        let countLoops = 0
        let maxcountLoops = 50

        while (current && countLoops < maxcountLoops) {
            if (current.tagName === "TABLE") {
                return current as HTMLElement
            }

            current = current.parentElement
            countLoops++
        }

        return null
    }



    /**
     * Merkt sich das Element, auf das der Nutzer im Kontextmenü gezeigt hat.
     */
    document.addEventListener("contextmenu", (event) => {
        const htmlElement = event.target as HTMLElement

        if (htmlElement instanceof HTMLElement) {


            const htmlElement = event.target as HTMLElement

            if (htmlElement instanceof HTMLElement) {

                rightClickedElement = parentCheck(htmlElement)

            }

        }
    })

    /**
    * Zentrale Message-Bridge zwischen Background/Popup und Content-Script.
    */
    chrome.runtime.onMessage.addListener((message: tabOnMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
        (async () => {
            const sanitizeHTML = await getSanitizeHTML();
        })();

        // Health-Check vom Background
        if (message.action === "active") {

            sendResponse({ status: "ready" });
        }

        /**
         * "approved" → Nutzer hat Übersetzung bestätigt.
         * Jetzt relevante DOM-Teile identifizieren und an Background senden.
         */
        if (message.action === "approved") {

            sendResponse("transmitted");

            (async () => {

                const htmlElement: HTMLElement = rightClickedElement

                if (htmlElement instanceof HTMLElement) {

                    // Verhindert Mehrfach-Markierung
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

                                // Tabellenbehandlung: versuche TABLE/TBODY zu finden
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


                                // Fallback: erstes TBODY, falls keines explizit gefunden
                                if (!tableBodyTag) {
                                    tableBodyTag = tableTag.tBodies?.[0] ?? null;
                                }


                                // Hinweis über der Tabelle einfügen (wird übersetzt)
                                const beforTableP = document.createElement("p");
                                beforTableP.innerHTML = "<b>Tabelle wird übersetzt</b>"
                                beforTableP.className = "tableTranslationNotice"

                                tableTag.parentElement?.insertBefore(beforTableP, tableTag)

                                if (!tableBodyTag) {
                                    // Ganze Tabelle senden
                                    idCheck(tableTag);
                                    sendMessage("approved element", tableTag.innerHTML, tableTag.id, tableTag.parentElement?.id ?? "", tableTag.innerHTML, message.mode);

                                } else {
                                    // Zeilenweise senden
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
                                // Nicht-Tabelle: iteriere über Childelemente im Parent

                                idCheck(parent)

                                for (const child of parent.children) {
                                    const el = child as HTMLElement

                                    // Überschriften und Fehlerbanner auslassen
                                    if (el.innerText && !hTagCheck(el) && !errorHeaderCheck(el)) {

                                        idCheck(el);

                                        sendMessage("approved element", el.innerHTML, el.id, parent.id, originalParent, message.mode);

                                        // Nutzerfeedback: „wird übersetzt“-Hinweis
                                        el.innerHTML = "<b>Text wird übersetzt: </b>" + el.innerHTML
                                    }

                                }

                            }
                        } else {

                            // Falls kein Parent (Edge-Case): direkt das Element behandeln
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

        /**
         * "translated" → Background liefert übersetzten HTML-String.
         * Banners einfügen, Text sanitizen und DOM aktualisieren.
         */
        if (message.action === "translated") {
            (async () => {

                // Vorherige Fehlermeldung (falls vorhanden) entfernen
                const parentForCleanup =
                    (message.parentId && document.getElementById(message.parentId)) as HTMLElement | null;

                parentForCleanup?.querySelector('.errorHeader')?.remove();

                if (message.targetId && message.text) {
                    const element = document.getElementById(message.targetId)
                    let parent: HTMLElement | null | undefined = null;
                    let isTable = false
                    const tableBannerFlag = 'easyReaderTableBanner'


                    if (message.parentId) {
                        // Sonderfall <li>: Banner gehört auf UL/OL-Parent
                        if (element?.tagName === 'LI') {
                            parent = document.getElementById(message.parentId)?.parentElement
                        } else if (tableCheck(element as HTMLElement)) {
                            // Tabellen-Flow: Banner & Original-Button oberhalb der Tabelle

                            isTable = true;

                            const originalTable = findTableTag(element as HTMLElement)
                            parent = originalTable

                            if (originalTable) {
                                // „Wird übersetzt“-Hinweis entfernen
                                const prev = originalTable.previousElementSibling as HTMLElement | null;
                                if (prev && prev.classList.contains('tableTranslationNotice')) {
                                    prev.remove();
                                }

                                // Nur ein Banner pro Tabelle
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

                                    // Stellt Original-Tabelle wieder her
                                    originalTableButton.addEventListener("click", (event) => {
                                        const btn = event.currentTarget as HTMLButtonElement

                                        if (message.tableTag && message.tableId) {
                                            const table = document.getElementById(message.tableId)

                                            if (table) {
                                                table.innerHTML = message.tableTag

                                                btn.closest('.easyReaderTableBanner')?.remove()
                                            }
                                        } else {
                                            // Fallback: komplette Seite neu laden
                                            location.reload()

                                        }

                                        delete originalTable.dataset[tableBannerFlag];
                                    })
                                }

                            }


                        } else {
                            parent = document.getElementById(message.parentId)
                        }

                        // Prüfe, ob bereits ein Übersetzungsbanner existiert
                        const marker = parent?.querySelector('b.EasyReader-marker')

                        if (!marker) {
                            if (!isTable) {

                                // Banner für normale (Nicht-Tabellen-)Bereiche
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

                                    // Optisch rahmen: Farbe abhängig vom Seitenhintergrund
                                    parent.style.border = '1px';
                                    parent.style.borderStyle = 'solid'
                                    parent.style.borderColor = mode
                                    parent.style.padding = '10px'
                                }

                                parent?.prepend(translationBanner)

                                // Originalzustand wiederherstellen
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
                                        // Fallback: reload, falls Original nicht vorliegt
                                        location.reload()
                                    }

                                    btn.closest(".easyReaderBanner")?.remove()
                                })



                            }


                        }

                        // Ziel-Element mit sanitiztem HTML befüllen
                        if (element) {
                            const sanitizeHTML = await getSanitizeHTML();

                            element.innerHTML = sanitizeHTML(message.text);


                        }

                    } else {
                        // Kein parentId: einfacher Fallback mit Button/Heading
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

        /**
        * Fehlerfall: Banner anzeigen und Originaltext zurückschreiben.
        * Zusätzlich „Erneut versuchen“-Button, der denselben Target-Knoten erneut sendet.
        */
        if (message.action === "error") {
            const parent = document.getElementById(message.parentId!)
            const target = document.getElementById(message.targetId!)

            const errorHeader = document.createElement('div');
            const errorText = document.createElement('b')
            const br = document.createElement('br')
            const retryTranslation = createOriginalTextButton()
            retryTranslation.innerText = 'Übersetzung erneut versuchen'
            retryTranslation.addEventListener('click', () => {
                if (message.targetId) {
                    const target = document.getElementById(message.targetId)

                    if (target) {
                        rightClickedElement = target

                        chrome.runtime.sendMessage({
                            action: 'retry'
                        })
                    } else {
                        console.log("no Parent")
                    }

                }
            })
            errorHeader.style.color = 'red'
            errorHeader.className = 'errorHeader'
            errorText.innerText = "Beim übersetzen ist ein Fehler aufgetreten versuche es erneut!"

            errorHeader.append(errorText)
            errorHeader.append(br)
            errorHeader.append(retryTranslation)

            const isError = parent?.querySelector('.errorHeader')

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

        // Wird vom Background getriggert, um die Seite hart neu zu laden
        if (message.action === "reload") {
            location.reload();
        }
    })
}