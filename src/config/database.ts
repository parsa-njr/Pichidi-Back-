import mongoose from "mongoose";

export const connectToDb = (url: string) => {
  return mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to the database");
    })
    .catch((error) => {
      console.error("Error connecting to the database:", error);
      throw error;
    });
};
