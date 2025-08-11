function api<T>(
  url: string,
  method: string = 'GET',
  headers: Record<string, string> = {},
  body: Record<string, any> = {}
): Promise<T> {
  return fetch(url, {
    method,
    body: method === 'GET' || method === 'OPTIONS' ? undefined : JSON.stringify(body),
    headers: {
      ...headers,
      'content-type': 'application/json'
    }
  })
    .then(async response => {
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }
      return response.json() as Promise<T>
    })
}

export default api