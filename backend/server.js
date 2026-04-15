require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI missing");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

const app = express();

connectDB();
configurePassport();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (_req, res) => {
  res.send("BuildStack API running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
