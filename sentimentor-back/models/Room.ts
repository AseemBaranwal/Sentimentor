import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sentiment: { type: String, required: true },
});

const roomSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  users: [userSchema],
});

const Room = mongoose.model("Room", roomSchema);

export default Room;
