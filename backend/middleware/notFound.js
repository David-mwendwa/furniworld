import { StatusCodes } from 'http-status-codes';

const notFound = (req, res) =>
  res
    .status(StatusCodes.NOT_FOUND)
    .json({ success: false, message: `Route ${req.originalUrl} not found` });

export default notFound;
