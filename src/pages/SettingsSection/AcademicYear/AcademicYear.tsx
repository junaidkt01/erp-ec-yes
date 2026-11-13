import React, { useMemo, useState } from "react"
import { toast } from "sonner"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import LoadingOverlay from "../../../components/Loadingoverlay"
import {
    useAddAcademicYear,
    useFetchAllAcademicYears,
    useRemoveAcademicYear,
    useUpdateAcademicYear,
    type AcademicYear as AcademicYearType,
} from "../../../hooks/useAcademicYear"

const ITEMS_PER_PAGE = 10

interface FormState {
    name: string
    start_date: Date | null
    end_date: Date | null
}

const initialFormState: FormState = {
    name: "",
    start_date: null,
    end_date: null,
}

const getErrorMessage = (err: any, fallback: string) =>
    err?.response?.data?.message || err?.message || fallback

// "2026-02-01" or "2026-02-01T00:00:00Z" -> local Date (no timezone shift)
const parseApiDate = (value?: string | null): Date | null => {
    if (!value) return null
    const [y, m, d] = value.slice(0, 10).split("-").map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
}

// Date -> "YYYY-MM-DD" using local date parts
const toApiDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

const toDisplayDate = (value?: string | null) => {
    const date = parseApiDate(value)
    return date ? date.toLocaleDateString("en-GB") : "-"
}

const AcademicYear = () => {
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")

    const { data, isLoading } = useFetchAllAcademicYears()
    const addMutation = useAddAcademicYear()
    const updateMutation = useUpdateAcademicYear()
    const removeMutation = useRemoveAcademicYear()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editing, setEditing] = useState<AcademicYearType | null>(null)
    const [formData, setFormData] = useState<FormState>(initialFormState)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [deleteTarget, setDeleteTarget] = useState<AcademicYearType | null>(null)

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "year", title: "Year" },
        { key: "title", title: "Title" },
        { key: "starting_date", title: "Starting Date" },
        { key: "ending_date", title: "Ending Date" },
    ]

    const rawList: AcademicYearType[] = useMemo(() => (Array.isArray(data) ? data : []), [data])

    const filteredList = useMemo(() => {
        const q = searchTerm.trim().toLowerCase()
        if (!q) return rawList
        return rawList.filter((item) =>
            (item.name || "").toLowerCase().includes(q) ||
            (item.start_date || "").slice(0, 4).includes(q)
        )
    }, [rawList, searchTerm])

    const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE))

    const tableData = filteredList
        .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
        .map((item, index) => ({
            id: item.id,
            sl: (page - 1) * ITEMS_PER_PAGE + index + 1,
            year: parseApiDate(item.start_date)?.getFullYear() ?? "-",
            title: item.name || "-",
            starting_date: toDisplayDate(item.start_date),
            ending_date: toDisplayDate(item.end_date),
            full_data: item,
        }))

    const handleOpenAddModal = () => {
        setEditing(null)
        setFormData(initialFormState)
        setErrors({})
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (item: AcademicYearType) => {
        setEditing(item)
        setFormData({
            name: item.name || "",
            start_date: parseApiDate(item.start_date),
            end_date: parseApiDate(item.end_date),
        })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditing(null)
        setFormData(initialFormState)
        setErrors({})
    }

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }))
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}
        if (!formData.name.trim()) newErrors.name = "Title is required"
        if (!formData.start_date) newErrors.start_date = "Starting date is required"
        if (!formData.end_date) newErrors.end_date = "Ending date is required"
        if (formData.start_date && formData.end_date && formData.end_date <= formData.start_date) {
            newErrors.end_date = "Ending date must be after starting date"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!validateForm()) return

        const payload = {
            name: formData.name.trim(),
            start_date: toApiDate(formData.start_date as Date),
            end_date: toApiDate(formData.end_date as Date),
        }

        try {
            if (editing) {
                await updateMutation.mutateAsync({ id: editing.id, ...payload })
                toast.success("Academic year updated successfully")
            } else {
                await addMutation.mutateAsync(payload)
                toast.success("Academic year added successfully")
            }
            handleCloseModal()
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to save academic year"))
        }
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        try {
            await removeMutation.mutateAsync(deleteTarget.id)
            toast.success("Academic year deleted successfully")
            setDeleteTarget(null)
            if (tableData.length === 1 && page > 1) setPage(page - 1)
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to delete academic year"))
        }
    }

    const isSaving = addMutation.isPending || updateMutation.isPending

    if (isLoading && !data) {
        return <LoadingOverlay isLoading={true} />
    }

    return (
        <div className="page_wrapper" >
            <div className="assign_class_teacher_page" >
                {isModalOpen && (
                    <PopupScreen overflow="visible" title={editing ? "Edit Academic Year" : "Add Academic Year"} onClick={handleCloseModal}>
                        <div className="popup_body" >
                            <div className="fields_wrapper">
                                <div className="body_section"></div>
                                <div className="body_section">
                                    <InputField type="text"
                                        label="Title *"
                                        placeHolder="e.g. 2026 - 2027"
                                        value={formData.name}
                                        error={errors.name}
                                        onChange={(e: any) => setField("name", e?.target ? e.target.value : e)}
                                    />
                                </div>
                                <div className="body_section">
                                    <InputField
                                        type="date"
                                        label="Starting Date *"
                                        placeHolder="Select starting date"
                                        value={formData.start_date}
                                        error={errors.start_date}
                                        onChange={(date: Date | null) => setField("start_date", date)}
                                    />
                                    <InputField
                                        type="date"
                                        label="Ending Date *"
                                        placeHolder="Select ending date"
                                        value={formData.end_date}
                                        error={errors.end_date}
                                        onChange={(date: Date | null) => setField("end_date", date)}
                                    />
                                </div>
                            </div>
                            <div className="buttons">
                                <SecondaryButton
                                    title={editing ? "Cancel" : "Reset"}
                                    onClick={editing
                                        ? handleCloseModal
                                        : () => {
                                            setFormData(initialFormState)
                                            setErrors({})
                                        }}
                                />
                                <PrimaryButton
                                    title={isSaving ? "Saving..." : editing ? "Update" : "Save"}
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    isLoading={isSaving}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                {deleteTarget && (
                    <PopupScreen title="Delete Academic Year" onClick={() => setDeleteTarget(null)}>
                        <div className="popup_body">
                            <div className="body_section">
                                <p>
                                    Are you sure you want to delete academic year <strong>"{deleteTarget.name}"</strong>?
                                </p>
                            </div>
                            <div className="buttons">
                                <SecondaryButton
                                    title="Cancel"
                                    onClick={() => setDeleteTarget(null)}
                                    disable={removeMutation.isPending}
                                />
                                <PrimaryButton
                                    title={removeMutation.isPending ? "Deleting..." : "Delete"}
                                    onClick={handleConfirmDelete}
                                    disabled={removeMutation.isPending}
                                    isLoading={removeMutation.isPending}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper
                    isAddButton
                    onClick={handleOpenAddModal}
                    isSearchBar
                    searchValue={searchTerm}
                    searchOnchange={(val) => {
                        setSearchTerm(val)
                        setPage(1)
                    }}
                    title="Academic Year List"
                >
                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                        emptyMessage="No academic years found"
                        actions={(row) => (
                            <div className="actions">
                                <button type="button" className="hvr_zm_out" title="Edit" onClick={() => handleOpenEditModal(row.full_data)}>
                                    <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button type="button" className="hvr_zm_out" title="Delete" onClick={() => setDeleteTarget(row.full_data)}>
                                    <img src="/svgs/delete.svg" alt="Delete" />
                                </button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default AcademicYear
