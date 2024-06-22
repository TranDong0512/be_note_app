import { Schema, model, Types } from "mongoose";

export interface IRefreshToken {
  userId: string;
  refToken: string;
  expires: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: String, ref: "User", required: true },
  refToken: { type: String, required: true },
  expires: { type: Date, required: true },
});

const RefreshToken = model<IRefreshToken>("RefreshToken", refreshTokenSchema);
export { RefreshToken };
