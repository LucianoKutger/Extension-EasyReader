const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken');
require("dotenv").config();





const requiredEnvVars = ['SUPABASE_KEY', 'SUPABASE_URL', 'SUPABASE_JWT_SECRET', 'PROJECT_ID'];

requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Environment variable "${key}" is missing`);
    }
});

const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const PROJECT_ID = process.env.PROJECT_ID;

if (!SUPABASE_KEY || !SUPABASE_URL) {
    throw new Error('No SUPABASE_KEY or SUPABASE_URL found')
}

function createJWT() {
    return jwt.sign({
        project_id: PROJECT_ID
    },
        SUPABASE_JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' })
}

const token = createJWT()



const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    },
});

async function checkForTranslationinSupabase(hash, mode) {

    const { data, error } = await supabase
        .from('translations')
        .select('translation')
        .eq('hash', hash)
        .eq('mode', mode)

    if (error) {
        console.error('Fehler: ', error)
        throw new Error(error)

    }

    if (data) {
        if (data.length == 0) {
            return null
        } else {
            return data[0].translation
        }
    }


}

async function postTranslation(hash, mode, translation) {

    const { data, error } = await supabase
        .from('translations')
        .insert({
            hash: hash,
            mode: mode,
            translation: translation
        })

    if (error) {
        console.error('Fehler ', error)
        throw new Error(error)
    }

    if (data) {
        return data.status
    }

}

module.exports = { checkForTranslationinSupabase, postTranslation }