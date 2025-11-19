import { AddButton } from "../Buttons/Buttons"


const SearchScreen = ({ children }: { children: any }) => {
    return (
        <div className="search_screen" >
            <div className="popup_header">
                <p>Add Complaint</p>
                <AddButton title="Add" />
            </div>
            {children}
        </div>
    )
}

export default SearchScreen
