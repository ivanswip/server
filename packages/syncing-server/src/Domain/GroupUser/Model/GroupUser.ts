import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'group_users' })
export class GroupUser {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({
    name: 'group_uuid',
    length: 36,
  })
  declare groupUuid: string

  @Column({
    name: 'user_uuid',
    length: 36,
  })
  declare userUuid: string

  @Column({
    name: 'encrypted_group_key',
  })
  declare encryptedGroupKey: string

  @Column({
    name: 'sender_public_key',
  })
  declare senderPublicKey: string

  @Column({
    name: 'created_at_timestamp',
    type: 'bigint',
  })
  declare createdAtTimestamp: number

  @Column({
    name: 'updated_at_timestamp',
    type: 'bigint',
  })
  declare updatedAtTimestamp: number
}
