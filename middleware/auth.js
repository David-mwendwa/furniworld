import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/index.js';

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
    throw new UnauthenticatedError('Authentication Invalid. Please log in.');
  }
  req.user = jwt.verify(token, process.env.JWT_SECRET); // user: { id, role, iat, exp}, alt: verifyToken({ token })
  next();
};
