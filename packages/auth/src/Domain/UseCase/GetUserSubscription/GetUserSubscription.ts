import { UseCaseInterface } from '../UseCaseInterface'
import { inject, injectable } from 'inversify'
import TYPES from '../../../Bootstrap/Types'
import { GetUserSubscriptionDto } from './GetUserSubscriptionDto'
import { UserRepositoryInterface } from '../../User/UserRepositoryInterface'
import { GetUserSubscriptionResponse } from './GetUserSubscriptionResponse'
import { UserSubscriptionRepositoryInterface } from '../../Subscription/UserSubscriptionRepositoryInterface'

@injectable()
export class GetUserSubscription implements UseCaseInterface {
  constructor(
    @inject(TYPES.Auth_UserRepository) private userRepository: UserRepositoryInterface,
    @inject(TYPES.Auth_UserSubscriptionRepository)
    private userSubscriptionRepository: UserSubscriptionRepositoryInterface,
  ) {}

  async execute(dto: GetUserSubscriptionDto): Promise<GetUserSubscriptionResponse> {
    const { userUuid } = dto

    const user = await this.userRepository.findOneByUuid(userUuid)

    if (user === null) {
      return {
        success: false,
        error: {
          message: `User ${userUuid} not found.`,
        },
      }
    }

    const userSubscription = await this.userSubscriptionRepository.findOneByUserUuid(userUuid)

    return {
      success: true,
      user: { uuid: user.uuid, email: user.email },
      subscription: userSubscription,
    }
  }
}
