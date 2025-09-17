import headerStyles from '../../../../global-styles/text-styles/headers.module.css';

type HeaderVars = {
    '--header-color'?: string;
    '--header-align'?: string;
}
function BoldHeader({ text, color, align }: { text?: string, color?: string, align?: 'left' | 'center' | 'right' }) {

    const style: React.CSSProperties & HeaderVars = {
        '--header-color': color,
        '--header-align': align,

    };

    return (
        <div
            className={headerStyles.boldHeader}
            style={style}
        >
            {text}
        </div>
    )
}

export default BoldHeader;