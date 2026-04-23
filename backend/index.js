const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

/* ===========================
   Middleware
=========================== */
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

/* ===========================
   MongoDB Connection
=========================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

/* ===========================
   Schemas
=========================== */

// 👤 Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

// 📌 Grievance Schema
const grievanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Academic", "Hostel", "Transport", "Other"],
    default: "Other"
  },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending"
  }
}, { timestamps: true });

const Grievance = mongoose.model("Grievance", grievanceSchema);

/* ===========================
   Auth Middleware
=========================== */
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

/* ===========================
   AUTH ROUTES
=========================== */

/* 🔹 Register */
app.post("/api/register", async (req, res) => {
  try {
    const { name, course, email, password } = req.body;

    if (!name || !course || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const student = new Student({ name, course, email, password: hashed });
    await student.save();

    res.status(201).json({ message: "Student Registered Successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Login */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, message: "Login Successful" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ===========================
   GRIEVANCE APIs
=========================== */

/* 🔹 Submit Grievance */
app.post("/api/grievances", auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const grievance = new Grievance({
      studentId: req.user.id,
      title,
      description,
      category
    });

    await grievance.save();

    res.status(201).json({ message: "Grievance Submitted", grievance });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Get All Grievances */
app.get("/api/grievances", auth, async (req, res) => {
  try {
    const grievances = await Grievance.find({ studentId: req.user.id })
      .sort({ date: -1 });

    res.json(grievances);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Get by ID */
app.get("/api/grievances/search", auth, async (req, res) => {
  try {
    const { title = "" } = req.query;

    const results = await Grievance.find({
      studentId: req.user.id,
      title: { $regex: title, $options: "i" }
    });

    res.json(results);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/grievances/:id", auth, async (req, res) => {
  try {
    const grievance = await Grievance.findOne({
      _id: req.params.id,
      studentId: req.user.id
    });

    if (!grievance) {
      return res.status(404).json({ message: "Not Found" });
    }

    res.json(grievance);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Update Grievance */
app.put("/api/grievances/:id", auth, async (req, res) => {
  try {
    const updated = await Grievance.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Not Found" });
    }

    res.json({ message: "Grievance Updated", updated });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Delete Grievance */
app.delete("/api/grievances/:id", auth, async (req, res) => {
  try {
    const deleted = await Grievance.findOneAndDelete({
      _id: req.params.id,
      studentId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ message: "Not Found" });
    }

    res.json({ message: "Grievance Deleted" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* 🔹 Search Grievance */

/* ===========================
   SERVER START
=========================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
