import bcrypt from 'bcrypt';

export const hashPassword = async (password) => bcrypt.hash(password, 10);

export const comparePasswords = async (password, hash) => bcrypt.compare(password, hash);
