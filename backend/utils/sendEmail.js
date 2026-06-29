const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const data = await resend.emails.send({
      from: "TXLA Advisory <support@txlaadvisory.com>",
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", data);

    return data;
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
};

module.exports = sendEmail;