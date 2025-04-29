import { resData } from '../types/resDataType.js';

export async function getTranslationFromAi(paragraph: string): Promise<string> {

  return await fetch('http://localhost:5001/api/aiTranslation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paragraph: paragraph }),
  })
    .then(response => response.json() as Promise<resData>)
    .then(resData => {
      if (!resData.response) {
        throw new Error('API response is missing the `response` property');
      }

      const translation = resData.response;

      return translation.replace(/\\n/g, '\n');
    })

    .catch(error => {
      console.error('Error fetching from GPT:', error);
      return 'error';
    });
}