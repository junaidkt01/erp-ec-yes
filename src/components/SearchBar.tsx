import { useState } from "react"

const SearchBar = ({ placeHolder }: { placeHolder: string }) => {
    const [searchTerm, setSearchTerm] = useState("")
    return (
        <div className="table_search_bar" >
            <span className="search_icon">
                <img src="/header_icons/search_icon.svg" alt="search" />
            </span>
            {/* <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} type="text" placeholder="Search Name/Admission.." /> */}
            <input onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} type="text" placeholder={placeHolder} />
        </div>
    )
}

export default SearchBar
