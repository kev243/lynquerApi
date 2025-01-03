import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db";
import userRouter from "./src/routes/user.route";
import linkRouter from "./src/routes/link.route";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Liste des origines autorisées
const allowedOrigins = [
  "http://localhost:3000", // Application Next.js en local (si en développement)
  "https://www.monsite-nextjs.com", // Application Next.js en production
  // note: Pas besoin d'ajouter l'URL de l'app SwiftUI, car les requêtes mobiles ne sont pas soumises à CORS
];

// Configuration CORS
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Si l'origine est définie et autorisée, on autorise la requête
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true); // Autorise la requête
    } else if (!origin) {
      // Si l'origine est indéfinie (pour les requêtes mobiles iOS par exemple), on autorise aussi
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS")); // Refuse la requête si l'origine n'est pas autorisée
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"], // Liste des méthodes autorisées
  allowedHeaders: ["Content-Type", "Authorization"], // Liste des headers autorisés
  credentials: true, // Autoriser l'envoi de cookies
};

//connexion bd
connectDB();

// app.use(cors());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript API For Lynquer App!");
});

//les Endpoints V1
app.use("/api/v1/user", userRouter);
app.use("/api/v1/link", linkRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
