import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {Database} from '../../../database.types.js'


const SUPABASE_KEY: string | undefined = process.env.SUPABASE_KEY;
const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL

if(!SUPABASE_KEY || !SUPABASE_URL){
    throw new Error('No SUPABASE_KEY or SUPABASE_URL found')
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY)

async function checkForTranslation(hash: string ,mode:string ):Promise<string>{
    const { data, error } = await supabase
    .from('translations')
    .select('translation')
    .eq('hash', hash)
    .eq('mode', mode)

    if(data){
        if(data.length == 0){
            console.log("no match")
            return "no match"
        }else{
            console.log(data[0].translation)
            return data[0].translation
        }
    }else if(error){
        throw new Error(error.code)
    }else{
        return "weder noch"
    }

}


checkForTranslation("h","leicht")