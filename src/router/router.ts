import { Router } from "express";
import { routerUser } from "./routerFile/UserRouter";
import { routerFolder } from "./routerFile/FolderRouter";
import { routerNote } from "./routerFile/NoteRouter";

export const router = Router();
router.use("/folder", routerFolder);
router.use("/notes", routerNote);
router.use("/users", routerUser);
