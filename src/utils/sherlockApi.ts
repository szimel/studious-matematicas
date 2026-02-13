/* eslint-disable no-console */
import { API_CONFIG } from './apiConfig';

export async function getParsedData(formData: FormData) {
  console.log(API_CONFIG.BASE_URL);
  const response = await fetch(`${API_CONFIG.BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'x-api-key': API_CONFIG.API_KEY as string,
    },
    body: formData,
  });

  console.log(response);
  if (!response.ok) {
    console.log(response);
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || 'Server analysis failed');
  }

  return response.json();
}