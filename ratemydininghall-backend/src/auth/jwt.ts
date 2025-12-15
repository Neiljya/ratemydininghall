import * as jwt from "jsonwebtoken";

export type AuthUser = {
    sub: string;
    role: 'admin' | 'user';
};

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;

// expirations
const accessExpiry = '15m';
const refreshExpiry = '7d';

if (!accessSecret || !refreshSecret) {
    throw new Error('JWT_ACCESS_SECRET / JWT_REFRESH_SECRET not set');
}

export function signAccessToken(user: AuthUser) {
    return jwt.sign(user, accessSecret, { expiresIn: accessExpiry });
}

export function signRefreshToken(user: AuthUser) {
    return jwt.sign(user, refreshSecret, { expiresIn: refreshExpiry });
}

export function verifyAccessToken(token: string): AuthUser {
    return jwt.verify(token, accessSecret) as AuthUser;
}

export function verifyRefreshToken(token: string): AuthUser {
    return jwt.verify(token, refreshSecret) as AuthUser;
}