import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  userName?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: number;
  email?: string;
  userId?: number;
  folders?: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  userName: String,
  password: String,
  fullName: String,
  phoneNumber: Number,
  email: String,
  userId: Number,
  folders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Folder",
    },
  ],
});

const User = model<IUser>("User", userSchema);
export { User };
