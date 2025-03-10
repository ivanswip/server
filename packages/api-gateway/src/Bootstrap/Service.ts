import { ServiceContainerInterface, ServiceIdentifier, ServiceInterface } from '@standardnotes/domain-core'

import { ContainerConfigLoader } from './Container'

export class Service implements ServiceInterface {
  constructor(private serviceContainer: ServiceContainerInterface) {
    this.serviceContainer.register(this.getId(), this)
  }

  async handleRequest(_request: never, _response: never, _endpointOrMethodIdentifier: string): Promise<unknown> {
    throw new Error('Requests are handled via inversify-express at ApiGateway level')
  }

  async getContainer(): Promise<unknown> {
    const config = new ContainerConfigLoader()

    return config.load(this.serviceContainer)
  }

  getId(): ServiceIdentifier {
    return ServiceIdentifier.create(ServiceIdentifier.NAMES.Auth).getValue()
  }
}
