//to,from,subject,text
const mailer = require('nodemailer');

///function

const sendingMail = async (to, subject, text) => {

    const transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: "akhilesh9426@gmail.com",
            pass: "dxzx arba xuyl bcbc"
        }
    })

    const mailOptions = {
        from: 'akhilesh9426@gmail.com',
        to: to,
        subject: subject,
        text: text
        //html:"<h1>"+text+"</h1>"
    }

    const mailresponse = await transporter.sendMail(mailOptions);
    console.log(mailresponse);
    return mailresponse;

}

module.exports = {
    sendingMail
}
// sendingMail("akhilesh9426@gmail.com","Test Mail","this is test mail")
