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
    const eventBus = req.scope.resolve('eventBusService')
    const customerService = req.scope.resolve('customerService')
    const { email, isSignUp } = req.body

    let customer = await customerService.retrieveByEmail(email).catch(() => null)

    if (!customer && !isSignUp) {
      res.status(404).json({ message: `Customer with ${email} was not found. Please sign up instead.` })
    }

    if (!customer && isSignUp) {
      customer = await customerService.withTransaction(manager).create({
        email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        has_account: true
      })
    }

    const url = `${req.protocol}://${req.get('host')}`

    try {
      await eventBus.withTransaction(manager).emit('passwordless.login', {
        email: customer.email,
        isSignUp,
        url
      })
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
    const loggedCustomer = passwordLessService.validateMagicLink(token)

    if (!loggedCustomer) {
      return res.status(403).json({ message: 'The user cannot be verified' })
    }

    req.session.jwt = jwt.sign(
      { customer_id: loggedCustomer.id },
      projectConfig.jwt_secret!,
      { expiresIn: '30d' }
    )

    return res.redirect(`${projectConfig.store_cors}/account`)
  })

  return app
}
