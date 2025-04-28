import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {Database} from '../../../database.types.js'
import {resStatusData, resTranslationData} from '../types/resDataType.js'


const SUPABASE_KEY: string | undefined = process.env.SUPABASE_KEY;
const SUPABASE_URL: string | undefined = process.env.SUPABASE_URL

if(!SUPABASE_KEY || !SUPABASE_URL){
    throw new Error('No SUPABASE_KEY or SUPABASE_URL found')
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY)

export async function checkForTranslationinSupabase(hash: string ,mode:string ):Promise<string | null>{
    const { default: fetch } = await import('node-fetch');
    
    return fetch('http://localhost:5001/api/translation', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hash, mode: mode }),
      })
      .then( response => response.json() as Promise<resTranslationData>)
      .then( resTranslationData => {
        if(!resTranslationData){
            throw new Error("There is no Transltion property in the response")
        }

        const translation = resTranslationData.translation

        return translation
    })
}

export async function postTranslation(hash:string, mode:string, translation:string):Promise<string> {
    return fetch('http://localhost:5001/api/translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hash, mode: mode, translation: translation }),
      })
      .then(response => response.json() as Promise<resStatusData>)
      .then(resStatusData => {
        if(!resStatusData){
            throw new Error("There is no status in the response")
        }
        const status = resStatusData.status
        
        return status
    })
}