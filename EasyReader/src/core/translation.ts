import * as localStorage from './local-storage.js'
import * as hashing from './hashing.js'
import * as supabase from './supabase.js'
import * as openAi from './openAi.js'


async function getTranslation(text: string, mode: string): Promise<string>{
    const hashString: string = hashing.hashString(text)
    const localStorageCheck: string | null = await localStorage.getTranslationFromStorage(hashString)
    if(localStorageCheck !== null){
        return localStorageCheck
    }

    const supabaseCheck: string | null = await supabase.checkForTranslationinSupabase(hashString, mode)
    if(supabaseCheck !== null){
        return supabaseCheck
    }
    //TODO: Implement error handeling(vorrübergehend)
    const aiResponse: string = await openAi.getTranslationFromAi(text)
    if(aiResponse === 'error'){
        return 'Es ist ein Fehler aufgetreten versuche es nochmal'
    }
    
    return aiResponse
    

}