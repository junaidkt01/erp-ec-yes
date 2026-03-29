import "./buttons.scss"

export const AddButton = ({ title, onClick }: { title: string; onClick?: any; }) => {
    return (
        <button className="button add_button" onClick={onClick} >
            <p>{title}</p>
            <img src="/svgs/plus.svg" alt="" />
        </button>
    )
}

export const GlobalButton = ({ title, onClick, icon, bg, border, color }: { title: string; onClick?: any; icon: string; bg?: string; border?: string; color?: string; }) => {
    return (
        <button className="button add_button" style={{ backgroundColor: bg, border: border, color: color }} onClick={onClick} >
            <p>{title}</p>
            <img src={icon} alt="" />
        </button>
    )
}

export const PrimaryButton = ({ title, type }: { title: string; type?: "button" | "submit" | "reset"; }) => {
    return (
        <button className="button primary_button" type={type} >
            {title}
        </button>
    )
}

export const SecondaryButton = () => {
    return (
        <button className="button secondary_button" >
            Reset
        </button>
    )
}