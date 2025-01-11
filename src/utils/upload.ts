import multer from "multer";
import { Request, Response } from "express";

const upload = multer({
  dest: "uploads/", // Dossier temporaire
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille à 5 Mo
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedTypes.includes(file.mimetype)) {
      // Passer l'erreur sous forme d'instance Error, avec un cast explicite
      return cb(new Error("Only image files are allowed") as any, false);
    }
    cb(null, true); // Accepter le fichier
  },
});

export default upload;
