import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper"
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";

const UploadContent = () => {
    const [page, setPage] = useState(1);
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "content_title", title: "Content Title" },
        { key: "type", title: "Type" },
        { key: "date", title: "Date" },
        { key: "available_for", title: "Available for" },
        { key: "class_section", title: "Class Section" },
        // { key: "progress", title: "Progress" },
    ];

    const sampleData = [
        {
            sl: "1",
            content_title: "12th English Syllabus",
            type: "Other",
            date: "03-04-2025",
            available_for: "All Students",
            class_section: " 12 • Science",
        },
    ];

    const [isAddComplaint, setIsAddComplaint] = useState(false)
    const handleAddComplaint = () => {
        setIsAddComplaint(!isAddComplaint)
    }
    return (
        <div className="page_wrapper">
            <div className="upload_content_page" >
                {isAddComplaint && <PopupScreen title="Upload Content" onClick={handleAddComplaint} >
                    <div className="popup_body" >
                        <div className="fields_wrapper" >

                            <div className="body_section" >
                                <InputField type="text" label="Content Title" placeHolder="Enter content title" />
                                <CustomSelect label="Content Type" placeholder="Select complaint type" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>
                            <div className="body_section" >
                                <div>
                                    <p>Available for</p>
                                    <div>
                                        <div>
                                            <input type="checkbox" name="" id="" />
                                            <label htmlFor="">All Admins</label>
                                        </div>
                                        <div>
                                            <input type="checkbox" name="" id="" />
                                            <label htmlFor="">Students</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="body_section" >
                                <CustomSelect label="Class" placeholder="Select Class" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Section" placeholder="Select Section" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                            </div>
                            <div className="body_section" >
                                <p>Available for All  Clases</p>
                                <button>toggle</button>
                            </div>

                            <div className="body_section" >
                                <InputField type="date" label="Date" placeHolder="Select date" />
                                <InputField type="text" label="Source URL" placeHolder="Enter source url" />
                            </div>
                            <div className="body_section" >
                                <InputField type="text" label="Discription" placeHolder="Enter discription" />
                            </div>
                            <div className="body_section" >
                                <CustomSelect label="Reference" placeholder="Select reference" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Source" placeholder="Select Source" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <CustomSelect label="Class" placeholder="Select Class" options={["Active", "Under Review", "In Progress", "Resolved", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                <InputField type="number" label="Number of child" placeHolder="Enter number of child" />
                            </div>

                            <div className="body_section" >
                                <input type="file" name="" id="" />
                            </div>
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton isSearchBar title="Upload Content List" onClick={handleAddComplaint} >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        // progress={(row) => (
                        //     <div className="actions"> <StatusBar status={row} /> </div>
                        // )}
                        actions={() => (
                            <div className="actions">
                                <button><img src="/svgs/download.svg" alt="" /></button>
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

export default UploadContent;
