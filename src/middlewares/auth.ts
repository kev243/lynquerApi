import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Token missing" });
    return;
  }

  try {
    const secret = process.env.TOKEN_SECRET || "";

    // Vérifie et décode le token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Si le token contient une information d'expiration, vérifiez-la
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      res.status(401).json({
        message: "Your session has expired. Please log in again.",
      });
      return;
    }

    // Ajoute les informations utilisateur dans la requête
    req.user = { id: decoded.id };

    next();
  } catch (error: any) {
    // Gestion des erreurs liées au token (invalide, expiré, etc.)
    res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Token has expired. Please log in again."
          : "Unauthorized: Invalid token",
    });
  }
};
