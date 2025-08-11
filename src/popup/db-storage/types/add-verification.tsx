import { TVerification } from "../../types"

type TAddVerification = (
  verification: TVerification,
) => Promise<TVerification>

export default TAddVerification