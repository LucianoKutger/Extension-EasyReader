import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {Database} from '../../../database.types.js'


const SUPABASE_KEY: string | undefined = process.env.SUPABASE_KEY;
const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL

if(!SUPABASE_KEY || !SUPABASE_URL){
    throw new Error('No SUPABASE_KEY or SUPABASE_URL found')
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY)

export async function checkForTranslationinSupabase(hash: string ,mode:string ):Promise<string | null>{
    return new Promise(async (resolve) => {
        const { data, error} = await supabase
            .from('translations') 
            .select('translation')
            .eq('hash', hash)
            .eq('mode', mode)

            if(data){
                if(data.length == 0){
                    resolve(null)
                }else{
                    resolve(data[0].translation) 
                }
            }else if(error){
                throw new Error(error.code)
            }
    })        
}

export async function postTranslation(hash:string, mode:string, translation:string):Promise<string> {
    return new Promise(async (resolve) => {
        const {data, error} = await supabase
        .from('translations')
        .insert({hash: hash, mode:mode, translation:translation})

        if(data){
            resolve(data['status'])
        }else if(error){
            resolve(error.details)
        }

    })
}