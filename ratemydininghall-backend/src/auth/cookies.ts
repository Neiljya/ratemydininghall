import { serialize } from 'cookie';

const isProd = process.env.NODE_ENV === 'production';

const sameSite = isProd ? 'none' : 'lax';

export function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    const accessCookie = serialize('access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite,
        path: '/',
        maxAge: 60 * 15, // 15 minutes
    });

    const refreshCookie = serialize('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite, 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie])
}

export function clearAuthCookies(res: any) {
    const expired = { httpOnly: true, secure: isProd, sameSite, path: '/', maxAge: 0};
    res.setHeader('Set-Cookie', [
        serialize('access_token', '', expired),
        serialize('refresh_token', '', expired),
    ]);
}