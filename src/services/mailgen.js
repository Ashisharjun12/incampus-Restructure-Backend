import mailgen from "mailgen";
import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }

})


//send forgot password email

export const mailGenerator = new mailgen({
    theme: "default",
    product: {
        name: "INCampus Forgot password",
        link: "http://localhost:3000"
    }
})


