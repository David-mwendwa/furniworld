import User from '../models/User.js';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import { sendToken } from '../utils/jwt.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Register user
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