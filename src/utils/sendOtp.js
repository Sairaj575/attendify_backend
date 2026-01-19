<<<<<<< HEAD
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
=======
// const axios = require("axios");

// const sendOtp = async (phone, otp) => {
//   try {
//     const formattedPhone = phone.replace("+91", "");

//     const response = await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       {
//         route: "v3", // transactional route
//         numbers: formattedPhone,
//         message: `Your Attendify OTP is ${otp}. Valid for 5 minutes.`,
//         sender_id: "TXTIND", // default sender
//       },
//       {
//         headers: {
//           authorization: process.env.FAST2SMS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       },
//     );

//     console.log("TRANSACTIONAL SMS SENT:", response.data);
//   } catch (error) {
//     console.error("FAST2SMS FAILED:", error.response?.data || error.message);
//     throw error;
//   }
// };

// module.exports = sendOtp;

const sendOtp = async (phone, otp) => {
  console.log(`DEV OTP for ${phone}: ${otp}`);
>>>>>>> 3c7e23ac363daf5710eed7dc3fc2c06b85d6cda0
};

module.exports = sendOtp;
