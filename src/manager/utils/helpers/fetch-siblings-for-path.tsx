import querySubgraph from "../query-subgraph"
import GET_SIBLINGS from "../../queries/get-siblings"

async function fetchSiblingsForPath(
  groupId: string,
  siblingIndices: number[]
): Promise<Map<number, string>> {
  
  try {
    const data = await querySubgraph<{
      data: {
        group: {
        id: string;
        members: Array<{ index: number; identityCommitment: string }>;
      } | null
      }
    }>(GET_SIBLINGS, { groupId, indices: siblingIndices });

    if (!data.data.group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    const siblingsMap = new Map<number, string>();
    data.data.group.members.forEach(member => {
      siblingsMap.set(member.index, member.identityCommitment);
    });

    return siblingsMap;
  } catch (error) {
    console.error('Error fetching siblings:', error);
    throw error;
  }
}

export default fetchSiblingsForPath