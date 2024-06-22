import { Schema, model } from "mongoose";

const counterSchema = new Schema({
  countNote: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const CounterModel = model("Counter", counterSchema);

export default CounterModel;
