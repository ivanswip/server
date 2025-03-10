import { Entity, Result, UniqueEntityId } from '@standardnotes/domain-core'

import { RevisionMetadataProps } from './RevisionMetadataProps'

export class RevisionMetadata extends Entity<RevisionMetadataProps> {
  get id(): UniqueEntityId {
    return this._id
  }

  private constructor(props: RevisionMetadataProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(props: RevisionMetadataProps, id?: UniqueEntityId): Result<RevisionMetadata> {
    return Result.ok<RevisionMetadata>(new RevisionMetadata(props, id))
  }
}
