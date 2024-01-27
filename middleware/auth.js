import jwt from 'jsonwebtoken';
import { ForbiddenError, UnauthorizedError } from '../errors/customErrors.js';

// Middleware to check user authentication to allow access to a certain resource
export const protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.signedCookies && req.signedCookies.token) {
    token = req.signedCookies.token;
  } else if (authHeader && /^Bearer /i.test(authHeader)) {
    token = authHeader.split(' ')[1];
  }
  if (!token) {
    throw new UnauthorizedError('Authentication Invalid. Please log in.');
  }
  req.user = jwt.verify(token, process.env.JWT_SECRET); // user: { id, role, iat, exp}, alt: verifyToken({ token })
  next();
};

// Middleware to check if a user is authorized to access certain resources based on their role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(
        `${req.user.role} is not allowed to perfom this action`
      );
    }
    next();
  };
};
