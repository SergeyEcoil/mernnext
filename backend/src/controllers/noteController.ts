import { Request, Response } from "express";
import Note from "../models/Note";
import { IUser } from "../models/User";
import mongoose from "mongoose";
import redisClient from "src/config/redis";

interface AuthRequest extends Request {
  user?: IUser & { _id: mongoose.Types.ObjectId }; // Добавляем _id с правильным типом
}

export const getNotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const cacheKey = `notes:${req.user!._id}`;
    const cachedNotes = await redisClient.get(cacheKey);

    if (cachedNotes) {
      res.json(JSON.parse(cachedNotes));
      return;
    }

    const notes = await Note.find({ user: req.user!._id });
    await redisClient.set(cacheKey, JSON.stringify(notes), {
      EX: 3600, // Кэшировать на 1 час
    });

    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    const {
      city,
      description,
      phone,
      street,
      house,
      weight,
      fryoil,
      fryorder,
      usedprice,
      order,
      fryprice,
      worktime,
    } = req.body;

    const note = await Note.create({
      user: req.user._id,
      city,
      description,
      phone,
      street,
      house,
      weight,
      fryoil,
      fryorder,
      usedprice,
      order,
      fryprice,
      worktime,
    });

    res.status(201).json(note);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (note.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "User not authorized" });
      return;
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedNote);
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteNote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    const note = await Note.findById(req.params.id);

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (note.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "User not authorized" });
      return;
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note removed" });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
