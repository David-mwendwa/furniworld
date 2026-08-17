import { StatusCodes } from 'http-status-codes';
import User from '../models/userModel.js';
import { sendToken, clearToken } from '../utils/jwt.js';
import { sendEmail, passwordResetEmail } from '../utils/sendEmail.js';
import {
  BadRequestError,
  ConflictError,
  UnauthenticatedError,
} from '../errors/customErrors.js';

export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password)
    throw new BadRequestError('Please provide your name, email and password');

  if (await User.findOne({ email: email.toLowerCase() }))
    throw new ConflictError('An account with that email already exists');

  const user = await User.create({ name, email, password, phone });
  sendToken(user, StatusCodes.CREATED, res);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError('Please provide your email and password');

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  // The same message for both branches so the response cannot be used to
  // discover which emails have accounts.
  if (!user || !(await user.comparePassword(password)))
    throw new UnauthenticatedError('Incorrect email or password');

  sendToken(user, StatusCodes.OK, res);
};

export const logout = (req, res) => {
  clearToken(res);
  res.status(StatusCodes.OK).json({ success: true, message: 'Logged out' });
};

export const getMe = (req, res) =>
  res.status(StatusCodes.OK).json({ success: true, user: req.user });

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError('Please provide your email');

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always report success so the endpoint cannot enumerate accounts.
  if (user) {
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Reset your Furniworld password',
        html: passwordResetEmail(user.name, resetUrl),
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpiresAt = undefined;
      await user.save({ validateBeforeSave: false });
      throw err;
    }
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'If that email has an account, a reset link is on its way',
  });
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  if (!password) throw new BadRequestError('Please provide a new password');

  const user = await User.findOne({
    passwordResetToken: User.hashResetToken(req.params.token),
    passwordResetExpiresAt: { $gt: Date.now() },
  }).select('+password');

  if (!user)
    throw new BadRequestError('That reset link is invalid or has expired');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  sendToken(user, StatusCodes.OK, res);
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    throw new BadRequestError(
      'Please provide your current and new password'
    );

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword)))
    throw new UnauthenticatedError('Your current password is incorrect');

  user.password = newPassword;
  await user.save();

  sendToken(user, StatusCodes.OK, res);
};
