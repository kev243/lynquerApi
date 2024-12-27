import mongoose, { Model, Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  bio?: string;
  isPrivate: boolean;
  profileImageUrl?: string;
  numberOfLink?: number;
  stripeCustomerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Supprime les espaces en début et fin
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    username: {
      type: String,
      trim: true,
      maxlength: [50, "username cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ], // Validation de format d'email
    },
    password: {
      type: String,
      required: true,
      unique: true,
      minLength: [5, "Password must be up to 5 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    profileImageUrl: {
      type: String,
    },
    numberOfLink: {
      type: Number,
      default: 0,
    },
    stripeCustomerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware : Générer automatiquement le username à partir de l'email
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("email")) return next(); // Ne génère pas un nouveau username si l'email n'est pas modifié

  // Extraire la partie avant le '@' de l'email
  const emailPrefix = this.email.split("@")[0]; // Partie avant le '@'

  // Assignation du username avec le préfixe de l'email en minuscule
  this.username = emailPrefix.toLowerCase();

  next();
});

// Middleware pour hasher le mot de passe avant de sauvegarder
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Hash du mot de passe
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Exporter le modèle
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
