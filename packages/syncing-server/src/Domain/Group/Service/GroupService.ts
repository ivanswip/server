import { GroupUser } from '../../GroupUser/Model/GroupUser'
import { Group } from '../Model/Group'

import { GroupsRepositoryInterface } from '../Repository/GroupRepositoryInterface'
import { GroupServiceInterface } from './GroupServiceInterface'

import { GroupFactoryInterface } from '../Factory/GroupFactoryInterface'
import { TimerInterface } from '@standardnotes/time'
import { GroupUserServiceInterface } from '../../GroupUser/Service/GroupUserService'

import { v4 as uuidv4 } from 'uuid'

export class GroupService implements GroupServiceInterface {
  constructor(
    private groupRepository: GroupsRepositoryInterface,
    private groupFactory: GroupFactoryInterface,
    private groupUserService: GroupUserServiceInterface,

    private timer: TimerInterface,
  ) {}

  async createGroup(userUuid: string): Promise<Group | null> {
    const group = this.groupFactory.create({
      userUuid,
      groupHash: {
        uuid: uuidv4(),
        user_uuid: userUuid,
        created_at_timestamp: this.timer.getTimestampInSeconds(),
        updated_at_timestamp: this.timer.getTimestampInSeconds(),
      },
    })

    const savedGroup = await this.groupRepository.create(group)

    return savedGroup
  }

  async addUserToGroup(dto: {
    groupUuid: string
    ownerUuid: string
    inviteeUuid: string
    encryptedGroupKey: string
    senderPublicKey: string
  }): Promise<GroupUser | null> {
    const user = await this.groupUserService.createGroupUser({
      groupUuid: dto.groupUuid,
      userUuid: dto.inviteeUuid,
      encryptedGroupKey: dto.encryptedGroupKey,
      senderPublicKey: dto.senderPublicKey,
    })

    return user
  }
}
