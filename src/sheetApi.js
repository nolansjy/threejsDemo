const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function loadSheetData({ forceRefresh = false } = {}) {
  const url = new URL(`${API_BASE_URL}/api/sheet-data`);
  if (forceRefresh) {
    url.searchParams.set('refresh', '1');
  }

  //const tFetchStart = performance.now();
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  //console.log(`fetch() headers/response in ${Math.round(performance.now() - tFetchStart)} ms`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}