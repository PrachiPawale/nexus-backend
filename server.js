const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notes", require("./routes/noteRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/calendar", require("./routes/calendarRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Nexus Backend is running"
  });
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      status: "healthy",
      backend: "connected",
      database: "connected",
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "error",
      backend: "connected",
      database: "disconnected"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Nexus Backend running on port ${PORT}`);
});