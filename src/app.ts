// import express from "express";
// import cors from "cors";
// import routes from "./routes/index";
// import path from "path";
// import errorHandler from "./middlewares/errorHandler";
// const app = express();

// // CORS settings (adjust for production)
// const corsOptions = {
//   origin: "*",
//   credentials: true,
// };
// app.use(cors(corsOptions));

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/v1/", routes);

// // handle error 
// app.use(errorHandler)

// export default app;


import express, { Application, Request, Response } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
// import "express-async-errors";
import routes from "./routes/index";
import { connectToDb } from "./config/database";
import os from "os";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler";

// import connectDB from "./db/connect";


// Middleware


dotenv.config();

const app: Application = express();
const port: number = Number(process.env.PORT) || 8080;

// ------------------
// CORS
// ------------------
// const corsOptions: cors.CorsOptions = {
//   origin: "*",
//   credentials: true,
// };
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// app.use(cors(corsOptions));

// ------------------
// Global Middleware
// ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ------------------
// Static Files
// ------------------
app.use(
  "/uploads/profile-images",
  express.static(path.join(__dirname, "images/profile-images"))
);


// ------------------
// Routes
// ------------------
app.use("/api/v1/", routes);



app.get("/", (req: Request, res: Response) => {
  res.send("Hello!");
});

// ------------------
// Error Handling
// ------------------
// app.use(notFound);
// app.use(errorHandler);
app.use(errorHandler);

// ------------------
/**
 * Utility: Get local LAN IP address
 */
const getLocalIP = (): string => {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};
// Start Server
// ------------------
const start = async (): Promise<void> => {
  try {
    await connectToDb(process.env.MONGO_URI as string);

    app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server is listening on http://0.0.0.0:${port}`);
      console.log(`→ Local:   http://localhost:${port}`);
      console.log(`→ Network: http://${getLocalIP()}:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();

