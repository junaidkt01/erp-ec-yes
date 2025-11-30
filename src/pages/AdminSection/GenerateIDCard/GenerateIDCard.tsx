import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const GenerateIDCard = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "select", title: "" },
        { key: "admission_no", title: "Admission No" },
        { key: "name", title: "Name" },
        { key: "class", title: "Class (Sec.)" },
        { key: "father_name", title: "Father Name" },
        { key: "dob", title: "Date Of Birth" },
        { key: "gender", title: "Gender" },
        { key: "mobile", title: "Mobile" },
    ];

    const sampleData = [
        {
            admission_no: "1001",
            name: "Aarav Sharma",
            class: "10 (A)",
            father_name: "Rajesh Sharma",
            dob: "03-04-2025",
            gender: "M",
            mobile: "9876543210",
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="generate_id_card_page" >
                <TableWrapper title={"Generate ID Card"} onClick={handleAddAdmissionQuery} >
                    <div className="search_screen">
                        <p className="search_screen_title" >Select Criteria</p>
                        <div className="popup_body" >
                            <div className="body_section" >
                                <CustomSelect label="Class" placeholder="Select class" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Section" placeholder="Select section" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Certificate" placeholder="Select certificate" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Search" />
                            </div>
                        </div>
                    </div>
                </TableWrapper>
                <TableWrapper isSearchBar title="Query List" >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        select={() => (
                            <div className="select"> <input type="checkbox" name="" id="" /> </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default GenerateIDCard;