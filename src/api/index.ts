import { Router, json } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { projectConfig } from '../../medusa-config'

const corsOptions = {
  origin: projectConfig.store_cors.split(','),
  credentials: true
}

const route = Router()

export default () => {
  const app = Router()
  app.use(cors(corsOptions))
  app.use(json());

  app.use('/auth', route)

  route.post('/passwordless/sent', async (req, res) => {
    const manager = req.scope.resolve('manager')
    const customerService = req.scope.resolve('customerService')
    const { email, isSignUp } = req.body

    let customer = await customerService.retrieveRegisteredByEmail(email).catch(() => null)

    if (!customer && !isSignUp) {
      res.status(404).json({ message: `Customer with ${email} was not found. Please sign up instead.` })
    }

    if (!customer && isSignUp) {
      customer = await customerService.withTransaction(manager).create({
        email,
        first_name: '--',
        last_name: '--',
        has_account: true
      })
    }

    const passwordLessService = req.scope.resolve('passwordLessService')

    try {
      await passwordLessService.sendMagicLink(customer.email, isSignUp)
      return res.status(204).json({ message: 'Email sent' })
    } catch (error) {
      return res.status(404).json({ message: `There was an error sending the email.` })
    }
  })

  route.get('/passwordless/validate', async (req, res) => {
    const { token } = req.query
    const { projectConfig } = req.scope.resolve('configModule')

    if (!token) {
      return res.status(403).json({ message: 'The user cannot be verified' })
    }

    const passwordLessService = req.scope.resolve('passwordLessService')

    try {
      const loggedCustomer = await passwordLessService.validateMagicLink(token)

      req.session.jwt_store = jwt.sign(
        { customer_id: loggedCustomer.id },
        projectConfig.jwt_secret!,
        { expiresIn: '30d' }
      )

      return res.status(200).json({ ...loggedCustomer })
    } catch (error) {
      return res.status(403).json({ message: 'The user cannot be verified' })
    }
  })

  return app
}
