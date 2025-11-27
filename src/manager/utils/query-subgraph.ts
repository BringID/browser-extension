import api from "./api"

async function querySubgraph<T>(
  query: string,
  variables: Record<string, any> = {},
  subgraphUrl: string = 'https://api.goldsky.com/api/public/project_cm8g2ca7b0ewq01uea1xl12vp/subgraphs/semaphore-base-mainnet/2.0.0/gn'
): Promise<T> {

  const response = await api<T>(
    subgraphUrl,
    'POST',
    {
    },
    {
      query,
      variables,
    }
  )

  return response
}

export default querySubgraph