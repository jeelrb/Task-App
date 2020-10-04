const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'jeelrb30@gmail.com',
    subject: 'Thanks for Joining in!',
    text: `Welcome to the app ${ name }. Let me know how you get along with the app`
  }
  sgMail.send(msg).then(() => {
    console.log('Message Sent successfully!')
  }).catch((e) => {
    console.log(e)
  })
}

const sendAccDeleteEmail = (email, name) => {
    const msg = {
      to: email,
      from: 'jeelrb30@gmail.com',
      subject: 'Thanks for using App',
      text: `Hey ${name}! Let me know if you encountered any problem using this app, so that I can fix it for you.`
    }
    sgMail.send(msg).then(() => {
      console.log('Message sent successfully')
    }).catch((e) => {
      console.log(e)
    })
}

module.exports = {
  sendWelcomeEmail,
  sendAccDeleteEmail
}
