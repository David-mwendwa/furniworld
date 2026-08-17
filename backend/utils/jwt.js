const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Issues a JWT, sets it as an httpOnly cookie and returns it in the body.
 * The frontend authenticates with the Authorization header; the cookie is a
 * convenience for non-browser clients.
 */
export const sendToken = (user, statusCode, res) => {
  const token = user.signJWT();
  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

  res.cookie('token', token, {
    expires: new Date(Date.now() + cookieDays * DAY_MS),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  user.password = undefined;

  res.status(statusCode).json({ success: true, token, user });
};

export const clearToken = (res) => {
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
};
