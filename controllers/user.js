import User from '../models/User.js';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import { sendToken } from '../utils/jwt.js';
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from '../utils/cloudinary.js';

// ======================== AUTH CONTROLLERS ========================= //
export const register = async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new BadRequestError('Email already in use');
  }

  let result;
  if (req.body.avatar) {
    result = await uploadToCloudinary(req.body.avatar, {
      folder: 'furniworld/users',
      width: '150',
      crop: 'scale',
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    avatar: {
      public_id: result?.public_id,
      url: result?.secure_url,
    },
  });
  sendToken(user, 200, res);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnauthenticatedError('Incorrect email or password');
  }

  const isPasswordCorrect = await user.comparePassword(password, user.password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Incorrect email or password');
  }

  user.password = undefined;
  sendToken(user, 200, res);
};

export const logout = async (req, res, next) => {
  res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(204).json({ success: true, data: null });
};

// ======================== USER CONTROLLERS ========================= //
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

export const updateProfile = async (req, res) => {
  if (req.body.password || req.body.passwordConfirm) {
    throw new BadRequestError('You cannot update password on this route');
  }

  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name;
    user.email = req.body.email;
  }
  if (req.body.avatar) {
    await removeFromCloudinary(user.avatar.public_id);

    const result = await uploadToCloudinary(req.body.avatar, {
      folder: '',
      width: '150',
      crop: 'scale',
    });

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }
  await user.save();
  res.status(201).json({ success: true, data: user });
};
