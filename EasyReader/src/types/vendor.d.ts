declare module '../../vendor/purify.es.mjs' {
    import DOMPurifyNS from 'dompurify';
    const createDOMPurify: (win: Window) => DOMPurifyNS.DOMPurifyI;
    export default createDOMPurify;
}