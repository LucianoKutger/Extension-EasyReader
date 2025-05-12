
export async function postTranslationIntoStorage(hash: string, mode: string, translation: string): Promise<boolean> {
    try {
        await chrome.storage.local.set({
            [hash]: {
                transaltion: translation,
                createdAt: Date.now()
            }
        })
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
                resolve(result[hash].transaltion);
            } else {
                resolve(null);
            }
        });
    });
}

export async function localStorageCron() {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const fullStorage = await chrome.storage.local.get();

    for (const key in fullStorage) {
        const item = fullStorage[key]

        if (item?.createdAt && now - item.createdAt > week) {
            await chrome.storage.local.remove(key)
        }
    }


}