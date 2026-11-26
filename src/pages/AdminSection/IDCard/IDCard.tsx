import { useState } from "react";
import type { Column } from "../../../components/DataTable/DataTable";
import TableWrapper from "../../../components/TableWrapper";
import DataTable from "../../../components/DataTable/DataTable";
import CreateIDCard from "./CreateIDCard";
import type { IDCardConfig } from "./types";
import { DEFAULT_ID_CONFIG } from "./types";
import { toast } from "sonner";
import "./IDCard.scss";

interface IDCardRecord {
    sl: number;
    title: string;
    role: string;
    layout: string;
    dimensions: string;
    config?: IDCardConfig;
}

const initialCards: IDCardRecord[] = [
    {
        sl: 1,
        title: "Student ID Card",
        role: "Student",
        layout: "Portrait",
        dimensions: "57 × 89 MM",
        config: { ...DEFAULT_ID_CONFIG },
    },
    {
        sl: 2,
        title: "Staff & Faculty ID Card",
        role: "Staff",
        layout: "Portrait",
        dimensions: "54 × 85.6 MM",
        config: {
            ...DEFAULT_ID_CONFIG,
            title: "Staff & Faculty ID Card",
            applicableUser: "Staff",
            pageWidth: 54,
            pageHeight: 85.6,
        },
    },
    {
        sl: 3,
        title: "Visitor & Guest Pass",
        role: "Visitor",
        layout: "Landscape",
        dimensions: "85.6 × 54 MM",
        config: {
            ...DEFAULT_ID_CONFIG,
            title: "Visitor & Guest Pass",
            applicableUser: "Visitor",
            layout: "landscape",
            pageWidth: 85.6,
            pageHeight: 54,
        },
    },
];

const IDCard = () => {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDesigning, setIsDesigning] = useState(false);
    const [cardsList, setCardsList] = useState<IDCardRecord[]>(initialCards);
    const [currentEditingConfig, setCurrentEditingConfig] = useState<IDCardConfig>(DEFAULT_ID_CONFIG);

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "title", title: "Title" },
        { key: "role", title: "Role" },
        { key: "layout", title: "Layout" },
        { key: "dimensions", title: "Dimensions" },
    ];

    const handleCreateNew = () => {
        setCurrentEditingConfig(DEFAULT_ID_CONFIG);
        setIsDesigning(true);
    };

    const handleEdit = (card: IDCardRecord) => {
        setCurrentEditingConfig(card.config || {
            ...DEFAULT_ID_CONFIG,
            title: card.title,
            applicableUser: card.role as any,
        });
        setIsDesigning(true);
    };

    const handleDelete = (sl: number) => {
        setCardsList((prev) => prev.filter((c) => c.sl !== sl));
        toast.success("ID Card template removed");
    };

    const handleSaveCard = (savedConfig: IDCardConfig) => {
        setCardsList((prev) => {
            const existingIndex = prev.findIndex((c) => c.title.toLowerCase() === savedConfig.title.toLowerCase());
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    title: savedConfig.title,
                    role: savedConfig.applicableUser,
                    layout: savedConfig.layout === "portrait" ? "Portrait" : "Landscape",
                    dimensions: `${savedConfig.pageWidth} × ${savedConfig.pageHeight} MM`,
                    config: savedConfig,
                };
                return updated;
            } else {
                return [
                    ...prev,
                    {
                        sl: prev.length + 1,
                        title: savedConfig.title,
                        role: savedConfig.applicableUser,
                        layout: savedConfig.layout === "portrait" ? "Portrait" : "Landscape",
                        dimensions: `${savedConfig.pageWidth} × ${savedConfig.pageHeight} MM`,
                        config: savedConfig,
                    },
                ];
            }
        });
        setIsDesigning(false);
    };

    const filteredData = cardsList.filter((card) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            card.title.toLowerCase().includes(term) ||
            card.role.toLowerCase().includes(term) ||
            card.layout.toLowerCase().includes(term)
        );
    });

    return (
        <div className="page_wrapper">
            <div className="id_card_page">
                {isDesigning ? (
                    <CreateIDCard 
                        onBack={() => setIsDesigning(false)} 
                        onSaveSuccess={handleSaveCard}
                        initialConfig={currentEditingConfig}
                    />
                ) : (
                    <TableWrapper 
                        isAddButton 
                        isSearchBar 
                        title="ID Card" 
                        addButtonTitle="Create New ID Card"
                        searchValue={searchTerm}
                        searchOnchange={setSearchTerm}
                        onClick={handleCreateNew} 
                    >
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            currentPage={page}
                            totalPages={Math.max(1, Math.ceil(filteredData.length / 10))}
                            onPageChange={(p) => setPage(p)}
                            actions={(row) => (
                                <div className="actions">
                                    <button 
                                        type="button" 
                                        onClick={() => handleEdit(row)}
                                        title="Edit ID Card Designer"
                                    >
                                        <img src="/svgs/edit.svg" alt="Edit" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleDelete(row.sl)}
                                        title="Delete Template"
                                    >
                                        <img src="/svgs/delete.svg" alt="Delete" />
                                    </button>
                                </div>
                            )}
                        />
                    </TableWrapper>
                )}
            </div>
        </div>
    );
};

export default IDCard;
