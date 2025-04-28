
export async function postTranslationIntoStorage(hash: string, mode: string, translation: string): Promise<boolean> {
    try {
        await chrome.storage.local.set({ hash: translation })
        return true
    } catch (error) {
        console.error("fehler: ", error)
        return false
    }
}

export async function getTranslationFromStorage(hash: string): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get([hash], (result) => {
            if (result[hash] !== undefined) {
                resolve(result[hash]);
            } else {
                resolve(null);
            }
        });
    });
}