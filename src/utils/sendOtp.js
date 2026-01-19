const twilio = require("twilio");

const client = new twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOtp = async (phone, otp) => {
  await client.messages.create({
    body: `Your OTP is ${otp}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
};

module.exports = sendOtp;
