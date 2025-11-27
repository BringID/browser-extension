import querySubgraph from "../query-subgraph"
import GET_MEMBER_INDEX from "../../queries/get-member-index";

async function getMemberIndex(identityCommitment: string): Promise<number | null> {
  try {
    const data = await querySubgraph<{ members: Array<{ index: number }> }>(
      GET_MEMBER_INDEX,
      { identityCommitment }
    );

    return data.members.length > 0 ? data.members[0].index : null;
  } catch (error) {
    console.error('Error getting member index:', error);
    throw error;
  }
}

export default getMemberIndex
