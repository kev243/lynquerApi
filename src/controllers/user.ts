import { Request, Response } from "express";
import {
  generateCode,
  validateEmail,
  validateLength,
} from "../utils/validation";
import User from "../models/user.model";
import Code from "../models/code.model";
import { sendVerificationEmail } from "../utils/resend";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token";
import { AuthenticatedRequest } from "../middlewares/auth";
// import jwt from "jsonwebtoken";
import jwt, { JwtPayload } from "jsonwebtoken";

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

    const token = generateToken({ id: user._id });

    // Configurer le cookie avec le token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Utilise HTTPS en production
      sameSite: "strict", // Protège contre les attaques CSRF
    });

    // Réponse en cas de succès avec les informations de l'utilisateur
    res.status(201).json({
      message:
        "Registration successful. Please activate your email to proceed.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        verified: user.verified,
        createdAt: user.createdAt,
      },
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

export const validateToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorised" });
    return;
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.TOKEN_SECRET || ""
    ) as JwtPayload;

    // Vérifie si le champ exp (expiration) existe et s'il est valide
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      res.status(401).json({ message: "Unauthorized: Token has expired" });
      return;
    }

    res.status(200).json({ message: "Authorised" });
    return;
  } catch (error) {
    res.status(401).json({ message: "Unauthorised" });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
      res.status(400).json({ message: "Please fill in all required fields." });
      return;
    }

    // Recherche de l'utilisateur dans la base de données
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Vérification du mot de passe
    const passwordIsMatch = await bcrypt.compare(password, user.password);
    if (!passwordIsMatch) {
      res.status(401).json({ message: "Incorrect password." });
      return;
    }
    //suppression du code
    await Code.deleteMany({ user: user._id });

    // Génération d'un token
    const token = generateToken({ id: user._id });

    // Configuration des cookies
    res.cookie("token", token, {
      httpOnly: true, // Rend le cookie inaccessible depuis le JavaScript client
      secure: process.env.NODE_ENV === "production", // Utilise HTTPS en production
      sameSite: "strict", // Protège contre les attaques CSRF
    });

    // Réponse de succès
    res.status(200).json({
      message: "Login successful.",
    });
  } catch (error: any) {
    console.error("Error during login:", error);

    // Réponse d'erreur générique
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

//fonction qui permet d'envoyer
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {};
