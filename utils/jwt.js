import jwt from 'jsonwebtoken';

/**
 * Create and save authenticated user token in the cookie
 * @param {*} user user details to be returned with the token on response upon authentication
 * @param {*} statusCode response status code
 * @param {*} res response object
 * @param {*} options cookie options
 * @param {*} signToken create token
 */
export const sendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );

  const oneDay = 24 * 60 * 60 * 1000;
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_LIFETIME * oneDay),
    httpOnly: true,
  };
  if (/production/i.test(process.env.NODE_ENV))
    options = { ...options, secure: true };

  user.password = undefined;

  res.status(statusCode).cookie('token', token, options).json({ token, user });
};
