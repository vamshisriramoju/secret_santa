require('dotenv').config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const port = 3000;

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to generate Secret Santa pairs avoiding partners
function generateSecretSanta(participants) {
  const maxAttempts = 200;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const santaPairs = {};
    let valid = true;

    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i];
      const receiver = shuffled[(i + 1) % shuffled.length];

      if (giver.partner && giver.partner === receiver.name) {
        valid = false;
        break; // Retry
      }

      santaPairs[giver.name] = receiver.name;
    }

    if (valid) return santaPairs;
  }

  return null; // Failed after multiple attempts
}

// Routes
app.get("/", (req, res) => {
  res.render("index", { message: null });
});

app.post("/generate", async (req, res) => {
  const { participants } = req.body;
  const santaPairs = generateSecretSanta(participants);

  if (!santaPairs) {
    return res.render("index", {
      message: "Error: Could not assign pairs without pairing partners. Please try again.",
    });
  }

  try {
    for (let participant of participants) {
      const recipientName = santaPairs[participant.name];
      const recipientEmail = participants.find((p) => p.name === recipientName).email;

      const mailOptions = {
        from: `"🎅 Secret Santa" <${process.env.EMAIL_USER}>`,
        to: participant.email,
        subject: "🎁 Your Secret Santa Assignment!",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f9fafc; padding: 20px; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #e63946, #ffb703); padding: 15px; border-radius: 8px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎅 Secret Santa 2025 🎄</h1>
            </div>
            
            <div style="background-color: #fff; margin-top: 20px; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333;">Hello <strong>${participant.name}</strong>,</p>
              <p style="font-size: 16px; color: #333;">
                You’ve been chosen as the <strong>Secret Santa</strong> for:
              </p>
              
              <div style="text-align: center; margin: 20px 0;">
                <h2 style="color: #2a9d8f; font-size: 24px;">🎁 ${recipientName} 🎁</h2>
              </div>

              <p style="font-size: 15px; color: #555;">
                Keep it a secret and make sure your gift brings a smile 😊
              </p>

              <p style="font-size: 15px; color: #555;">
                Wishing you a fun and festive celebration!
              </p>
            </div>

            <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #777;">
              <p>Made with ❤️ by the Secret Santa Team</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${participant.name} (${participant.email})`);
    }

    res.render("result", { pairs: santaPairs });
  } catch (error) {
    console.error(error);
    res.render("index", { message: "❌ Failed to send emails. Please check your email configuration." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🎄 Secret Santa app listening at http://localhost:${port}`);
});
