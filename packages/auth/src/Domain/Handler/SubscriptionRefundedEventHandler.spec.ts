import 'reflect-metadata'

import { SubscriptionName } from '@standardnotes/common'
import { RoleName } from '@standardnotes/domain-core'
import { SubscriptionRefundedEvent } from '@standardnotes/domain-events'
import { Logger } from 'winston'

import * as dayjs from 'dayjs'

import { User } from '../User/User'
import { UserRepositoryInterface } from '../User/UserRepositoryInterface'
import { SubscriptionRefundedEventHandler } from './SubscriptionRefundedEventHandler'
import { UserSubscriptionRepositoryInterface } from '../Subscription/UserSubscriptionRepositoryInterface'
import { RoleServiceInterface } from '../Role/RoleServiceInterface'
import { OfflineUserSubscriptionRepositoryInterface } from '../Subscription/OfflineUserSubscriptionRepositoryInterface'
import { UserSubscription } from '../Subscription/UserSubscription'

describe('SubscriptionRefundedEventHandler', () => {
  let userRepository: UserRepositoryInterface
  let userSubscriptionRepository: UserSubscriptionRepositoryInterface
  let offlineUserSubscriptionRepository: OfflineUserSubscriptionRepositoryInterface
  let roleService: RoleServiceInterface
  let logger: Logger
  let user: User
  let event: SubscriptionRefundedEvent
  let timestamp: number

  const createHandler = () =>
    new SubscriptionRefundedEventHandler(
      userRepository,
      userSubscriptionRepository,
      offlineUserSubscriptionRepository,
      roleService,
      logger,
    )

  beforeEach(() => {
    user = {
      uuid: '123',
      email: 'test@test.com',
      roles: Promise.resolve([
        {
          name: RoleName.NAMES.ProUser,
        },
      ]),
    } as jest.Mocked<User>

    userRepository = {} as jest.Mocked<UserRepositoryInterface>
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(user)
    userRepository.save = jest.fn().mockReturnValue(user)

    userSubscriptionRepository = {} as jest.Mocked<UserSubscriptionRepositoryInterface>
    userSubscriptionRepository.updateEndsAt = jest.fn()
    userSubscriptionRepository.countByUserUuid = jest.fn().mockReturnValue(1)
    userSubscriptionRepository.countActiveSubscriptions = jest.fn().mockReturnValue(13)
    userSubscriptionRepository.findBySubscriptionId = jest
      .fn()
      .mockReturnValue([{ user: Promise.resolve(user) } as jest.Mocked<UserSubscription>])

    offlineUserSubscriptionRepository = {} as jest.Mocked<OfflineUserSubscriptionRepositoryInterface>
    offlineUserSubscriptionRepository.updateEndsAt = jest.fn()

    roleService = {} as jest.Mocked<RoleServiceInterface>
    roleService.removeUserRole = jest.fn()

    timestamp = dayjs.utc().valueOf()

    event = {} as jest.Mocked<SubscriptionRefundedEvent>
    event.createdAt = new Date(1)
    event.payload = {
      subscriptionId: 1,
      userEmail: 'test@test.com',
      subscriptionName: SubscriptionName.PlusPlan,
      timestamp,
      offline: false,
      userExistingSubscriptionsCount: 3,
      totalActiveSubscriptionsCount: 1,
      billingFrequency: 1,
      payAmount: 12.99,
    }

    logger = {} as jest.Mocked<Logger>
    logger.info = jest.fn()
    logger.warn = jest.fn()
  })

  it('should update the user role', async () => {
    await createHandler().handle(event)

    expect(roleService.removeUserRole).toHaveBeenCalledWith(user, SubscriptionName.PlusPlan)
  })

  it('should update subscription ends at', async () => {
    await createHandler().handle(event)

    expect(userSubscriptionRepository.updateEndsAt).toHaveBeenCalledWith(1, timestamp, timestamp)
  })

  it('should update offline subscription ends at', async () => {
    event.payload.offline = true

    await createHandler().handle(event)

    expect(offlineUserSubscriptionRepository.updateEndsAt).toHaveBeenCalledWith(1, timestamp, timestamp)
  })

  it('should not do anything if no user is found for specified email', async () => {
    userRepository.findOneByUsernameOrEmail = jest.fn().mockReturnValue(null)

    await createHandler().handle(event)

    expect(roleService.removeUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.updateEndsAt).not.toHaveBeenCalled()
  })

  it('should not do anything if username is invalid', async () => {
    event.payload.userEmail = '  '

    await createHandler().handle(event)

    expect(roleService.removeUserRole).not.toHaveBeenCalled()
    expect(userSubscriptionRepository.updateEndsAt).not.toHaveBeenCalled()
  })
})
