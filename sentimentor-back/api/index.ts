import express from "express";
import cors from "cors";
import Room from "../models/Room";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const mongoURI = process.env.MONGO_SRV as string;

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

async function generateUniqueId() {
  let roomId;

  do {
    roomId = Math.floor(100000 + Math.random() * 900000);
    const existingRoom = await Room.findOne({ id: roomId });
    if (existingRoom) {
      roomId = undefined;
    }
  } while (!roomId);

  return roomId;
}

app.post("/api/createRoom", async (req, res) => {
  const { roomName } = req.body;
  const roomId = await generateUniqueId();

  try {
    const room = new Room({ id: roomId, name: roomName, users: [] });
    await room.save();
    res.json({ roomId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/addUser", async (req, res) => {
  const { roomId, userId, sentiment } = req.body;

  try {
    const room = await Room.findOneAndUpdate(
      { id: roomId },
      { $push: { users: { id: userId, sentiment: sentiment } } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/getRooms", async (req, res) => {
  console.log("ehhlo");
  try {
    const rooms = await Room.find({}, { _id: 0, __v: 0 });
    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/getRooms/:roomId", async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ id: roomId }, { _id: 0, __v: 0 });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/setSentiment", async (req, res) => {
  const { userId, sentiment } = req.body;

  try {
    const user = await Room.findOneAndUpdate(
      { "users.id": userId },
      { $set: { "users.$.sentiment": sentiment } }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5500, () => {
  console.log("Server running on port 5500");
});
