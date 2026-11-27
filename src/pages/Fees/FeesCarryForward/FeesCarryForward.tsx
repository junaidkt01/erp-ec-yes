import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import "./FeesCarryForward.scss";

const FeesCarryForward = () => {
    const [page, setPage] = useState(2);
    const [searchValue, setSearchValue] = useState("");

    const columns: Column[] = [
        { key: "student_name", title: "Student Name" },
        { key: "admission_no", title: "Admission No." },
        { key: "roll_no", title: "Roll No." },
        { key: "father_name", title: "Father name" },
        { key: "balance", title: "Balance" },
        { key: "short_note", title: "Short Note" },
    ];

    const sampleData = Array(6).fill(null).map(() => ({
        student_name: "Riya Sayd",
        admission_no: "232323",
        roll_no: "12",
        father_name: "Sayd",
        balance: <input className="table_cell_input" type="text" />,
        short_note: <input className="table_cell_input" type="text" />,
    }));

    return (
        <div className="page_wrapper">
            <div className="fees_carry_forward_page">
                {/* 1. Select Criteria Card */}
                <TableWrapper title="Fees carry Forward">
                    <div className="popup_body">
                        <p className="select_criteria_title">Select Criteria</p>
                        <div className="fields_wrapper">
                            <div className="body_section">
                                <CustomSelect
                                    label="Class"
                                    placeholder="Select class"
                                    options={[
                                        { label: "Class 1", value: "1" },
                                        { label: "Class 2", value: "2" },
                                        { label: "Class 10", value: "10" },
                                    ]}
                                    onChange={() => {}}
                                />
                                <CustomSelect
                                    label="Section"
                                    placeholder="Select section"
                                    options={[
                                        { label: "Section A", value: "A" },
                                        { label: "Section B", value: "B" },
                                    ]}
                                    onChange={() => {}}
                                />
                            </div>
                        </div>

                        <div className="criteria_bottom_buttons">
                            <SecondaryButton title="Reset" />
                            <PrimaryButton title="Search" />
                        </div>
                    </div>
                </TableWrapper>

                {/* 2. Previous Session Balance Fees Card */}
                <div className="balance_fees_section">
                    <TableWrapper
                        isSearchBar
                        searchValue={searchValue}
                        searchOnchange={(val) => setSearchValue(val)}
                        title={
                            <div className="title_with_notice">
                                <span className="title_text">Previous Session Balance Fees</span>
                                <span className="notice_pill">
                                    Previous balance already forwarded, You can only update now.
                                </span>
                            </div>
                        }
                    >
                        <DataTable
                            columns={columns}
                            data={sampleData}
                            currentPage={page}
                            totalPages={21}
                            onPageChange={(p) => setPage(p)}
                            footerAction={<PrimaryButton title="Save" />}
                        />
                    </TableWrapper>
                </div>
            </div>
        </div>
    );
};

export default FeesCarryForward;
