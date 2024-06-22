import mongoose from "mongoose";

const counterFolderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const CounterFolder = mongoose.model("CounterFolder", counterFolderSchema);

export default CounterFolder;
