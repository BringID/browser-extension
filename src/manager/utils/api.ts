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
    .then(response => {
      if (!response.ok) {
        console.log({ response })
        throw new Error(response.statusText)
      }
      return response.json() as Promise<T>
    })
}

export default api