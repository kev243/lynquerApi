import mongoose, { Model, Schema, Document } from "mongoose";
import User from "./user.model";
const { ObjectId } = mongoose.Schema;

interface ILink extends Document {
  user: mongoose.Types.ObjectId;
  title: String;
  url: String;
  visible: boolean;
  position: Number;
  createdAt?: Date;
  updatedAt?: Date;
}

const linkShema: Schema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },

    url: {
      type: String,
      required: true,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.model<ILink>("Link", linkShema);
export default Link;
