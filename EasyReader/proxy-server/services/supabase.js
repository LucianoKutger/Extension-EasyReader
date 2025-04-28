const {createClient} = require('@supabase/supabase-js')


const SUPABASE_KEY  = process.env.SUPABASE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL

if(!SUPABASE_KEY || !SUPABASE_URL){
    throw new Error('No SUPABASE_KEY or SUPABASE_URL found')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkForTranslationinSupabase(hash, mode){
    
        const { data, error} = await supabase
            .from('translations') 
            .select('translation')
            .eq('hash', hash)
            .eq('mode', mode)

            if(error){
                console.error('Fehler: ',error)
                throw new Error(error)
             
            }

            if(data){
                if(data.length == 0){
                    return null
                }else{
                    return data[0].translation
                }
            }
            
          
}

async function postTranslation(hash, mode, translation){
    
        const {data, error} = await supabase
        .from('translations')
        .insert({
            hash: hash, 
            mode:mode, 
            translation:translation})

        if(error){
            console.error('Fehler ', error)
            throw new Error(error)
        }

        if(data){
            return data.status
        }
        
}

module.exports = {checkForTranslationinSupabase, postTranslation}