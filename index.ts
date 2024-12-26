import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//connexion bd
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript API For Lynquer App!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
