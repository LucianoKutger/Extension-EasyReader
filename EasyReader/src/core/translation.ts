import * as localStorage from './local-storage.js'
import * as hashing from './hashing.js'
import * as supabase from './supabase.js'


async function getTranslation(text: string, mode: string): Promise<string>{
    const hashString = hashing.hashString(text)
    const localStorageCheck = await localStorage.getTranslationFromStorage(hashString)
    if(localStorageCheck !== null){
        return localStorageCheck
    }

    const supabaseCheck = await supabase.checkForTranslationinSupabase(hashString, mode)
    if(supabaseCheck !== null){
        return supabaseCheck
    }
    //TODO: Implement call to Proxy for ai translation and return response
    const aiResponse = "Insert AI logic"

    return aiResponse
}