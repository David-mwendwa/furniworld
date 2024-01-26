import crypto from 'crypto';
import User from '../models/User.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../errors/index.js';
import { sendToken } from '../utils/jwt.js';
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from '../utils/cloudinary.js';
import { sendEmail } from '../utils/sendEmail.js';
import { deleteOne, getMany, getOne } from '../utils/handleAPI.js';

// ======================== AUTH CONTROLLERS ========================= //
export const register = async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) throw new BadRequestError('Email already in use');

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
  if (!email || !password)
    throw new BadRequestError('Please provide email and password');

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new UnauthenticatedError('Incorrect email or password');

  const isPasswordCorrect = await user.comparePassword(password, user.password);
  if (!isPasswordCorrect)
    throw new UnauthenticatedError('Incorrect email or password');

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
  if (req.body.password || req.body.passwordConfirm)
    throw new BadRequestError('You cannot update password on this route');

  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name;
    user.email = req.body.email;
  }
  if (req.body.avatar) {
    await removeFromCloudinary(user.avatar.public_id);

    const result = await uploadToCloudinary(req.body.avatar, {
      folder: 'furniworld/users',
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

export const updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { passwordCurrent, newPassword, newPasswordConfirm } = req.body;

  const isCurrentPasswordCorrect = await user.comparePassword(passwordCurrent);
  if (!isCurrentPasswordCorrect)
    throw new BadRequestError('Your current password is incorrect');

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  res.status(201).json({ success: true, data: user });
};

export const deleteProfile = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true });
  delete req.headers.authorization;
  res.status(204).json({ success: true, data: null });
};

export const requestPasswordReset = async (req, res, next) => {
  if (!req.body.email) throw new BadRequestError('please provide your email');

  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new NotFoundError('User not found');

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false }); // validateBeforeSave option is very crucial here!

  let resetUrl = `http://localhost:3000/password-reset/${resetToken}`;
  if (/production/i.test(process.env.NODE_ENV)) {
    const protocol = req.protocol;
    const host = req.get('host');
    resetUrl = `${protocol}://${host}/password-reset/${resetToken}`;
  }

  const html = `<p>Hi ${user.name}, we're excited to have you on board and will be happy to help you set up everything.</p>
    <p>Forgot your password? Please <a href="${resetUrl}">click here</a> to reset it.</p>
    <hr/><br/><p>All the best,</p><h3>Customer Care</h3><br/><hr/>
    <p>If you haven't requested for password recovery, Please ignore this email.</p>`;

  try {
    let mailOptions = {
      email: user.email,
      subject: 'Furniworld Password Recovery',
      html,
    };
    const data = await sendEmail(mailOptions);
    res.status(200).json({ success: true, data });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  if (!user)
    throw new NotFoundError('Password reset token is invalid or has expired');

  if (req.body.password !== req.body.passwordConfirm)
    throw new BadRequestError("Passwords don't match");

  // setup new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();
  res.status(200).json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  if (req.body.password || req.body.passwordConfirm)
    throw new BadRequestError('You cannot update user password');

  const updateInfo = {
    role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id, updateInfo, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(201).json({ success: true, data: user });
};

export const getUsers = getMany(User);

export const getUser = getOne(User);

export const deleteUser = deleteOne(User);
