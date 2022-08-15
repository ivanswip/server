import * as IORedis from 'ioredis'

import { Period } from '../../Domain/Time/Period'
import { PeriodKeyGeneratorInterface } from '../../Domain/Time/PeriodKeyGeneratorInterface'
import { AnalyticsActivity } from '../../Domain/Analytics/AnalyticsActivity'
import { AnalyticsStoreInterface } from '../../Domain/Analytics/AnalyticsStoreInterface'

export class RedisAnalyticsStore implements AnalyticsStoreInterface {
  constructor(private periodKeyGenerator: PeriodKeyGeneratorInterface, private redisClient: IORedis.Redis) {}

  async calculateActivityTotalCountOverTime(activity: AnalyticsActivity, period: Period): Promise<number> {
    if (
      ![Period.Last30Days, Period.Q1ThisYear, Period.Q2ThisYear, Period.Q3ThisYear, Period.Q4ThisYear].includes(period)
    ) {
      throw new Error(`Unsuporrted period: ${period}`)
    }

    const periodKeys = this.periodKeyGenerator.getDiscretePeriodKeys(Period.Last30Days)
    await this.redisClient.bitop(
      'OR',
      `bitmap:action:${activity}:timespan:${periodKeys[0]}-${periodKeys[periodKeys.length - 1]}`,
      ...periodKeys.map((p) => `bitmap:action:${activity}:timespan:${p}`),
    )

    await this.redisClient.expire(
      `bitmap:action:${activity}:timespan:${periodKeys[0]}-${periodKeys[periodKeys.length - 1]}`,
      3600,
    )

    return this.redisClient.bitcount(
      `bitmap:action:${activity}:timespan:${periodKeys[0]}-${periodKeys[periodKeys.length - 1]}`,
    )
  }

  async calculateActivityChangesTotalCount(
    activity: AnalyticsActivity,
    period: Period,
  ): Promise<Array<{ periodKey: string; totalCount: number }>> {
    if (
      ![Period.Last30Days, Period.Q1ThisYear, Period.Q2ThisYear, Period.Q3ThisYear, Period.Q4ThisYear].includes(period)
    ) {
      throw new Error(`Unsuporrted period: ${period}`)
    }

    const periodKeys = this.periodKeyGenerator.getDiscretePeriodKeys(Period.Last30Days)
    const counts = []
    for (const periodKey of periodKeys) {
      counts.push({
        periodKey,
        totalCount: await this.redisClient.bitcount(`bitmap:action:${activity}:timespan:${periodKey}`),
      })
    }

    return counts
  }

  async markActivity(activities: AnalyticsActivity[], analyticsId: number, periods: Period[]): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const activity of activities) {
      for (const period of periods) {
        pipeline.setbit(
          `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
          analyticsId,
          1,
        )
      }
    }

    await pipeline.exec()
  }

  async unmarkActivity(activities: AnalyticsActivity[], analyticsId: number, periods: Period[]): Promise<void> {
    const pipeline = this.redisClient.pipeline()

    for (const activity of activities) {
      for (const period of periods) {
        pipeline.setbit(
          `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
          analyticsId,
          0,
        )
      }
    }

    await pipeline.exec()
  }

  async wasActivityDone(activity: AnalyticsActivity, analyticsId: number, period: Period): Promise<boolean> {
    const bitValue = await this.redisClient.getbit(
      `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
      analyticsId,
    )

    return bitValue === 1
  }

  async calculateActivityRetention(
    activity: AnalyticsActivity,
    firstPeriod: Period,
    secondPeriod: Period,
  ): Promise<number> {
    const initialPeriodKey = this.periodKeyGenerator.getPeriodKey(firstPeriod)
    const subsequentPeriodKey = this.periodKeyGenerator.getPeriodKey(secondPeriod)

    const diffKey = `bitmap:action:${activity}:timespan:${initialPeriodKey}-${subsequentPeriodKey}`

    await this.redisClient.bitop(
      'AND',
      diffKey,
      `bitmap:action:${activity}:timespan:${initialPeriodKey}`,
      `bitmap:action:${activity}:timespan:${subsequentPeriodKey}`,
    )

    await this.redisClient.expire(diffKey, 3600)

    const retainedTotalInActivity = await this.redisClient.bitcount(diffKey)

    const initialTotalInActivity = await this.redisClient.bitcount(
      `bitmap:action:${activity}:timespan:${initialPeriodKey}`,
    )

    return Math.ceil((retainedTotalInActivity * 100) / initialTotalInActivity)
  }

  async calculateActivityTotalCount(activity: AnalyticsActivity, period: Period): Promise<number> {
    return this.redisClient.bitcount(
      `bitmap:action:${activity}:timespan:${this.periodKeyGenerator.getPeriodKey(period)}`,
    )
  }
}
