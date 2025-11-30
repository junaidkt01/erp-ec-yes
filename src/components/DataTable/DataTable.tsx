import React from "react";
import "./DataTable.scss";

export interface Column {
    key: string;
    title: string;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    select?: (row: any) => React.ReactNode;
    progress?: (row: any) => React.ReactNode;
    actions?: (row: any) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({
    columns,
    data,
    currentPage,
    totalPages,
    onPageChange,
    select,
    progress,
    actions,
}) => {
    const getPagination = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push("...");

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="table_wrapper">
            <table className="custom_table">
                <thead>
                    <tr>
                        {select && <th>Select</th>}
                        {columns.map((c) => (
                            <th key={c.key}>{c.title}</th>
                        ))}
                        {progress && <th>Progress</th>}
                        {actions && <th>Actions</th>}
                    </tr>
                </thead>

                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {select && <td>{select(row.progress)}</td>}
                            {columns.map((c) => (
                                <td key={c.key}>{row[c.key]}</td>
                            ))}
                            {progress && <td>{progress(row.progress)}</td>}
                            {actions && <td>{actions(row)}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination_container">
                <div className="page_info">
                    {String(currentPage).padStart(2, "0")} page of {totalPages}
                </div>

                <div className="pagination_controls">

                    <button
                        className="nav_btn"
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        ‹
                    </button>

                    {getPagination().map((item, idx) =>
                        item === "..." ? (
                            <span key={idx} className="dots">...</span>
                        ) : (
                            <button
                                key={idx}
                                className={`page_btn ${currentPage === item ? "active" : ""
                                    }`}
                                onClick={() => onPageChange(Number(item))}
                            >
                                {String(item).padStart(2, "0")}
                            </button>
                        )
                    )}

                    <button
                        className="nav_btn"
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        ›
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;