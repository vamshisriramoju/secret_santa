Secret Santa Generator

A Secret Santa Generator built with Node.js and Express that assigns Secret Santa pairs for participants. 
It avoids pairing partners together and sends an email to each participant with their Secret Santa assignment.

Features

Random Pairing: Randomly assigns each participant a Secret Santa, ensuring no participant is paired with their own partner.
Email Notifications: Automatically sends an email to each participant with their assigned Secret Santa.
Couple Handling: Allows you to specify partners (couples) to ensure they are not paired with each other.

Getting Started

Prerequisites

Node.js installed on your system
Gmail account for sending emails or another email provider (configurable)
Nodemailer package for email sending

Installation
Clone the repository:

git clone https://github.com/yourusername/secret-santa.git
cd secret-santa
Install dependencies:

npm install
Set up environment variables:

Create a .env file in the root of your project and add your Gmail credentials:

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
Note: Gmail requires an app password for Node.js applications. Generate an App Password and use it as EMAIL_PASS.


Make a POST request to generate Secret Santa pairs:

URL: http://localhost:3000/generate

Method: POST

Body (JSON format):

{
  "participants": [
    { "name": "Alice", "email": "alice@example.com", "partner": "Bob" },
    { "name": "Bob", "email": "bob@example.com", "partner": "Alice" },
    { "name": "Charlie", "email": "charlie@example.com" }
  ]
}