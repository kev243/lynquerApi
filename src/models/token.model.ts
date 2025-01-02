import mongoose, { Model, Schema, Document } from "mongoose";
const { ObjectId } = mongoose.Schema;

interface IToken extends Document {
  token: String;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

const tokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
  },

  user: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },

  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes à partir de maintenant
  },
});

// Supprime automatiquement les token expirés grâce à un TTL index
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IToken>("token", tokenSchema);
