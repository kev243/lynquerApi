import { Request, Response } from "express";
import { validateEmail, validateLength } from "../utils/validation";
import User from "../models/user.model";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Vérification de la présence de toutes les informations importantes
    if (!name || !email || !password) {
      res.status(400).json({ message: "Please fill in all required fields" });
      return;
    }
    // Validation de l'email
    if (!validateEmail(email)) {
      console.log("Invalid email address");
      res.status(400).json({ message: "Invalid email address" });
      return;
    }
    // Vérification si l'email existe déjà
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res
        .status(400)
        .json({ message: "An account already exists with this email" });
      return;
    }

    // Validation de la longueur du nom
    if (!validateLength(name, 3, 25)) {
      console.log("Invalid name length");
      res
        .status(400)
        .json({ message: "Name must be between 3 and 25 characters" });
      return;
    }

    // Création de l'utilisateur
    const user = new User({
      name,
      email,
      password,
    });

    // Sauvegarde de l'utilisateur
    await user.save();

    // Réponse en cas de succès
    res.status(201).json({
      message:
        "Registration successfully. Please activate your email to proceed.",
    });
  } catch (error: any) {
    console.error("Error during registration:", error);
    // Gestion des erreurs
    const statusCode = error.statusCode || 500;
    const message = error.message || "Server error";
    res.status(statusCode).json({ message });
    return;
  }
};
