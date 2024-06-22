import { Request, Response } from "express";
import NoteModel from "../module/note";
import { getNextNoteId, setError, success } from "../service/function";
import sanitizeHtml from "sanitize-html";

export const listNote = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.query;
    if (!folderId) {
      return setError(res, "Không có folderId", 404);
    }
    const notes = await NoteModel.find({ idFolder: folderId })
      .sort({ createdAt: -1 })
      .exec();
    return success(res, "List note", notes);
  } catch (error) {
    return setError(res, error, 500);
  }
};

export const addNote = async (req: Request, res: Response) => {
  try {
    const { title, content, idFolder } = req.body;

    if (!title) {
      return setError(res, "Title is required", 400);
    }

    if (!idFolder) {
      return setError(res, "Folder is required.");
    }
    const trimmedTitle = title.trim();

    const existingNote = await NoteModel.findOne({
      title: trimmedTitle,
      idFolder: idFolder,
    });
    if (existingNote) {
      return setError(res, "Note with this name already exists", 400);
    }
    const idNote = await getNextNoteId();
    // Tạo một note mới
    const newNote = new NoteModel({
      title: trimmedTitle,
      content,
      idFolder: idFolder.toString(),
      idNote: idNote.toString(),
    });

    const savedNote = await newNote.save();

    return success(res, "Create Note Success", savedNote);
  } catch (error) {
    return setError(res, error, 500);
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { idNote } = req.params;
    const existingNote = await NoteModel.findOne({ idNote: idNote });
    if (!existingNote) {
      return setError(res, "Note not found", 404);
    }
    await NoteModel.deleteOne({ idNote: idNote });
    return success(res, "Note deleted successfully", existingNote);
  } catch (error) {
    return setError(res, error, 500);
  }
};

export const editTitleNote = async (req: Request, res: Response) => {
  try {
    let { newTitle } = req.body;
    let { idNote } = req.params;

    if (!newTitle || typeof newTitle !== "string" || newTitle.trim() === "") {
      return setError(
        res,
        "New title is required and must be a non-empty string",
        400
      );
    }

    let existingNote = await NoteModel.findOne({ idNote: idNote });
    if (!existingNote) {
      return setError(res, "Note not found", 404);
    }

    existingNote.title = newTitle.trim();
    await existingNote.save();
    return success(res, "Note title updated successfully", existingNote);
  } catch (error) {
    return setError(res, error, 500);
  }
};

export const activeNote = async (req: Request, res: Response) => {
  try {
    let { active } = req.body;
    const { idNote } = req.params;
    if (typeof active !== "boolean") {
      return setError(res, "Active status must be a boolean", 400);
    }

    let existingNote = await NoteModel.findOne({ idNote: idNote });
    if (!existingNote) {
      return setError(res, "Note not found", 404);
    }
    const updatedNote = await NoteModel.findOneAndUpdate(
      { idNote },
      { statue: active },
      { new: true }
    );

    if (!updatedNote) {
      return setError(res, "Note not found", 404);
    }

    return success(res, "Note status updated successfully", updatedNote);
  } catch (error) {
    return setError(res, error, 500);
  }
};

export const editContentNote = async (req: Request, res: Response) => {
  try {
    const { idNote } = req.params;
    const { content } = req.body;

    const sanitizedContent = sanitizeHtml(content);

    const updatedNote = await NoteModel.findOneAndUpdate(
      { idNote },
      { content: sanitizedContent },
      { new: true }
    );

    if (!updatedNote) {
      return setError(res, "Note not found", 404);
    }
    return success(res, "Note status updated successfully", updatedNote);
  } catch (error) {
    return setError(res, error, 500);
  }
};
