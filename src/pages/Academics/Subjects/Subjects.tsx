import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const Subjects = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "subject", title: "Subject" },
        { key: "subject_type", title: "Subject Type" },
        { key: "subject_code", title: "Subject Code" },
    ];

    const sampleData = [
        {
            sl: 1,
            subject: "Education",
            subject_type: "Theory",
            subject_code: "EDU",
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="subjects_page">
                {isAddAdmissionQuery && <PopupScreen title="Add Subject" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <InputField type="text" label="Subject Name" placeHolder="Enter subject name" />
                            <InputField type="text" label="Subject Code" placeHolder="Enter subject code" />
                        </div>

                        <div className="body_section" >
                            <div>
                                <div>
                                    <input type="radio" name="" id="" />
                                    <label htmlFor="">Theory</label>
                                </div>
                                <div>
                                    <input type="radio" name="" id="" />
                                    <label htmlFor="">Practical</label>
                                </div>
                            </div>
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton isSearchBar title="Subjects List" onClick={handleAddAdmissionQuery} >
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

export default Subjects;
