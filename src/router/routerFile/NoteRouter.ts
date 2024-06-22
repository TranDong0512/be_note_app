import router from "express";
import { auth } from "../../middelware/auth";
import {
  activeNote,
  addNote,
  deleteNote,
  editContentNote,
  editTitleNote,
  listNote,
} from "../../controller/noteController";

export const routerNote = router();
routerNote.put("/active/:idNote", auth, activeNote);
routerNote.put("/content/:idNote", auth, editContentNote);
routerNote.post("/", auth, addNote);
routerNote.get("/", auth, listNote);
routerNote.delete("/:idNote", auth, deleteNote);
routerNote.put("/:idNote", auth, editTitleNote);
