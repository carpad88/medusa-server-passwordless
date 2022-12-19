import jwt from 'jsonwebtoken'

class PasswordLessSubscriber {
  protected sendGridService: any;
  private readonly configModule_: any;

  constructor({ eventBusService, sendgridService, configModule }) {
    this.sendGridService = sendgridService;
    this.configModule_ = configModule
    eventBusService.subscribe('passwordless.login', this.handlePasswordlessLogin);
  }

  handlePasswordlessLogin = async (data) => {
    const { projectConfig: { jwt_secret } } = this.configModule_
    const token = jwt.sign({ email: data.email }, jwt_secret, { expiresIn: '5m' })

    await this.sendGridService.sendEmail({
      to: data.email,
      from: process.env.SENDGRID_FROM,
      templateId: data.isSignUp ? process.env.SENGRID_REGISTER_TEMPLATE_ID : process.env.SENGRID_LOGIN_TEMPLATE_ID,
      dynamic_template_data: {
        link: `${data.url}/auth/passwordless/validate?token=${token}`
      },
    })
  }
}

export default PasswordLessSubscriber;
