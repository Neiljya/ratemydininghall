import textStyles from '../../../../global-styles/text-styles/text.module.css';

type HeaderVars = {
    '--text-color'?: string;
}
function CardDescription({ text, color }: {text?: string, color?: string}) {

    const style: React.CSSProperties & HeaderVars = {
        "--text-color": color,
    };

    return (
        <div 
            className={textStyles.cardDescription}
            style={style}
        >
            {text}
        </div>
    )
}

export default CardDescription;