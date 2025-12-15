import bcrypt = require('bcryptjs');
import type { YogaContext } from '../../src/types/yogaContext';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../auth/jwt';
import { setAuthCookies, clearAuthCookies } from '../auth/cookies';

const adminUser = process.env.ADMIN_USERNAME!;
const adminHash = process.env.ADMIN_HASH!

if (!adminUser || !adminHash) {
    throw new Error('ADMIN_USERNAME / ADMIN_HASH not found');
}

export const authResolvers = {
    Query: {
        me: (_: unknown, __: unknown, ctx: YogaContext) => {
            return { ok: Boolean(ctx.user), role: ctx.user?.role ?? null };
        },
    },

    Mutation: {
        login: async (_: unknown, { input }: any, ctx: YogaContext) => {
            const { username, password } = input;
            
            // eventually we can compare DB users, but for now single account
            if (username !== adminUser) return { ok: false, role: null };

            const match = await bcrypt.compare(password, adminHash);
            if (!match) return { ok: false, role: null };

            const user = { sub: username, role: 'admin' as const };

            const access = signAccessToken(user);
            const refresh = signRefreshToken(user);

            setAuthCookies(ctx.res, access, refresh);

            return { ok: true, role: 'admin' };
        },

        logout: async (_: unknown, __: unknown, ctx: YogaContext) => {
            clearAuthCookies(ctx.res);
            return true;
        },

        refreshSession: async(_: unknown, __: unknown, ctx: YogaContext) => {
            // refresh using refresh_token cookie
            const cookieHeader = ctx.req.headers.cookie ?? '';
            const { parse } = await import('cookie');
            const cookies = parse(cookieHeader);
            const refresh = cookies['refresh_token'];

            if (!refresh) return { ok: false, role: null };

            try {
                const user = verifyRefreshToken(refresh);
                const access = signAccessToken(user);
                const newRefresh = signRefreshToken(user);

                setAuthCookies(ctx.res, access, newRefresh);
                return { ok: true, role: user.role };
            } catch {
                return { ok: false, role: null };
            }
        }
    }
};