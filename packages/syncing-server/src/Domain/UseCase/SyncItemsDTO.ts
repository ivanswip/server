import { ItemHash } from '../Item/ItemHash'

export type SyncItemsDTO = {
  userUuid: string
  itemHashes: Array<ItemHash>
  computeIntegrityHash: boolean
  limit: number
  groupUuid?: string | null
  syncToken?: string | null
  cursorToken?: string | null
  contentType?: string
  apiVersion: string
  readOnlyAccess: boolean
  sessionUuid: string | null
}
