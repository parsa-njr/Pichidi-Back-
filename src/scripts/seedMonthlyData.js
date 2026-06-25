// scripts/seedMonthlyData.js
require("dotenv").config();
const mongoose = require("mongoose");

// Import your model (adjust the path as needed)
const Attendance = require("../models/attendance");

// Database connection
async function connectDB() {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/Attendance";

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    console.log(
      "Using default local MongoDB: mongodb://localhost:27017/Attendance"
    );
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    console.log("\nTroubleshooting tips:");
    console.log("1. Create a .env file with MONGODB_URI");
    console.log("2. Example: MONGODB_URI=mongodb://localhost:27017/Attendance");
    console.log("3. Make sure MongoDB is running");
    process.exit(1);
  }
}

// Data generation function
async function insertMonthData() {
  // Safety check for production environment
  if (process.env.NODE_ENV === "production") {
    console.error("Cannot run seed script in production environment");
    process.exit(1);
  }

  const startDate = new Date("2025-05-22T00:00:00Z");
  const userId = new mongoose.Types.ObjectId("687514b27b1fbc256cdd3078"); // Fixed: using new keyword
  let insertedCount = 0;

  try {
    console.log("Starting data generation...");

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Skip weekends (Saturday=6, Sunday=0)
      if (currentDate.getDay() % 6 === 0) {
        console.log(
          `Skipping weekend date: ${currentDate.toISOString().split("T")[0]}`
        );
        continue;
      }

      // Generate random check-in time between 8AM and 10AM UTC
      const checkInHour = 8 + Math.floor(Math.random() * 3); // 8 to 10
      const checkInMinutes = Math.floor(Math.random() * 60);

      const checkInTime = new Date(currentDate);
      checkInTime.setHours(checkInHour, checkInMinutes, 0, 0);

      // Generate random working duration between 6 to 10 hours
      const workDurationHours = 6 + Math.floor(Math.random() * 5); // 6 to 10
      const workDurationMinutes = Math.floor(Math.random() * 60);

      const checkOutTime = new Date(checkInTime);
      checkOutTime.setHours(checkOutTime.getHours() + workDurationHours);
      checkOutTime.setMinutes(checkOutTime.getMinutes() + workDurationMinutes);

      // Create document
      await Attendance.create({
        user: userId,
        date: currentDate,
        sessions: [
          {
            checkIn: checkInTime,
            checkOut: checkOutTime,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0,
          },
        ],
      });

      console.log(
        `Inserted data for ${currentDate.toISOString().split("T")[0]}`
      );
      insertedCount++;
    }

    console.log(`Successfully inserted ${insertedCount} daily records`);
  } catch (err) {
    console.error("Error during data insertion:", err);
  }
}

// Main execution
(async () => {
  try {
    await connectDB();
    await insertMonthData();
  } catch (err) {
    console.error("Script execution failed:", err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
})();
