

export async function checkForTranslationinSupabase(hash: string, mode: string): Promise<string | null> {

    try {
        const response = await fetch('http://localhost:5001/api/supabaseGet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hash, mode }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP-Fehler ${response.status}: ${errorText}`);
        }

        const resTranslationData = await response.json() as { translation: string | null };

        if (!resTranslationData || typeof resTranslationData.translation === 'undefined') {
            throw new Error("Es fehlt die 'translation'-Eigenschaft in der Server-Antwort");
        }

        return resTranslationData.translation;

    } catch (error) {
        console.error("Fehler beim Abrufen der Übersetzung:", error);
        throw error; // optional: throw new Error("Übersetzung konnte nicht geladen werden");
    }
}

export async function postTranslationToSupabase(hash: string, mode: string, translation: string): Promise<string> {


    try {
        const response = await fetch('http://localhost:5001/api/supabasePost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'

            },
            body: JSON.stringify({ hash, mode, translation }),
        });

        // Prüfe HTTP-Statuscode
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP-Fehler ${response.status}: ${errorText}`);
        }

        const resStatusData = await response.json() as { status: string };

        if (!resStatusData || typeof resStatusData.status === 'undefined') {
            throw new Error("Es fehlt die 'status'-Eigenschaft in der Server-Antwort");
        }

        return resStatusData.status;

    } catch (error) {
        console.error("Fehler beim Posten der Übersetzung:", error);
        throw error;
    }
}
