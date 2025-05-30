

export async function getTranslationFromAi(paragraph: string): Promise<string> {


  try {
    const response = await fetch('https://easyreader-proxy.onrender.com/api/aiTranslation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paragraph }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP-Fehler ${response.status}: ${errorText}`);
    }

    const resData = await response.json() as { response: string };

    if (!resData || typeof resData.response !== 'string') {
      throw new Error('Die API-Antwort enthält kein gültiges `response`-Feld');
    }

    return resData.response

  } catch (error) {
    console.error('Fehler beim Abrufen der Übersetzung von GPT:', error);
    return 'error';
  }
}
