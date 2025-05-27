// import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


// const resend = new Resend(process.env.RESEND_API_KEY);

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

const sendEmailPasswordEmail = async (email, resetLink) => {
    try {
        console.log(email)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'AI-Home reset your password',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">AI-Home: Đặt lại mật khẩu</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AI-Home của mình.</p>
                <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
                <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Đặt lại mật khẩu</a>
                <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br>Đội ngũ AI-Home</p>
              </div>
            `
          };
          const info = await transporter.sendMail(mailOptions);

        if (error) {
            console.error("Error sendin email: ", error);
            return false
        }

        return {
            success: true,
            message: "Email reset password sent successfully",
            data: info
          };
    } catch (error) {
        console.error("Error sending email", error)
        return {
            success: false,
            message: "Error sending email",
            error: error
        }
    }
}

export default {sendEmailPasswordEmail}