import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const Class = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "class", title: "Class" },
        { key: "section", title: "Section" },
        { key: "students", title: "Students" },
    ];

    const sampleData = [
        {
            sl: 1,
            class: "10",
            section: "Science (940) , Humanities (20)",
            students: "64",
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="class_page">
                {isAddAdmissionQuery && <PopupScreen title="Add Class" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="fields_wrapper" >
                            <div className="body_section" >
                                <InputField type="text" label="Name" placeHolder="Enter name" />
                            </div>
                        </div>

                        <div className="body_section" >
                            <p>Section</p>
                            <div>
                                <div>
                                    <input type="radio" name="" id="" />
                                    <label htmlFor="">A</label>
                                </div>
                            </div>
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton isSearchBar title="Class List" onClick={handleAddAdmissionQuery} >
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

export default Class;
