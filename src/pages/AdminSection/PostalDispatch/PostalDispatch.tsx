import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import InputFiles from "../../../components/InputFields/InputFiles"

const PostalDispatch = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "to_title", title: "To Title" },
        { key: "reference_no", title: "Reference No" },
        { key: "address", title: "Address" },
        { key: "from_title", title: "From Title" },
        { key: "note", title: "Note" },
        { key: "date", title: "Date" },
    ];

    const sampleData = [
        {
            to_title: "ABC Pvt. Ltd.",
            reference_no: "REF-10234",
            address: "123, Park Street, NY",
            from_title: "Accounts Dept.",
            note: "Invoice for payment",
            date: "03-04-2025",
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }
    return (
        <div className="page_wrapper">
            <div className="postal_dispatch">
                {isAddAdmissionQuery &&
                    <PopupScreen title="Add Postal Dispatch" onClick={handleAddAdmissionQuery} >
                        <div className="popup_body" >
                            <div className="fields_wrapper" >
                                <div className="body_section" >
                                    <InputField type="text" label="From Title" placeHolder="Enter from title" />
                                    <InputField type="text" label="Reference No" placeHolder="Enter refrence no" />
                                </div>
                                <div className="body_section" >
                                    <InputField type="text" label="Address" placeHolder="Enter address" />
                                </div>
                                <div className="body_section" >
                                    <InputField type="text" label="Note" placeHolder="Enter note" />
                                </div>
                                <div className="body_section" >
                                    <InputField type="text" label="To Title" placeHolder="Enter to title" />
                                    <InputField type="date" label="Date" placeHolder="Select date" />
                                </div>
                                <div className="body_section" >
                                    <InputFiles />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Save" />
                            </div>
                        </div>
                    </PopupScreen>}

                <TableWrapper isAddButton isSearchBar title="Postal Dispatch" onClick={handleAddAdmissionQuery} >
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

export default PostalDispatch;
