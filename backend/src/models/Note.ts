import mongoose, { Document } from "mongoose";

interface IWeight {
  value: string;
  date: Date;
  paid: boolean;
}

interface IFryoil {
  value: string;
  date: Date;
}

export interface INote extends Document {
  user: mongoose.Schema.Types.ObjectId;
  city: string;
  description: string;
  phone: string;
  street: string;
  house?: string;
  weight: IWeight[];
  fryoil: IFryoil[];
  fryorder: string;
  usedprice?: string;
  order?: string;
  fryprice?: string;
  worktime?: string;
}

const noteSchema = new mongoose.Schema<INote>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    city: { type: String, required: true },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    house: { type: String },
    weight: [
      {
        value: String,
        date: Date,
        paid: { type: Boolean, default: false },
      },
    ],
    fryoil: [
      {
        value: String,
        date: Date,
      },
    ],
    fryorder: { type: String, default: "" },
    usedprice: String,
    order: String,
    fryprice: String,
    worktime: String,
  },
  { timestamps: true }
);

export default mongoose.model<INote>("Note", noteSchema);
