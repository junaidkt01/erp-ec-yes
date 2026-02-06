import { useState } from "react"
import { GlobalButton, PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"

const ContentList = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "document", title: "Document" },
        { key: "content_type", title: "Content Type" },
        { key: "size", title: "Size" },
        { key: "upload_by", title: "Upload By" },
        { key: "create_on", title: "Create On" },
    ];

    const sampleData = [
        {
            sl: "1",
            document: "Aarav Sharma",
            content_type: "10 (A)",
            size: "Rajesh Sharma",
            upload_by: "9876543210",
            create_on: "03-04-2025",
        },
    ];

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }

    return (
        <div className="page_wrapper">
            <div className="content_list">
                {isAddAdmissionQuery && <PopupScreen title="Add Content" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <InputField type="text" label="Content Type" placeHolder="Select content type" />
                            <InputField type="text" label="YouTube Link" placeHolder="Past YouTube link" />
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}
                <TableWrapper onClick={handleAddAdmissionQuery} isAddButton isSearchBar title="Content List" >
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
                    <div className="table_more_actions" >
                        <div className="checkbox" >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="0.5" y="0.5" width="23" height="23" rx="3.5" stroke="#BDBCDB" fill="#605DEC" />
                                <path d="M17.3346 8L10.0013 15.3333L6.66797 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <p>1 Item Selected</p>
                        </div>
                        <div className="action_buttons" >
                            <GlobalButton bg="#FFFFFF" border="1px solid #605DEC" color="#605DEC" icon="/svgs/link.svg" title="Generate URL" />
                            <GlobalButton icon="/svgs/share.svg" title="Share" />
                        </div>
                    </div>
                </TableWrapper>
            </div>
        </div>
    )
}

export default ContentList;
