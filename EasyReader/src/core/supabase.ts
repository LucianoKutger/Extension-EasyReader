

import { resStatusData, resTranslationData } from '../types/resDataType.js'



export async function checkForTranslationinSupabase(hash: string, mode: string): Promise<string | null> {
    return await fetch('http://localhost:5001/api/supabaseGet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hash, mode: mode }),
    })
        .then(response => response.json() as Promise<resTranslationData>)
        .then(resTranslationData => {
            if (!resTranslationData) {
                throw new Error("There is no Transltion property in the response")
            }

            const translation = resTranslationData.translation

            return translation
        })
}

export async function postTranslationInSupabase(hash: string, mode: string, translation: string): Promise<string> {
    return fetch('http://localhost:5001/api/supabasePost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hash, mode: mode, translation: translation }),
    })
        .then(response => response.json() as Promise<resStatusData>)
        .then(resStatusData => {
            if (!resStatusData) {
                throw new Error("There is no status in the response")
            }
            const status = resStatusData.status

            return status
        })
}