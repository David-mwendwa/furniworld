import { StatusCodes } from 'http-status-codes';
import User from '../models/userModel.js';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';
import {
  buildFilter,
  buildPagination,
  paginationMeta,
} from '../utils/queryFeatures.js';

export const updateMe = async (req, res) => {
  const { name, phone, avatarUrl, newsletterOptIn } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, avatarUrl, newsletterOptIn },
    { new: true, runValidators: true }
  );

  res.status(StatusCodes.OK).json({ success: true, user });
};

export const deleteMe = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'Your account has been deactivated' });
};

/* ---------- admin ---------- */

export const listUsers = async (req, res) => {
  const filter = buildFilter(req.query, {
    allowedFilters: ['role'],
    searchFields: ['name', 'email'],
  });

  const { page, limit, skip } = buildPagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    users,
    meta: paginationMeta({ page, limit, total }),
  });
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('That user could not be found');
  res.status(StatusCodes.OK).json({ success: true, user });
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role))
    throw new BadRequestError('Role must be user or admin');

  if (String(req.params.id) === String(req.user.id))
    throw new BadRequestError('You cannot change your own role');

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) throw new NotFoundError('That user could not be found');
  res.status(StatusCodes.OK).json({ success: true, user });
};

export const deactivateUser = async (req, res) => {
  if (String(req.params.id) === String(req.user.id))
    throw new BadRequestError('You cannot deactivate your own account here');

  const user = await User.findByIdAndUpdate(req.params.id, { active: false });
  if (!user) throw new NotFoundError('That user could not be found');

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: 'User deactivated' });
};
