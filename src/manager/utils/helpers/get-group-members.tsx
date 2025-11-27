import querySubgraph from "../query-subgraph"

async function getGroupMembers(groupId: string): Promise<Array<{ index: number; identityCommitment: string }>> {
  const GET_MEMBERS = `
    query GetMembers($groupId: String!, $first: Int!, $skip: Int!) {
      group(id: $groupId) {
        members(first: $first, skip: $skip) {
          index
          identityCommitment
        }
      }
    }
  `

  const allMembers: Array<{ index: number; identityCommitment: string }> = []
  const pageSize = 100
  let skip = 0

  while (true) {
    const result = await querySubgraph<{
      data: {
        group: {
          members: Array<{ index: number; identityCommitment: string }>
        }
      }
    }>(GET_MEMBERS, { groupId, first: pageSize, skip })

    const members = result.data.group.members

    allMembers.push(...members)

    if (members.length < pageSize) break // no more pages

    skip += pageSize
  }

  return allMembers
}

export default getGroupMembers