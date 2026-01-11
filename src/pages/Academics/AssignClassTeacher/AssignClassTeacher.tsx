import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"

const AssignClassTeacher = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "class", title: "Class" },
        { key: "section", title: "Section" },
        { key: "teacher", title: "Teacher" },
    ];

    const sampleData = [
        {
            sl: 1,
            class: "3",
            section: "A",
            teacher: "Steve Jobs",
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="assign_class_teacher_page">
                {isAddAdmissionQuery && <PopupScreen title="Add Class Teacher" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="fields_wrapper" >
                            <div className="body_section" >
                                <CustomSelect label="Choose Enquiry Source" placeholder="Select source" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Choose Status" placeholder="Select status" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>
                            <div className="body_section" >
                                <CustomSelect label="Teacher" placeholder="Choose to Assign Teacher" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>
                        </div>
                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton isSearchBar title="Class Teachers List" onClick={handleAddAdmissionQuery} >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            <div className="actions">
                                <button><img src="/svgs/edit.svg" alt="" /></button>
                                <button><img src="/svgs/delete.svg" alt="" /></button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default AssignClassTeacher;
