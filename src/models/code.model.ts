import mongoose, { Model, Schema, Document } from "mongoose";
const { ObjectId } = mongoose.Schema;

interface ICode extends Document {
  code: String;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const codeSchema: Schema = new Schema({
  code: {
    type: String,
    required: true,
  },

  user: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes à partir de maintenant
  },
});

// Supprime automatiquement les codes expirés grâce à un TTL index
codeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ICode>("Code", codeSchema);
