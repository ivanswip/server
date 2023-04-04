import { Dates, Email, Uuid } from '@standardnotes/domain-core'

import { EmergencyAccessInvitationStatus } from './EmergencyAccessInvitationStatus'

export interface EmergencyAccessInvitationProps {
  grantorUuid: Uuid
  granteeEmail: Email
  granteeUuid?: Uuid
  status: EmergencyAccessInvitationStatus
  expiresAt: Date
  dates: Dates
}
