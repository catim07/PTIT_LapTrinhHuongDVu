import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined in environment variables');
  return jwt.sign({ id: user._id || user.id, role_id: user.role_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  return jwt.sign({ id: user._id || user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

export const verifyRefreshToken = (token) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
