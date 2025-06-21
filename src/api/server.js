const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/functions", require("./routes/functions"));
app.use("/api/executions", require("./routes/executions"));
app.use("/api/metrics", require("./routes/metrics"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// MongoDB connection options
const mongooseOptions = {
  retryWrites: true,
  w: "majority",
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// MongoDB connection string
const MONGODB_URI =
  "mongodb+srv://junaidhussain798:junaid@cluster0.aa7raiu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Start server
const start = async () => {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log("Connected to MongoDB Atlas");

    // Handle MongoDB connection errors
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected. Attempting to reconnect...");
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
