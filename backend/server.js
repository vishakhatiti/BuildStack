require("dotenv").config(); // ALWAYS FIRST

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

// Check env
if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI missing");
}

// Initialize app
const app = express();

// Debug
console.log("ENV URI:", process.env.MONGO_URI);

// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("BuildStack API running...");
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});