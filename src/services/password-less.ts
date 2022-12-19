import { CustomerService, TransactionBaseService } from '@medusajs/medusa'
import { MedusaError } from 'medusa-core-utils'
import { EntityManager } from 'typeorm'
import jwt from 'jsonwebtoken'

class PasswordLessService extends TransactionBaseService {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager
  private readonly customerService_: CustomerService
  private readonly configModule_: any;

  constructor(container) {
    super(container)
    this.customerService_ = container.customerService
    this.configModule_ = container.configModule
  }

  async validateMagicLink(token) {
    let decoded
    const { projectConfig: { jwt_secret } } = this.configModule_

    try {
      decoded = jwt.verify(token, jwt_secret)
    } catch (err) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid auth credentials.`)
    }

    if (!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('exp')) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Invalid auth credentials.`)
    }

    const customer = await this.customerService_.retrieveByEmail(decoded.email).catch(() => null)
    if (!customer) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, `There isn't a customer with email ${decoded.email}.`)
    }

    return customer
  }
}

export default PasswordLessService
