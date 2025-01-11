import { Request, Response } from "express";
import { validateEmail, validateLength } from "../utils/validation";
import User from "../models/user.model";
import Code from "../models/code.model";
import Token from "../models/token.model";
import { sendResetUrlPassoword } from "../utils/resend";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token";
import { AuthenticatedRequest } from "../middlewares/auth";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import axios from "axios";
import fs from "fs";

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    // Validation du password
    if (password.length < 5) {
      res.status(400).json({ message: "Password must be up to 6 characters" });
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

    // Validation de l'email
    if (!validateEmail(email)) {
      res.status(400).json({ message: "Invalid email address" });
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

//fonction qui permet d'envoyer l'email d'instruction
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Validation de l'e-mail
    if (!email || !validateEmail(email)) {
      res.status(400).json({ message: "Invalid or missing email" });
      return;
    }
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "user not found with email" });
      return;
    }

    // Suppression des anciens tokens associés à cet utilisateur
    await Token.deleteMany({ user: user._id });

    // Création d'un nouveau reset token
    const resetToken = crypto.randomBytes(32).toString("hex") + user._id;

    //hash token before saving to BD
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await new Token({
      user: user._id,
      token: hashedToken,
    }).save();

    // Construction de l'URL de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    // Envoi de l'e-mail avec le lien de réinitialisation
    await sendResetUrlPassoword(email, user.name, resetUrl);

    res.status(200).json({ message: "Reset email sent successfully" });
    return;
  } catch (error: any) {
    console.error("Error during login:", error);

    // Réponse d'erreur générique
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
    return;
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    // Validation de la présence du mot de passe et du token
    if (!password || password.length < 5) {
      res
        .status(400)
        .json({ message: "Password must be at least 5 characters long." });
      return;
    }
    if (!resetToken) {
      res.status(400).json({ message: "Reset token is required." });
      return;
    }

    // Hashage du token reçu pour comparaison avec la base de données
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Recherche du token dans la base de données avec une vérification de son expiration
    const userToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() }, // Vérifie que le token n'est pas expiré
    });

    if (!userToken) {
      res.status(404).json({ message: "Invalid or expired token." });
      return;
    }

    // Recherche de l'utilisateur associé au token
    const user = await User.findById(userToken.user);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Mise à jour du mot de passe de l'utilisateur
    user.password = password;
    await user.save();

    // Suppression du token utilisé après un reset réussi
    await Token.deleteOne({ _id: userToken._id });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error during password reset:", error);

    // Réponse d'erreur générique
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    const userInfo = await User.findById(user.id);
    if (!userInfo) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User infos",
      user: {
        id: userInfo._id,
        name: userInfo.name,
        email: userInfo.email,
        username: userInfo.username,
        bio: userInfo.bio,
        profileImageUrl: userInfo.profileImageUrl,
        verified: userInfo.verified,
        createdAt: userInfo.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour les informations de l'utilisateur
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    const { name, username, bio } = req.body;

    // Vérifie si le nom d'utilisateur est déjà pris
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser.id.toString() !== user.id) {
        res.status(400).json({ message: "Username is already taken" });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { name, username, bio },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        isPrivate: updatedUser.isPrivate,
        profileImageUrl: updatedUser.profileImageUrl,
        verified: updatedUser.verified,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction de téléchargement de l'image sur Imgur
export const uploadProfileImage = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    // Vérification du type du fichier (en plus de la validation de Multer)
    if (!req.file.mimetype.startsWith("image/")) {
      res.status(400).json({ message: "The file must be an image" });
      return;
    }

    const imagePath = req.file.path;
    const imgurClientId = process.env.IMGUR_CLIENT_ID;

    if (!imgurClientId) {
      res.status(500).json({ message: "Imgur Client-ID not configured" });
      return;
    }

    // Télécharger l'image sur Imgur
    const response = await axios.post(
      "https://api.imgur.com/3/image",
      {
        image: fs.readFileSync(imagePath, { encoding: "base64" }),
        type: "base64",
      },
      {
        headers: {
          Authorization: `Client-ID ${imgurClientId}`,
        },
      }
    );

    const imageUrl = response.data.data.link;

    // Supprimer le fichier temporaire après l'upload
    fs.unlinkSync(imagePath);

    // Mettre à jour l'URL de l'image du profil de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { profileImageUrl: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile image uploaded successfully",
      profileImageUrl: imageUrl,
    });
  } catch (error: any) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: error.message });
  }
};

// Fonction de téléchargement de l'image sur Cloudinary
export const uploadProfileImageCloudinary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "profile_images_lynquer",
    });

    const imageUrl = result.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { profileImageUrl: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile image uploaded successfully",
      profileImageUrl: imageUrl,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
