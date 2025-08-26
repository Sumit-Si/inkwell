import bcrypt from "bcryptjs";
import { db } from "../db/index.js";

const hashPassword = (password) => {
    return bcrypt.hash(password,10);
}

const isPasswordCorrect = (password,user) => {
    return bcrypt.compare(password, user?.password);
}

export {
    hashPassword,
    isPasswordCorrect,
}