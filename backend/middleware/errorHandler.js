import { StatusCodes } from 'http-status-codes';

const normalize = (err) => {
  if (err.name === 'CastError') {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      message: `Resource not found. Invalid ${err.path}: ${err.value}`,
    };
  }

  if (err.name === 'ValidationError') {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join('. '),
    };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return {
      statusCode: StatusCodes.CONFLICT,
      message: `That ${field} is already taken`,
    };
  }

  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Invalid token. Please log in again.',
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Your session has expired. Please log in again.',
    };
  }

  if (err.name === 'MulterError') {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      message:
        err.code === 'LIMIT_FILE_SIZE'
          ? 'That image is too large. The maximum size is 5MB.'
          : err.message,
    };
  }

  return {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.isOperational
      ? err.message
      : 'Something went wrong, please try again later',
  };
};

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = normalize(err);

  if (statusCode >= 500) console.error(err);

  const body = { success: false, message };

  if (process.env.NODE_ENV !== 'production') {
    body.error = { name: err.name, ...err };
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

export default errorHandler;
