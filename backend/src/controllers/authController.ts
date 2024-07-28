import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import mongoose from "mongoose";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, phone, password } = req.body;

    // Проверка, существует ли пользователь
    const userExists = await User.findOne({ $or: [{ username }, { phone }] });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание нового пользователя
    const user = await User.create({
      username,
      phone,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        phone: user.phone,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = (await User.findOne({ username })) as
      | (IUser & { _id: mongoose.Types.ObjectId })
      | null;

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        phone: user.phone,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};
