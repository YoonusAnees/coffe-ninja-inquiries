import bcrypt from 'bcrypt';

const SALT = 10;
export const hashPassword = (password) => {
    bcrypt.hash(password, SALT);
}

export const comparePassword = (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash)
}