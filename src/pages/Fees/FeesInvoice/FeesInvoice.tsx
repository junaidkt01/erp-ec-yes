import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { ReceiptText, CirclePlus, Printer } from "lucide-react";
import "./FeesInvoice.scss";

type ViewState = "list" | "add" | "view-payment" | "view-invoice";

const FeesInvoice = () => {
    const [currentView, setCurrentView] = useState<ViewState>("list");
    const [page, setPage] = useState(1);
    const [isAddPaymentModal, setIsAddPaymentModal] = useState(false);
    const [selectedStudentName, setSelectedStudentName] = useState("Laya Sayd");

    // ==========================================
    // 1. MAIN LIST COLUMNS & SAMPLE DATA (Image 1)
    // ==========================================
    const listColumns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "student_badge", title: "Student" },
        { key: "admission_no", title: "Admission No" },
        { key: "amount", title: "Amount" },
        { key: "waiver", title: "Waiver" },
        { key: "fine", title: "Fine" },
        { key: "paid", title: "Paid" },
        { key: "balance", title: "Balance" },
    ];

    const listSampleData = Array(8).fill(null).map(() => ({
        sl: 1,
        student_badge: (
            <span className="student_name_badge">
                Laya Sayd
            </span>
        ),
        admission_no: "3232323",
        amount: "1500",
        waiver: "0",
        fine: "0",
        paid: "0",
        balance: "1000",
    }));

    // ==========================================
    // 2. VIEW PAYMENT COLUMNS & DATA (Image 3)
    // ==========================================
    const paymentColumns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "date", title: "Date" },
        { key: "payment_method", title: "Payment Method" },
        { key: "change_method", title: "Change Method" },
        { key: "paid_amount", title: "Paid Amount" },
        { key: "waiver", title: "Waiver" },
        { key: "fine", title: "Fine" },
    ];

    const paymentSampleData = Array(6).fill(null).map(() => ({
        sl: 2,
        date: "--",
        payment_method: "--",
        change_method: "--",
        paid_amount: "--",
        waiver: "--",
        fine: "--",
    }));

    // ==========================================
    // 3. ADD INVOICE SUB-TABLE DATA (Image 2)
    // ==========================================
    const incidentRows = Array(6).fill(null).map(() => ({
        sl: 2,
        fees_type: "Transportation",
        subtotal: "12000",
    }));

    return (
        <div className="page_wrapper">
            <div className="fees_invoice_page">

                {/* ======================================================== */}
                {/* SCREEN 1: MAIN FEES INVOICE LIST (Image 1)              */}
                {/* ======================================================== */}
                {currentView === "list" && (
                    <>
                        <TableWrapper
                            isAddButton
                            isSearchBar
                            title="Fees Invoice"
                            addButtonTitle="Add Fees Invoice"
                            onClick={() => setCurrentView("add")}
                        >
                            <DataTable
                                columns={listColumns}
                                data={listSampleData}
                                currentPage={page}
                                totalPages={21}
                                onPageChange={(p) => setPage(p)}
                                actions={() => (
                                    <div className="actions fees_actions_cell">
                                        {/* 1. View Payment */}
                                        <button
                                            type="button"
                                            className="action_icon_btn"
                                            title="View Payment"
                                            onClick={() => {
                                                setSelectedStudentName("Laya Sayd");
                                                setCurrentView("view-payment");
                                            }}
                                        >
                                            <ReceiptText size={16} stroke="#605dec" />
                                        </button>

                                        {/* 2. View Fees Invoice */}
                                        <button
                                            type="button"
                                            className="action_icon_btn"
                                            title="View"
                                            onClick={() => setCurrentView("view-invoice")}
                                        >
                                            <img src="/svgs/eye_open.svg" alt="View" />
                                        </button>

                                        {/* 3. Add Payment */}
                                        <button
                                            type="button"
                                            className="action_icon_btn"
                                            title="Add Payment"
                                            onClick={() => setIsAddPaymentModal(true)}
                                        >
                                            <CirclePlus size={16} stroke="#605dec" />
                                        </button>

                                        {/* 4. Edit */}
                                        <button type="button" className="action_icon_btn" title="Edit">
                                            <img src="/svgs/edit.svg" alt="Edit" />
                                        </button>

                                        {/* 5. Delete */}
                                        <button type="button" className="action_icon_btn" title="Delete">
                                            <img src="/svgs/delete.svg" alt="Delete" />
                                        </button>
                                    </div>
                                )}
                            />
                        </TableWrapper>

                        {/* Optional Add Payment Popup */}
                        {isAddPaymentModal && (
                            <PopupScreen title="Add Payment" onClick={() => setIsAddPaymentModal(false)}>
                                <div className="popup_body">
                                    <div className="fields_wrapper">
                                        <div className="body_section">
                                            <CustomSelect
                                                label="Payment Method"
                                                placeholder="Select payment method"
                                                options={[
                                                    { label: "Cash", value: "Cash" },
                                                    { label: "Bank Transfer", value: "Bank Transfer" },
                                                    { label: "Card", value: "Card" },
                                                ]}
                                                onChange={() => { }}
                                            />
                                            <InputField type="text" label="Paid Amount" placeHolder="Enter paid amount" />
                                        </div>
                                        <div className="body_section">
                                            <InputField type="text" label="Waiver" placeHolder="Enter waiver" />
                                            <InputField type="text" label="Fine" placeHolder="Enter fine" />
                                        </div>
                                    </div>

                                    <div className="buttons">
                                        <SecondaryButton />
                                        <PrimaryButton title="Save Payment" onClick={() => setIsAddPaymentModal(false)} />
                                    </div>
                                </div>
                            </PopupScreen>
                        )}
                    </>
                )}

                {/* ======================================================== */}
                {/* SCREEN 2: ADD FEES INVOICE (Image 2)                    */}
                {/* ======================================================== */}
                {currentView === "add" && (
                    <div className="add_fees_invoice_container">
                        {/* Top Breadcrumb */}
                        <div className="breadcrumbs" onClick={() => setCurrentView("list")}>
                            <img src="/svgs/breadcrumbs-left-arrow.svg" alt="" />
                            <p>Fees Invoice</p>
                            <span>| Add fees Invoice</span>
                        </div>

                        {/* Card 1: Criteria */}
                        <TableWrapper title="Add Fees Invoice">
                            <div className="popup_body">
                                <p className="section_header_label">Select Criteria</p>
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
                                            onChange={() => { }}
                                        />
                                        <CustomSelect
                                            label="Student"
                                            placeholder="Select student"
                                            options={[
                                                { label: "Laya Sayd", value: "1" },
                                                { label: "Jhon Martin", value: "2" },
                                            ]}
                                            onChange={() => { }}
                                        />
                                    </div>

                                    <div className="body_section">
                                        <InputField type="date" label="Create Date" placeHolder="Select date" />
                                        <InputField type="date" label="Due Date" placeHolder="Select date" />
                                    </div>

                                    <div className="body_section payment_status_section">
                                        <CustomSelect
                                            label="Payment Status"
                                            placeholder="Select status"
                                            options={[
                                                { label: "Not Paid", value: "Not Paid" },
                                                { label: "Partial paid", value: "Partial paid" },
                                                { label: "Full Paid", value: "Full Paid" },
                                            ]}
                                            onChange={() => { }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </TableWrapper>

                        {/* Card 2: Assign Incident List */}
                        <div className="incident_list_card_wrapper">
                            <TableWrapper isSearchBar title="Assign Incident List">
                                <div className="popup_body">
                                    <p className="relation_guardian_title">Relation with Guardian</p>
                                    <p className="fees_type_label">Fees Type List</p>

                                    <div className="fees_type_select_box">
                                        <CustomSelect
                                            placeholder="Select fees type"
                                            options={[
                                                { label: "Transportation", value: "Transportation" },
                                                { label: "Tuition Fee", value: "Tuition Fee" },
                                                { label: "Library Fee", value: "Library Fee" },
                                            ]}
                                            onChange={() => { }}
                                        />
                                    </div>

                                    {/* Radio Options */}
                                    <div className="invoice_radio_group">
                                        <label className="radio_option">
                                            <input type="radio" name="fee_invoice_mode" defaultChecked />
                                            <span>Group Fees Generate Separate Invoice</span>
                                        </label>
                                        <label className="radio_option">
                                            <input type="radio" name="fee_invoice_mode" />
                                            <span>Clone Amount</span>
                                        </label>
                                    </div>

                                    {/* Sub Table with Exact Aligned Footer */}
                                    <div className="table_wrapper incident_sub_table_wrapper">
                                        <table className="custom_table incident_sub_table">
                                            <thead>
                                                <tr>
                                                    <th>SL</th>
                                                    <th>Fees Type</th>
                                                    <th>Amount</th>
                                                    <th>Waiver</th>
                                                    <th>Paid Amount</th>
                                                    <th>Subtotal</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {incidentRows.map((row, i) => (
                                                    <tr key={i}>
                                                        <td>{row.sl}</td>
                                                        <td>{row.fees_type}</td>
                                                        <td>
                                                            <input type="text" className="table_cell_input" />
                                                        </td>
                                                        <td>
                                                            <input type="text" className="table_cell_input" />
                                                        </td>
                                                        <td>
                                                            <input type="text" className="table_cell_input" />
                                                        </td>
                                                        <td>{row.subtotal}</td>
                                                        <td>
                                                            <div className="actions">
                                                                <button type="button">
                                                                    <img src="/svgs/edit.svg" alt="Edit" />
                                                                </button>
                                                                <button type="button">
                                                                    <img src="/svgs/delete.svg" alt="Delete" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="incident_result_row">
                                                    <td colSpan={2} className="result_label_cell">
                                                        Result
                                                    </td>
                                                    <td className="result_val_cell">1200</td>
                                                    <td className="result_val_cell">1200</td>
                                                    <td className="result_val_cell">1200</td>
                                                    <td className="result_val_cell">1200</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </TableWrapper>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* SCREEN 3: VIEW PAYMENT (Image 3)                        */}
                {/* ======================================================== */}
                {currentView === "view-payment" && (
                    <div className="view_payment_container">
                        {/* Top Breadcrumb */}
                        <div className="breadcrumbs" onClick={() => setCurrentView("list")}>
                            <img src="/svgs/breadcrumbs-left-arrow.svg" alt="" />
                            <p>Fees Invoice</p>
                            <span>| View Payment</span>
                        </div>

                        <TableWrapper title={`Payment of ${selectedStudentName}`}>
                            <DataTable
                                columns={paymentColumns}
                                data={paymentSampleData}
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
                )}

                {/* ======================================================== */}
                {/* SCREEN 4: VIEW FEES INVOICE (Image 4)                   */}
                {/* ======================================================== */}
                {currentView === "view-invoice" && (
                    <div className="view_invoice_container">
                        {/* Header with Breadcrumb & Print Button */}
                        <div className="view_invoice_header_bar">
                            <div className="breadcrumbs" onClick={() => setCurrentView("list")}>
                                <img src="/svgs/breadcrumbs-left-arrow.svg" alt="" />
                                <p>Fees Invoice</p>
                                <span>| View Fees Invoice</span>
                            </div>
                            <PrimaryButton icon={<Printer size={16} />} title="Print" type="button" />
                        </div>

                        {/* Invoice Canvas */}
                        <TableWrapper title="View Fees Invoice">
                            <div className="view_invoice_content_card">
                                <div className="invoice_preview_blank_canvas">
                                    {/* Clean invoice preview layout matching Image 4 */}
                                </div>
                            </div>
                        </TableWrapper>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FeesInvoice;
