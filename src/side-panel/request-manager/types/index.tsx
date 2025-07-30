import TCollectRequestData from "./collect-request-data"
import TRequestData from './request-item'

interface IRequests {
  headers: TRequestData
  cookies: TRequestData

  collectRequestData: TCollectRequestData

}

export default IRequests