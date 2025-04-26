
async function postTranslationIntoStorage(hash:string, translation:string) {
    await chrome.storage.local.set({hash:translation})  
}

async function getTranslationFromStorage(hash: string): Promise<string | null>{
    return new Promise((resolve) => {
        chrome.storage.local.get([hash], (result) => {
            if(result[hash] !== undefined){
                resolve(result[hash]);
            }else{
                resolve(null);
            }
        });
    });
}