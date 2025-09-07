import * as localStorage from './local-storage.js'
import * as hashing from './hashing.js'
import * as supabase from './supabase.js'
import * as openAi from './openAi.js'


export async function getTranslation(text: string, mode: string): Promise<string> {
    const hashString: string = await hashing.textToHash(text)

    //check Local Storage
    try {
        const localStorageCheck: string | null = await localStorage.getTranslationFromStorage(hashString)
        if (localStorageCheck !== null) {

            return localStorageCheck
        }

    } catch (error) {
        throw error
    }

    //check Supabase
    try {
        const supabaseCheck: string | null = await supabase.checkForTranslationinSupabase(hashString, mode)

        if (supabaseCheck !== null) {
            await localStorage.postTranslationIntoStorage(hashString, mode, supabaseCheck)
            return supabaseCheck
        }
    } catch (error) {
        throw error
    }

    //TODO: Implement error handeling(vorrübergehend)
    //Translate with AI
    try {

        const aiResponse: string = await openAi.getTranslationFromAi(text)

        await localStorage.postTranslationIntoStorage(hashString, mode, aiResponse)
        await supabase.postTranslationToSupabase(hashString, mode, aiResponse)

        return aiResponse

    } catch (error) {
        console.error("AI error:", error)
        //TODO: Error handeling
        throw error
    }
}

