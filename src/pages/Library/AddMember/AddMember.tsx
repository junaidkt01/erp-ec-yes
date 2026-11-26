import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import "./AddMember.scss";

const AddMember = () => {
    const [page, setPage] = useState(1);
    const [isAddMember, setIsAddMember] = useState(false);

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "name", title: "Name" },
        { key: "member_type", title: "Member Type" },
        { key: "member_id", title: "Member ID" },
        { key: "email", title: "Email" },
        { key: "mobile", title: "Mobile" },
    ];

    const sampleData = [
        {
            sl: 1,
            name: "Jhon Martin",
            member_type: "Super Admin",
            member_id: "232323",
            email: "jhon@gmail.com",
            mobile: "87878383838",
        },
        {
            sl: 1,
            name: "Jhon Martin",
            member_type: "Super Admin",
            member_id: "232323",
            email: "jhon@gmail.com",
            mobile: "87878383838",
        },
        {
            sl: 1,
            name: "Jhon Martin",
            member_type: "Super Admin",
            member_id: "232323",
            email: "jhon@gmail.com",
            mobile: "87878383838",
        },
        {
            sl: 1,
            name: "Jhon Martin",
            member_type: "Super Admin",
            member_id: "232323",
            email: "jhon@gmail.com",
            mobile: "87878383838",
        },
        {
            sl: 1,
            name: "Jhon Martin",
            member_type: "Super Admin",
            member_id: "232323",
            email: "jhon@gmail.com",
            mobile: "87878383838",
        },
        {
            sl: 1,
            name: "Jhon Martin",
            member_type: "Super Admin",
            member_id: "232323",
            email: "jhon@gmail.com",
            mobile: "87878383838",
        },
    ];

    return (
        <div className="page_wrapper">
            <div className="add_member_page">
                {/* Add Member Popup */}
                {isAddMember && (
                    <PopupScreen title="Add Member" onClick={() => setIsAddMember(false)}>
                        <div className="popup_body">
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        label="Member Type"
                                        placeholder="Select member type"
                                        options={[
                                            { label: "Super Admin", value: "Super Admin" },
                                            { label: "Admin", value: "Admin" },
                                            { label: "Staff", value: "Staff" },
                                            { label: "Student", value: "Student" },
                                        ]}
                                        onChange={() => {}}
                                    />
                                    <InputField
                                        type="text"
                                        label="Member ID"
                                        placeHolder="Enter member id"
                                    />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton title="Save Member" />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {/* Members Listing Table */}
                <TableWrapper
                    isAddButton
                    isSearchBar
                    title="Members"
                    addButtonTitle="Add Member"
                    onClick={() => setIsAddMember(true)}
                >
                    <DataTable
                        columns={columns}
                        data={sampleData}
                        currentPage={page}
                        totalPages={21}
                        onPageChange={(p) => setPage(p)}
                        actions={() => (
                            <div className="actions">
                                <button>
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button>
                                    <img src="/svgs/delete.svg" alt="Delete" />
                                </button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    );
};

export default AddMember;
