import 'reflect-metadata'

import * as express from 'express'
import { results } from 'inversify-express-utils'

import { InversifyExpressListedController } from './InversifyExpressListedController'
import { User } from '../../Domain/User/User'
import { CreateListedAccount } from '../../Domain/UseCase/CreateListedAccount/CreateListedAccount'
import { ControllerContainerInterface } from '@standardnotes/domain-core'

describe('InversifyExpressListedController', () => {
  let createListedAccount: CreateListedAccount

  let request: express.Request
  let response: express.Response
  let user: User
  let controllerContainer: ControllerContainerInterface

  const createController = () => new InversifyExpressListedController(createListedAccount, controllerContainer)

  beforeEach(() => {
    controllerContainer = {} as jest.Mocked<ControllerContainerInterface>
    controllerContainer.register = jest.fn()

    user = {} as jest.Mocked<User>
    user.uuid = '123'

    createListedAccount = {} as jest.Mocked<CreateListedAccount>
    createListedAccount.execute = jest.fn()

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
  })

  it('should create a listed account for user', async () => {
    response.locals.user = {
      uuid: '1-2-3',
      email: 'test@test.com',
    }

    const httpResponse = <results.JsonResult>await createController().createListedAccount(request, response)
    const result = await httpResponse.executeAsync()

    expect(createListedAccount.execute).toHaveBeenCalledWith({
      userUuid: '1-2-3',
      userEmail: 'test@test.com',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should not create a listed account if sessions is read only', async () => {
    response.locals.readOnlyAccess = true
    response.locals.user = {
      uuid: '1-2-3',
      email: 'test@test.com',
    }

    const httpResponse = <results.JsonResult>await createController().createListedAccount(request, response)
    const result = await httpResponse.executeAsync()

    expect(createListedAccount.execute).not.toHaveBeenCalled()

    expect(result.statusCode).toEqual(401)
  })
})
