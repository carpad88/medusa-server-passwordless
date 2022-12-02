import { CustomerService, TransactionBaseService } from '@medusajs/medusa'
import { MedusaError } from 'medusa-core-utils'
import { EntityManager } from 'typeorm'
import jwt from 'jsonwebtoken'

class PasswordLessService extends TransactionBaseService {
  protected manager_: EntityManager
  protected transactionManager_: EntityManager
  private readonly customerService_: CustomerService
  private readonly emailService_: any
  private readonly configModule_: any;
  private readonly jwt_secret: any;

  constructor(container) {
    super(container)
    this.customerService_ = container.customerService
    this.emailService_ = container.sendgridService
    this.configModule_ = container.configModule

    const { projectConfig: { jwt_secret } } = this.configModule_
    this.jwt_secret = jwt_secret
  }

  async sendMagicLink(email, isSignUp, url) {
    const templateId = isSignUp ? process.env.SENGRID_REGISTER_TEMPLATE_ID : process.env.SENGRID_LOGIN_TEMPLATE_ID
    const token = jwt.sign({ email }, this.jwt_secret, { expiresIn: '5m' })

    const options = {
      to: email,
      from: process.env.SENDGRID_FROM,
      templateId,
      dynamic_template_data: {
        link: `${url}/auth/passwordless/validate?token=${token}`
      },
    }

    try {
      return await this.emailService_.sendEmail(options)
    } catch (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `There was an error sending the email.`)
    }
  }

  async validateMagicLink(token) {
    let decoded

    try {
      decoded = jwt.verify(token, this.jwt_secret)
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
