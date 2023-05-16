import { ProjectorInterface } from '../../../Projection/ProjectorInterface'
import { SyncItemsResponse } from '../../UseCase/SyncItemsResponse'
import { Item } from '../Item'
import { ItemConflict } from '../ItemConflict'
import { ItemConflictProjection } from '../../../Projection/ItemConflictProjection'
import { ItemProjection } from '../../../Projection/ItemProjection'
import { SyncResponse20200115 } from './SyncResponse20200115'
import { SyncResponseFactoryInterface } from './SyncResponseFactoryInterface'
import { SavedItemProjection } from '../../../Projection/SavedItemProjection'
import { GroupUserKey } from '../../GroupUserKey/Model/GroupUserKey'
import { GroupUserKeyProjection } from '../../../Projection/GroupUserKeyProjection'

export class SyncResponseFactory20200115 implements SyncResponseFactoryInterface {
  constructor(
    private itemProjector: ProjectorInterface<Item, ItemProjection>,
    private itemConflictProjector: ProjectorInterface<ItemConflict, ItemConflictProjection>,
    private savedItemProjector: ProjectorInterface<Item, SavedItemProjection>,
    private groupUserKeyProjector: ProjectorInterface<GroupUserKey, GroupUserKeyProjection>,
  ) {}

  async createResponse(syncItemsResponse: SyncItemsResponse): Promise<SyncResponse20200115> {
    const retrievedItems = []
    for (const item of syncItemsResponse.retrievedItems) {
      retrievedItems.push(<ItemProjection>await this.itemProjector.projectFull(item))
    }

    const savedItems = []
    for (const item of syncItemsResponse.savedItems) {
      savedItems.push(<SavedItemProjection>await this.savedItemProjector.projectFull(item))
    }

    const conflicts = []
    for (const itemConflict of syncItemsResponse.conflicts) {
      conflicts.push(<ItemConflictProjection>await this.itemConflictProjector.projectFull(itemConflict))
    }

    const groupKeys = []
    for (const groupKey of syncItemsResponse.groupKeys) {
      groupKeys.push(<GroupUserKeyProjection>await this.groupUserKeyProjector.projectFull(groupKey))
    }

    return {
      retrieved_items: retrievedItems,
      saved_items: savedItems,
      conflicts,
      sync_token: syncItemsResponse.syncToken,
      cursor_token: syncItemsResponse.cursorToken,
      group_keys: groupKeys,
    }
  }
}
