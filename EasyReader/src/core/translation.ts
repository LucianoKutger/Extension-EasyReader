import * as localStorage from './local-storage.js'
import * as hashing from './hashing.js'
import * as supabase from './supabase.js'
import * as openAi from './openAi.js'


export async function getTranslation(text: string, mode: string): Promise<string | boolean> {
    const hashString: string = await hashing.textToHash(text)
    let beginMarker = "<b>In Einfache Sprache Übersetzt: </b>"

    //check Local Storage
    try {
        const localStorageCheck: string | null = await localStorage.getTranslationFromStorage(hashString)
        if (localStorageCheck !== null) {
            return beginMarker + localStorageCheck
        }

    } catch (error) {
        console.error("Local Storage error:", error)
    }

    //check Supabase
    try {
        const supabaseCheck: string | null = await supabase.checkForTranslationinSupabase(hashString, mode)

        if (supabaseCheck !== null) {
            await localStorage.postTranslationIntoStorage(hashString, mode, supabaseCheck)
            return beginMarker + supabaseCheck
        }
    } catch (error) {
        console.error("Database error:", error)
    }

    //TODO: Implement error handeling(vorrübergehend)
    //Translate with AI
    try {

        const aiResponse: string = await openAi.getTranslationFromAi(text)

        await localStorage.postTranslationIntoStorage(hashString, mode, aiResponse)
        await supabase.postTranslationToSupabase(hashString, mode, aiResponse)

        return beginMarker + aiResponse

    } catch (error) {
        console.error("AI error:", error)
        return false
    }
}

