import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import "./BankPayment.scss";

const BankPayment = () => {
    const [page, setPage] = useState(1);

    const columns: Column[] = [
        { key: "student_name", title: "Student Name" },
        { key: "view_transaction", title: "View Transaction" },
        { key: "date", title: "Date" },
        { key: "amount", title: "Amount" },
        { key: "note", title: "Note" },
        { key: "file", title: "File" },
        { key: "status", title: "Status" },
    ];

    const sampleData = Array(8).fill(null).map(() => ({
        student_name: "Riya Sayd",
        view_transaction: "--",
        date: "23/04/2025",
        amount: "2000",
        note: "---",
        file: "---",
        status: "-",
    }));

    return (
        <div className="page_wrapper">
            <div className="bank_payment_page">
                {/* 1. Select Criteria Card */}
                <TableWrapper title="Bank Payment">
                    <div className="popup_body">
                        <p className="select_criteria_title">Select Criteria</p>
                        <div className="fields_wrapper">
                            <div className="body_section">
                                <InputField
                                    type="date"
                                    label="Date Range"
                                    placeHolder="Select date"
                                />
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
                            </div>

                            <div className="body_section">
                                <CustomSelect
                                    label="Section"
                                    placeholder="Select section"
                                    options={[
                                        { label: "Section A", value: "A" },
                                        { label: "Section B", value: "B" },
                                    ]}
                                    onChange={() => {}}
                                />
                                <CustomSelect
                                    label="Status"
                                    placeholder="Select status"
                                    options={[
                                        { label: "Approved", value: "Approved" },
                                        { label: "Pending", value: "Pending" },
                                        { label: "Reject", value: "Reject" },
                                    ]}
                                    onChange={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                </TableWrapper>

                {/* 2. Bank Payment List Card */}
                <div className="bank_payment_list_section">
                    <TableWrapper
                        isAddButton
                        isSearchBar
                        title="Bank Payment List"
                        addButtonTitle="Add Class"
                    >
                        <DataTable
                            columns={columns}
                            data={sampleData}
                            currentPage={page}
                            totalPages={21}
                            onPageChange={(p) => setPage(p)}
                            actions={() => (
                                <div className="actions">
                                    <button type="button">
                                        <img src="/svgs/edit.svg" alt="Edit" />
                                    </button>
                                    <button type="button">
                                        <img src="/svgs/delete.svg" alt="Delete" />
                                    </button>
                                </div>
                            )}
                        />
                    </TableWrapper>
                </div>
            </div>
        </div>
    );
};

export default BankPayment;
