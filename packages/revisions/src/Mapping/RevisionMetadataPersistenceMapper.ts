import { MapperInterface, Dates, UniqueEntityId } from '@standardnotes/domain-core'

import { ContentType } from '../Domain/Revision/ContentType'
import { RevisionMetadata } from '../Domain/Revision/RevisionMetadata'
import { TypeORMRevision } from '../Infra/TypeORM/TypeORMRevision'

export class RevisionMetadataPersistenceMapper implements MapperInterface<RevisionMetadata, TypeORMRevision> {
  toDomain(projection: TypeORMRevision): RevisionMetadata {
    const contentTypeOrError = ContentType.create(projection.contentType)
    if (contentTypeOrError.isFailed()) {
      throw new Error(`Could not create content type: ${contentTypeOrError.getError()}`)
    }
    const contentType = contentTypeOrError.getValue()

    const datesOrError = Dates.create(projection.createdAt, projection.updatedAt)
    if (datesOrError.isFailed()) {
      throw new Error(`Could not create dates: ${datesOrError.getError()}`)
    }
    const dates = datesOrError.getValue()

    const revisionMetadataOrError = RevisionMetadata.create(
      {
        contentType,
        dates,
      },
      new UniqueEntityId(projection.uuid),
    )

    if (revisionMetadataOrError.isFailed()) {
      throw new Error(`Could not create revision metdata: ${revisionMetadataOrError.getError()}`)
    }

    return revisionMetadataOrError.getValue()
  }

  toProjection(_domain: RevisionMetadata): TypeORMRevision {
    throw new Error('Method not implemented.')
  }
}
