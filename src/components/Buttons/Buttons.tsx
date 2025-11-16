import "./buttons.scss"

export const AddButton = ({ title }: { title: string }) => {
    return (
        <button className="button add_button" >
            <p>{title}</p>
            <img src="/svgs/plus.svg" alt="" />
        </button>
    )
}

export const PrimaryButton = () => {
    return (
        <button className="button primary_button" >
            Search
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