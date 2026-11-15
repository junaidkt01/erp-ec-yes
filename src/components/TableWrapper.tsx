import { AddButton } from "./Buttons/Buttons"
import Can from "./permissions/Can";
import SearchBar from "./SearchBar"

const TableWrapper = ({ permission, isSearchBar, isAddButton, title, addButtonTitle, children, onClick, searchValue = "", searchOnchange = () => { } }: { permission?: string; isAddButton?: boolean; isSearchBar?: boolean; title: string; addButtonTitle?: string; children: any; onClick?: any; searchValue?: string; searchOnchange?: (value: string) => void; }) => {
    return (
        <div className="table_canvas" >
            <div className="table_header" >
                <div className="table_title" >
                    <p>{title}</p>
                    {isSearchBar && <SearchBar value={searchValue} onChange={searchOnchange} placeHolder={"Search"} />}
                </div>

                {isAddButton && <Can permission={permission} > <AddButton onClick={onClick} title={addButtonTitle || (title === "ID Card" ? "Create New ID Card" : title === "Certificate" ? "Create Certificate" : title === "Upload Content List" ? "Upload Content" : title === "Content Type List" ? "Add Content Type" : title === "Add Student" ? "Import Student" : title === "Add Staff" ? "Import Staff" : "Add")} /></Can>}
            </div>

            <div className="table_section" >
                {children}
            </div>
        </div>
    )
}

export default TableWrapper
