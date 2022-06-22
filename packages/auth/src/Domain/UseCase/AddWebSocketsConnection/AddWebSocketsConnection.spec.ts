import 'reflect-metadata'
import { Logger } from 'winston'
import { WebSocketsConnectionRepositoryInterface } from '../../WebSockets/WebSocketsConnectionRepositoryInterface'

import { AddWebSocketsConnection } from './AddWebSocketsConnection'

describe('AddWebSocketsConnection', () => {
  let webSocketsConnectionRepository: WebSocketsConnectionRepositoryInterface
  let logger: Logger

  const createUseCase = () => new AddWebSocketsConnection(webSocketsConnectionRepository, logger)

  beforeEach(() => {
    webSocketsConnectionRepository = {} as jest.Mocked<WebSocketsConnectionRepositoryInterface>
    webSocketsConnectionRepository.saveConnection = jest.fn()

    logger = {} as jest.Mocked<Logger>
    logger.debug = jest.fn()
  })

  it('should save a web sockets connection for a user for further communication', async () => {
    await createUseCase().execute({ userUuid: '1-2-3', connectionId: '2-3-4' })

    expect(webSocketsConnectionRepository.saveConnection).toHaveBeenCalledWith('1-2-3', '2-3-4')
  })
})
