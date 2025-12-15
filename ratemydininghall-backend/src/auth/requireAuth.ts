import type { AuthUser } from "./jwt";

export function requireUser(user?: AuthUser | null) {
    if (!user) throw new Error('Unauthorized');
    return user;
}

export function requireAdmin(user?: AuthUser | null) {
    if (!user) throw new Error('Unauthorized');
    if (user.role !== 'admin') throw new Error('Forbidden');
    return user;
}