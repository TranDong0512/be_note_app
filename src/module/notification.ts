import { Schema, model, Document } from "mongoose";

// Định nghĩa interface cho Notification
export interface INotification extends Document {
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Định nghĩa schema cho Notification
const notificationSchema = new Schema<INotification>(
  {
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Tạo model từ schema và interface
const NotificationModel = model<INotification>(
  "Notification",
  notificationSchema
);
export default NotificationModel;
