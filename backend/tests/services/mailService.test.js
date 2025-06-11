// tests/services/mailService.test.js

jest.mock('../../mailer/mailer', () => ({
    sendMailgenEmail: jest.fn().mockResolvedValue(),
    APP_NAME:     'MyApp',
    APP_URL:      'https://example.com/',
    LOGO_URL:     'https://cdn.example.com/logo.png'
  }))
  
  const {
    sendWelcomeEmail,
    sendPasswordChangedEmail
  } = require('../../services/mailService')  
  
  const {
    sendMailgenEmail,
    APP_NAME,
    APP_URL,
    LOGO_URL
  } = require('../../mailer/mailer')
  
  describe('mailService', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })
  
    describe('sendWelcomeEmail()', () => {
      it('composes and sends the correct welcome email', async () => {
        const user  = { _id: 'u123', name: 'Alice', email: 'alice@example.com' }
        const token = 'tok-xyz'
  
        await sendWelcomeEmail(user, token)
  
       
        expect(sendMailgenEmail).toHaveBeenCalledTimes(1)
  
        
        const [ to, subject, body ] = sendMailgenEmail.mock.calls[0]
  
       
        expect(to).toBe(user.email)
  
       
        expect(subject).toBe(`Welcome to ${APP_NAME}!`)
  
        
        expect(body.body.name).toBe(user.name)
  
       
        const expectedUrl = `${APP_URL}activate/${user._id}/${token}`
        expect(body.body.action.button.link).toBe(expectedUrl)
  
       
        expect(body.body.intro).toContain(`<img src="${LOGO_URL}"`)
      })
    })
  
    describe('sendPasswordChangedEmail()', () => {
      it('composes and sends the correct password‐changed email', async () => {
        const user = { name: 'Bob', email: 'bob@example.com' }
  
        await sendPasswordChangedEmail(user)
  
        expect(sendMailgenEmail).toHaveBeenCalledTimes(1)
        const [ to, subject, body ] = sendMailgenEmail.mock.calls[0]
  
        expect(to).toBe(user.email)
        expect(subject).toBe(`Your ${APP_NAME} Password Was Changed`)
  
        
        expect(body.body.name).toBe(user.name)
  
        
        expect(body.body.action.button.link).toBe(`${APP_URL}reset-password`)
  
       
        expect(body.body.intro).toContain(`src="${LOGO_URL}"`)
      })
    })
  })
  