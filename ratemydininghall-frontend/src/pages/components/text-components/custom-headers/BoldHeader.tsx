import headerStyles from '../../../../global-styles/text-styles/headers.module.css';

type HeaderVars = {
    '--header-color'?: string;
    '--header-bg'?: string;
}
function BoldHeader({ text, color }: {text?: string, color?: string}) {

    const style: React.CSSProperties & HeaderVars = {
        "--header-color": color,
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