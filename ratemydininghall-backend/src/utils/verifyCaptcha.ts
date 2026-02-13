const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY = 'https://www.google.com/recaptcha/api/siteverify';

export async function verifyCaptcha(token: string | null | undefined): Promise<void> {
    if (!token) {
        throw new Error('Captcha token is missing');
    }

    if (!RECAPTCHA_SECRET_KEY) {
        console.warn('RECAPTCHA_SECRET_KEY missing');
        return;
    }

    const params = new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token
    });

    try {
        const response = await fetch(RECAPTCHA_VERIFY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        const data = await response.json();

        if (!data.success) {
            console.error('Captcha verification failed:', data['error-codes']);
            throw new Error('Captcha verification failed');
        }
    } catch (err) {
        console.error('Captcha network error:', err);
        throw new Error('Captcha verification service unavailable');
    }
}