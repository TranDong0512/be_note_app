import { Schema, model, Document, Types } from "mongoose";

export interface INote extends Document {
  idNote: string;
  title: string;
  content: string;
  idFolder: string;
  statue: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema<INote>(
  {
    idNote: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: false, default: "" },
    idFolder: { type: String, required: true },
    statue: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

noteSchema.index({ title: 1 });
noteSchema.index({ idNote: 1 });
noteSchema.index({ idFolder: 1 });

const NoteModel = model<INote>("Note", noteSchema);
export default NoteModel;
