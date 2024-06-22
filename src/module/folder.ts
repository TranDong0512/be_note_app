import { Schema, model, Document, Types } from "mongoose";

// Định nghĩa interface cho Folder
export interface IFolder extends Document {
  idFolder: string;
  name: string;
  authorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Định nghĩa schema cho Folder
const folderSchema = new Schema<IFolder>(
  {
    idFolder: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    authorId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Tạo model từ schema và interface
const FolderModel = model<IFolder>("Folder", folderSchema);
export default FolderModel;
