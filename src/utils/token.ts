import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { TOKEN_SECRET } = process.env;

if (!TOKEN_SECRET) {
  throw new Error("Missing Required Environment variables");
}
export const generateToken = (payload: Object): string => {
  return jwt.sign(payload, TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): string | object => {
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET as string);
    return decoded;
  } catch (error: any) {
    return error.message;
  }
};
