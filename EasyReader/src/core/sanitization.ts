// @ts-ignore
import createDOMPurify from "../../vendor/purify.es.mjs";


const DOMPurify = createDOMPurify(window);

export const sanitizingConfig = {
    FORBID_TAGS: [
        'script', 'noscript', 'iframe', 'object', 'embed', 'applet',
        'link', 'meta', 'style', 'video', 'audio', 'source', 'picture',
        'canvas', 'svg', 'math', 'template', 'img'
    ],
    FORBID_ATTR: ['srcdoc'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    RETURN_DOM: false,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true
};

export const ALLOWED_CSS = new Set([
    'color', 'background-color', 'font-weight', 'font-style', 'text-decoration',
    'text-align', 'font-size', 'font-family', 'white-space', 'line-height', 'letter-spacing',
    'margin', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom',
    'padding', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom',
    'border', 'border-width', 'border-style', 'border-color', 'border-radius', 'display'
]);

DOMPurify.addHook('uponSanitizeAttribute', (element: any, attr: any) => {
    const attrName = attr.attrName
    const attrValue = (attr.attrValue || '').trim();

    if (attrName === 'style') {
        const safeDeclarations: string[] = [];
        for (const declaration of attrValue.split(';')) {
            const [rawProp, ...rawValueParts] = declaration.split(':');
            if (!rawProp || !rawValueParts.length) continue;

            const cssProperty = rawProp.trim().toLocaleLowerCase();
            const cssValue = rawValueParts.join(':').trim();

            if (!ALLOWED_CSS.has(cssProperty)) continue
            if (/url\s*\(/i.test(cssValue)) continue;
            if (/expression\s*\(/i.test(cssValue)) continue;
            if (/-moz-binding/i.test(cssValue)) continue;
            if (cssProperty === 'position' || cssProperty === 'z-index' || cssProperty === 'filter') continue;

            safeDeclarations.push(`${cssProperty}:${cssValue}`)

        }

        if (safeDeclarations.length) {
            attr.attrValue = safeDeclarations.join(';')
        } else {
            attr.keepAttr = false
        }
    }

    if ((attrName === "href" || attrName === "src" || attrName === "action") && attrValue) {
        const isSafeUrl = /^(https?:\/\/|mailto:|#|\/(?!\/)|\.{0,2}\/|\w[^:]*$)/i.test(attrValue);

        if (!isSafeUrl) {
            attr.keepAttr = false
        }
    }
});

function checkForCell(html: string): boolean {
    const stripped = html.replace(/<!--[\s\S]*?-->/g, '');

    return /^(?:\s*<(?:td|th)\b[^>]*>[\s\S]*?<\/(?:td|th)>\s*)+$/i.test(stripped);
}

export function sanitizeHTML(dirtyElement: string): string {
    const wrapped = checkForCell(dirtyElement)
        ? `<table><tbody><tr>${dirtyElement}</tr></tbody></table>`
        : dirtyElement;

    const sanitizedDom = DOMPurify.sanitize(wrapped, {
        ...sanitizingConfig,
        RETURN_DOM: true
    }) as HTMLElement | DocumentFragment;

    if (checkForCell(dirtyElement)) {

        const tr =
            (sanitizedDom as HTMLElement).querySelector?.('tr') ??
            (sanitizedDom as DocumentFragment).firstChild?.firstChild?.firstChild;

        return tr instanceof HTMLElement ? tr.innerHTML : '';
    }

    return DOMPurify.sanitize(dirtyElement, sanitizingConfig) as string;
}

export default sanitizeHTML