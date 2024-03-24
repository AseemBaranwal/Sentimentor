import mongoose from "mongoose";

export interface IUser {
  id: string;
  sentiment: string;
}

export interface IRoom extends mongoose.Document {
  id: number;
  name: string;
  users: IUser[];
}

declare const Room: mongoose.Model<IRoom>;
export default Room;
