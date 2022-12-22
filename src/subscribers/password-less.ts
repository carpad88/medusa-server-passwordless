class PasswordLessSubscriber {
  protected sendGridService: any;
  constructor({ eventBusService, sendgridService }) {
    this.sendGridService = sendgridService;
    eventBusService.subscribe('passwordless.login', this.handlePasswordlessLogin);
  }

  handlePasswordlessLogin = async (data) => {
    await this.sendGridService.sendEmail({
      to: data.email,
      from: process.env.SENDGRID_FROM,
      templateId: data.isSignUp ? process.env.SENGRID_REGISTER_TEMPLATE_ID : process.env.SENGRID_LOGIN_TEMPLATE_ID,
      dynamic_template_data: {
        token: data.token
      },
    })
  }
}

export default PasswordLessSubscriber;
