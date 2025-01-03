import { Request, Response } from "express";
import Link from "../models/link.model";
import { AuthenticatedRequest } from "../middlewares/auth";
import User from "../models/user.model";

//  Créer un lien
export const createLink = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, url } = req.body;
    const user = req.user;

    if (!title || !url) {
      res.status(400).json({ message: "Please fill in all required fields" });
      return;
    }
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    const link = new Link({
      title,
      url,
      user: user.id,
    });
    await link.save();

    // Incrémenter le nombre de liens de l'utilisateur
    await User.findByIdAndUpdate(user.id, { $inc: { numberOfLink: 1 } });

    res.status(201).json({ message: "Link created successful.", link });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

export const getLinks = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }

    const links = await Link.find({ user: user.id })
      .sort({ position: 1 }) // Trier les liens dans l'ordre croissant de position
      .exec();
    res.status(200).json({ links });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Supprimer un lien
export const deleteLink = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }
    const link = await Link.findById(id);
    if (!link) {
      res.status(404).json({ message: "Link not found" });
      return;
    }
    // Vérifier si l'utilisateur est autorisé à supprimer le lien
    if (link.user.toString() !== user.id) {
      res.status(401).json({
        message: "Unauthorized: You are not allowed to delete this link",
      });
      return;
    }
    await link.deleteOne();
    res.status(200).json({ message: "Link deleted successfully" });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Mettre à jour un lien
export const updateLink = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { title, url } = req.body;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }
    const link = await Link.findById(id);
    if (!link) {
      res.status(404).json({ message: "Link not found" });
      return;
    }
    // Vérifier si l'utilisateur est autorisé à mettre à jour le lien
    if (link.user.toString() !== user.id) {
      res.status(401).json({
        message: "Unauthorized: You are not allowed to update this link",
      });
      return;
    }
    await Link.findByIdAndUpdate(id, { title, url });
    res.status(200).json({ message: "Link updated successfully" });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Mettre à jour la visibilité d'un lien
export const updateVisibility = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { visible } = req.body;
    if (!user) {
      res.status(401).json({ message: "Unauthorized: Token missing" });
      return;
    }
    const link = await Link.findById(id);
    if (!link) {
      res.status(404).json({ message: "Link not found" });
      return;
    }
    // Vérifier si l'utilisateur est autorisé à mettre à jour la visibilité du lien
    if (link.user.toString() !== user.id) {
      res.status(401).json({
        message: "Unauthorized: You are not allowed to update this link",
      });
      return;
    }
    await Link.findByIdAndUpdate(id, { visible });
    res.status(200).json({ message: "Visibility updated successfully" });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Mettre à jour les positions des liens
export const updateLinkPositions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { links } = req.body; // Tableau des liens avec leurs nouvelles positions

    if (!Array.isArray(links)) {
      res.status(400).json({ message: "Invalid payload format." });
      return;
    }

    // Mettre à jour chaque lien avec sa nouvelle position
    const updatePromises = links.map(
      async (link: { id: string; position: number }) => {
        await Link.findByIdAndUpdate(link.id, { position: link.position });
      }
    );

    await Promise.all(updatePromises); // Exécuter toutes les mises à jour en parallèle

    res.status(200).json({ message: "Positions updated successfully." });
    return;
  } catch (error: any) {
    console.error("Error updating link positions:", error);
    res.status(500).json({ message: "Failed to update positions." });
  }
};

// Récupérer tous les liens d'un utilisateur par nom d'utilisateur
export const getLinksByUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const links = await Link.find({ user: user._id });
    res.status(200).json({ links });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};
