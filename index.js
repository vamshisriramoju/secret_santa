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
  const shuffled = [...participants];
  const santaPairs = {};

  // Shuffle and assign pairs, reshuffle if a partner is paired with their own partner
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    let receiver = shuffled[(i + 1) % shuffled.length];
    if (giver.partner === receiver.name) return null;
    santaPairs[giver.name] = receiver.name;
  }

  return santaPairs;
}

// Main form route
app.get("/", (req, res) => {
  res.render("index", { message: null });
});

// Generate route
app.post("/generate", async (req, res) => {
  const { participants } = req.body;
  const santaPairs = generateSecretSanta(participants);

  if (!santaPairs) {
    return res.render("index", { message: "Error: Could not assign pairs without pairing partners. Please try again." });
  }

  try {
    // Send email notifications
    for (let participant of participants) {
      const recipientName = santaPairs[participant.name];
      const recipientEmail = participants.find(p => p.name === recipientName).email;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: participant.email,
        subject: "Your Secret Santa Assignment!",
        text: `Hello ${participant.name},\n\nYou are the Secret Santa for ${recipientName}!\n\nHappy gifting! 🎅🎄`,
      };

      await transporter.sendMail(mailOptions);
    }

    res.render("result", { pairs: santaPairs });
  } catch (error) {
    console.error(error);
    res.render("index", { message: "Failed to send emails. Please check your email configuration." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Secret Santa app listening at http://localhost:${port}`);
});
