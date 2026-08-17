import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import {
  UnauthenticatedError,
  UnauthorizedError,
} from '../errors/customErrors.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && /^Bearer /i.test(header)) return header.slice(7).trim();
  return req.cookies?.token || null;
};

export const protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new UnauthenticatedError('Please log in to continue');

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  // The user is loaded on every request so deactivated or deleted accounts lose
  // access immediately, and so role checks read the current role rather than the
  // one baked into the token when it was issued.
  const user = await User.findById(payload.id).select('+active');
  if (!user || user.active === false)
    throw new UnauthenticatedError('This account is no longer active');

  if (user.passwordChangedAfter(payload.iat))
    throw new UnauthenticatedError(
      'Your password was changed recently. Please log in again.'
    );

  req.user = user;
  next();
};

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new UnauthorizedError(
        'You do not have permission to perform this action'
      );
    next();
  };

// Populates req.user when a valid token is present but never rejects the request.
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('+active');
    if (user && user.active !== false && !user.passwordChangedAfter(payload.iat))
      req.user = user;
  } catch {
    // An invalid token is treated the same as no token on public routes.
  }
  next();
};
