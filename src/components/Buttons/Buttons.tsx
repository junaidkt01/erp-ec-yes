import "./buttons.scss"

export const AddButton = ({ title, onClick }: { title: string; onClick?: any }) => {
    return (
        <button className="button add_button" onClick={onClick} >
            <p>{title}</p>
            <img src="/svgs/plus.svg" alt="" />
        </button>
    )
}

export const PrimaryButton = ({ title }: { title: string }) => {
    return (
        <button className="button primary_button" >
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