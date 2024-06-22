import { Request, Response } from "express";
import FolderModel from "../module/folder";
import NoteModel from "../module/note";

import { getNextCountId, setError, success } from "../service/function";
export const addFolder = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return setError(res, "Name is required", 400);
    }

    const trimmedName = name.trim();
    const existingFolder = await FolderModel.findOne({
      name: trimmedName,
      authorId: req.decode.userId,
    }).exec();

    if (existingFolder) {
      return setError(res, "Folder with this name already exists", 400);
    }
    const idFolder = await getNextCountId(FolderModel);

    const newFolder = new FolderModel({
      name: trimmedName,
      idFolder: idFolder.toString(),
      authorId: req.decode.userId,
    });

    const savedFolder = await newFolder.save();

    return success(res, "Create Folder Success", savedFolder);
  } catch (error) {
    return setError(res, error, 500);
  }
};

export const listFolder = async (req: Request, res: Response) => {
  try {
    const userId = req.decode.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const listCondition = { authorId: userId };

    const listFolder = await FolderModel.find(listCondition)
      .sort({ createdAt: -1 })
      .exec();

    const totalCount = await FolderModel.countDocuments(listCondition).exec();

    return success(res, "List Folder Success", {
      total: totalCount,
      data: listFolder,
    });
  } catch (err) {
    console.error("Error occurred while listing folders: ", err);
    return setError(res, "An error occurred while listing the folders.", 500);
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const { idFolder } = req.body;
    const folder = await FolderModel.findOne({ idFolder: idFolder });
    if (!folder) {
      return setError(res, "Không tìm thấy folder");
    }
    await NoteModel.deleteMany({ idFolder: idFolder });

    await FolderModel.deleteOne({ idFolder });
    return success(res, "Delete Folder Success", folder);
  } catch (error) {
    return setError(error, "Đã có lỗi xảy ra", 500);
  }
};
