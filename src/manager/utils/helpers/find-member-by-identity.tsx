import querySubgraph from "../query-subgraph"

import FIND_MEMBER_BY_IDENTITY from "../../queries/find-member-by-identity"

async function findMemberByIdentity(identityCommitment: string): Promise<any | null> {
  try {
    const data = await querySubgraph<{ data: any }>(
      FIND_MEMBER_BY_IDENTITY,
      { identityCommitment }
    )

    console.log({ data })

    return data.data.members.length > 0 ? data.data.members[0] : null;
  } catch (error) {
    console.error('Error finding member by identity:', error);
    throw error;
  }
}


export default findMemberByIdentity
