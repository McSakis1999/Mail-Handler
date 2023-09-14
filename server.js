require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the CORS middleware
const nodemailer = require('nodemailer');
const app = express();

app.use(bodyParser.json());

// const corsOptions = {
//   origin: 'http://localhost:8080',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// }; 

// Enable CORS for all routes or specific routes as needed
//app.use(cors(corsOptions)); // This enables CORS for all routes

app.use(cors());

app.post('/api/submit-form', async (req, res) => {
    try {
        const formData = req.body; // Form data sent from Vue.js app
        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE, // Replace with your email service provider (e.g., Gmail, Outlook)
          auth: {
            user: process.env.EMAIL_USER, // Replace with your email address
            pass: process.env.EMAIL_PASS, // Replace with your email password or use environment variables for security
          },
        });
    
        // Create email content
        const mailOptions = {
          from: 'sakismitsikostas@gmail.com', // Replace with your email address
          to: 'sakismitsikostas@gmail.com', // Replace with the recipient's email address
          subject: formData.subject,
          // text: `
          //   Name: ${formData.name}
          //   Email: ${formData.email} - Phone: ${formData.phone}
          //   Message: ${formData.message}
          // `,
          text : `<html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Contact Form Inquiry</title>
              <style>
                  /* Reset some default styles to ensure consistent rendering in email clients */
                  body, table, td, a {
                      font-family: Arial, sans-serif;
                      font-size: 14px;
                  }
                  table {
                      border-collapse: collapse;
                  }
                  td {
                      padding: 10px;
                      border: 1px solid #dddddd;
                  }
                  a {
                      color: #007bff;
                      text-decoration: none;
                  }
                  /* Style your email content here */
                  .email-container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                  }
                  .header {
                      background-color: #007bff;
                      color: #fff;
                      text-align: center;
                      padding: 20px;
                  }
                  .content {
                      padding: 20px;
                  }
                  .message {
                      border: 1px solid #dddddd;
                      padding: 10px;
                  }
              </style>
          </head>
          <body>
              <div class="email-container">
                  <div class="header">
                      <h1>Contact Form Inquiry</h1>
                  </div>
                  <div class="content">
                      <p>Hello,</p>
                      <p>You have received a new inquiry from a customer: </p>
                      <table>
                          <tr>
                              <td><strong>Name:</strong></td>
                              <td>${formData.name}</td> <!-- Replace with customer's name -->
                          </tr>
                          <tr>
                              <td><strong>Email:</strong></td>
                              <td>${formData.email}</td> <!-- Replace with customer's email -->
                          </tr>
                          <tr>
                              <td><strong>Phone:</strong></td>
                              <td>${formData.phone}</td> <!-- Replace with customer's phone number -->
                          </tr>
                          <tr>
                              <td><strong>Subject:</strong></td>
                              <td>${formData.subject}</td> <!-- Replace with subject from the contact form -->
                          </tr>
                      </table>
                      <p><strong>Message:</strong></p>
                      <div class="message">
                          <p>
                          ${formData.content}
                          </p>
                      </div>
                  </div>
              </div>
          </body>
          </html>`
        };
    
        // Send the email
        await transporter.sendMail(mailOptions);
    
        res.status(200).json({ message: 'Form submitted successfully' });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Form submission failed'+error });
      }
    
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});