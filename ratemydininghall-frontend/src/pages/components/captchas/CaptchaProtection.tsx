import { useImperativeHandle, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

// this interface acts like a remote control, functions inside are like the 'buttons'
// captcha does not reset on component re-rendering, so we need to manually reset it
export interface CaptchaRef {
    reset: () => void;
}

interface Props {
    onVerify: (token: string | null) => void;
    // pass in our controls 
    actions: React.Ref<CaptchaRef>;
}

export default function CaptchaProtection({ onVerify, actions }: Props) {
    // connects to the recaptcha library
    const internalRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(actions, () => ({
        reset: () => {
            internalRef.current?.reset();
            onVerify(null);
        }
    }));

    return (
        <div style={{ margin: '1rem 0' }}>
            <ReCAPTCHA
                ref={internalRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => onVerify(token)}
                theme='light'
            />
        </div>
    )
    
}