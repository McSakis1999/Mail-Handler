require("dotenv").config();
const express = require("express");
const hbs = require("nodemailer-express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors"); // Import the CORS middleware
const nodemailer = require("nodemailer");
const multer = require("multer"); //memory storage for files
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const corsOptions = {
//   origin: 'https://aipath.gr/',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
// };

// Enable CORS for all routes or specific routes as needed
//app.use(cors(corsOptions)); // This enables CORS for all routes

app.use(cors());

// point to the template folder
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve("./"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./"),
};
// use a template file with nodemailer

app.post("/api/submit-form", async (req, res) => {
  try {
    const formData = req.body; // Form data sent from Vue.js app
    console.log("Trying to send email... data:", req.body);

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SERVICE, // Replace with your email service provider (e.g., Gmail, Outlook)
      auth: {
        user: process.env.GMAIL_USER, // Replace with your email address
        pass: process.env.GMAIL_PASS, // Replace with your email password or use environment variables for security
      },
      port: 587,
      secure: false,
    });
    transporter.use("compile", hbs(handlebarOptions));

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Replace with your email address
      to: process.env.EMAIL_TO, // Replace with the recipient's email address
      template: "email",
      subject: formData.subject,
      context: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        content: formData.message,
      },
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Form submission failed" + error });
  }
});
app.post("/api/submit-siteForm", async (req, res) => {
  try {
    const formData = req.body; // Form data sent from Vue.js app
    console.log("Trying to send email... data:", formData);

    // Create a Nodemailer transporter
    // console.log(
    //   process.env.GMAIL_PASS,
    //   process.env.GMAIL_USER,
    //   process.env.GMAIL_SERVICE
    // );
    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SERVICE, // Replace with your email service provider (e.g., Gmail, Outlook)
      auth: {
        user: process.env.GMAIL_USER, // Replace with your email address
        pass: process.env.GMAIL_PASS, // Replace with your email password or use environment variables for security
      },
      port: 587,
      secure: false,
    });
    transporter.use("compile", hbs(handlebarOptions));

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Replace with your email address
      to: process.env.EMAIL_TO, // Replace with the recipient's email address
      template: "websiteOffer",
      subject: "Αίτημα Έργου από " + formData.companyName,
      context: formData,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Form submission failed" + error });
  }
});

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

app.post(
  "/api/submit-application-form",
  upload.single("file"),
  async (req, res) => {
    try {
      const formData = req.body; // Form data sent from Vue.js app
      console.log("Trying to send email... data:", formData);
      console.log("file", req.file.buffer);

      const cvData = req.file.buffer; // The file data received in the request body
      // Create a URL-friendly slug based on the applicant's name
      const slug = createFilenameFriendlySlug(formData.name);
      // Construct the filename for the CV attachment (if a file is attached)
      const fileExtension = cvData
        ? req.file.originalname.split(".").pop()
        : null;
      const cvFilename = cvData ? `${slug}-cv.${fileExtension}` : null;

      // Create a Nodemailer transporter
      const transporter = nodemailer.createTransport({
        host: process.env.GMAIL_SERVICE, // Replace with your email service provider (e.g., Gmail, Outlook)
        auth: {
          user: process.env.GMAIL_USER, // Replace with your email address
          pass: process.env.GMAIL_PASS, // Replace with your email password or use environment variables for security
        },
        port: 587,
        secure: false,
      });
      transporter.use("compile", hbs(handlebarOptions));

      // Create email content
      const mailOptions = {
        from: process.env.EMAIL_USER, // Replace with your email address
        to: process.env.EMAIL_TO, // Replace with the recipient's email address
        template: "email",
        subject: formData.subject,
        context: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: formData.subject,
          content: formData.message,
        },
        attachments: [
          cvData
            ? {
                filename: cvFilename,
                content: cvData,
              }
            : null, // Attach the file if it exists, otherwise, don't attach it
        ],
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Form submitted successfully" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Form submission failed" + error });
    }
  }
);

function createFilenameFriendlySlug(str) {
  // Replace non-alphanumeric characters (except for hyphens and underscores) with dashes
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") // Remove leading and trailing dashes
    .substr(0, 50); // Limit the slug to a reasonable length (e.g., 50 characters)
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
