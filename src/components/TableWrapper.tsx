import { AddButton } from "./Buttons/Buttons"
import SearchBar from "./SearchBar"

const TableWrapper = ({ isSearchBar, isAddButton, title, children, onClick }: { isAddButton?: boolean; isSearchBar?: boolean; title: string, children: any; onClick?: any }) => {
    return (
        <div className="table_canvas" >
            <div className="table_header" >
                <div className="table_title" >
                    <p>{title}</p>
                    {isSearchBar && <SearchBar placeHolder={"Search"} />}
                </div>

                {isAddButton && <AddButton onClick={onClick} title={title === "ID Card" ? "Create New ID Card" : title === "Certificate" ? "Create Certificate" : title === "Upload Content List" ? "Upload Content" : title === "Content Type List" ? "Add Content Type" : "Add" } />}
            </div>

            <div className="table_section" >
                {children}
            </div>
        </div>
    )
}

export default TableWrapper
