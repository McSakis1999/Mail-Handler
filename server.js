require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- HANDLEBARS -------------------- */
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve("./"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./"),
};

/* -------------------- MULTER -------------------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

/* -------------------- EMAIL TRANSPORTER -------------------- */
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_SERVICE,
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.use("compile", hbs(handlebarOptions));

/* -------------------- APPLICATION FORM -------------------- */
app.post(
  "/api/submit-application-form",
  upload.single("cv"), // MUST MATCH FRONTEND
  async (req, res) => {
    try {
      const formData = req.body;
      const file = req.file;

      console.log("Form data:", formData);
      console.log("File:", file ? file.originalname : "No file");

      const attachments = [];

      if (file) {
        const slug = createFilenameFriendlySlug(formData.name);
        const ext = file.originalname.split(".").pop();

        attachments.push({
          filename: `${slug}-cv.${ext}`,
          content: file.buffer,
          contentType: file.mimetype,
        });
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: formData.subject,
        template: "email",
        context: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: formData.subject,
          content: formData.message,
        },
        attachments, // SAFE
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Form submitted successfully" });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ message: "Form submission failed" });
    }
  }
);

/* -------------------- SIMPLE CONTACT FORM -------------------- */
app.post("/api/submit-form", async (req, res) => {
  try {
    const formData = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: formData.subject,
      template: "email",
      context: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        content: formData.message,
      },
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Form submission failed" });
  }
});

/* -------------------- SITE FORM -------------------- */
app.post("/api/submit-siteForm", async (req, res) => {
  try {
    const formData = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `Αίτημα Έργου από ${formData.companyName}`,
      template: "websiteOffer",
      context: formData,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Form submission failed" });
  }
});

/* -------------------- HELPERS -------------------- */
function createFilenameFriendlySlug(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

/* -------------------- START SERVER -------------------- */
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
