import { AddButton } from "./Buttons/Buttons"
import SearchBar from "./SearchBar"

const TableWrapper = ({ children, onClick }: { children: any; onClick?: any }) => {
    return (
        <div className="table_canvas" >
            <div className="table_header" >
                <div className="table_title" >
                    <p>Postal Receive</p>
                    <SearchBar />
                </div>

                <AddButton onClick={onClick} title="Add" />
            </div>

            <div className="table_section" >
                {children}
            </div>
        </div>
    )
}

export default TableWrapper
