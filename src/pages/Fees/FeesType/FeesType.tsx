import React, { useMemo, useState } from "react"
import { toast } from "sonner"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import LoadingOverlay from "../../../components/Loadingoverlay"
import {
    useFetchAllFeeTypes,
    useAddFeeType,
    useUpdateFeeType,
    useRemoveFeeType,
    type FeeType,
} from "../../../hooks/useFeeType"
import { useFetchAllFeeGroups } from "../../../hooks/useFeeGroup"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear"

const initialFormState = {
    name: "",
    description: "",
    fee_group_id: "" as string | number,
    academic_year_id: "" as string | number,
}

const ITEMS_PER_PAGE = 10

const toList = (res: any): any[] => {
    if (Array.isArray(res?.data)) return res.data
    if (Array.isArray(res)) return res
    return []
}

const getErrorMessage = (err: any, fallback: string) =>
    err?.response?.data?.message || err?.message || fallback

const FeesType = () => {
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")

    const { data: feeTypes, isLoading } = useFetchAllFeeTypes()
    const { data: feeGroups } = useFetchAllFeeGroups(1)
    const { data: academicYears } = useFetchAllAcademicYears()

    const addMutation = useAddFeeType()
    const updateMutation = useUpdateFeeType()
    const removeMutation = useRemoveFeeType()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editing, setEditing] = useState<FeeType | null>(null)
    const [formData, setFormData] = useState(initialFormState)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [deleteTarget, setDeleteTarget] = useState<FeeType | null>(null)

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "name", title: "Name" },
        { key: "fee_group", title: "Fee Group" },
        { key: "academic_year", title: "Academic Year" },
        { key: "description", title: "Description" },
    ]

    const feeGroupOptions = useMemo(
        () => toList(feeGroups).map((g: any) => ({ label: g.name, value: g.id })),
        [feeGroups]
    )

    const academicYearOptions = useMemo(() => {
        const list = Array.isArray(academicYears) ? academicYears : []
        return list.map((y: any) => ({ label: y.name, value: y.id }))
    }, [academicYears])

    const currentAcademicYearId = useMemo(() => {
        const list = Array.isArray(academicYears) ? academicYears : []
        return list.find((y: any) => Number(y.is_current) === 1)?.id ?? ""
    }, [academicYears])

    const labelFor = (options: { label: string; value: any }[], value: any) =>
        options.find((o) => String(o.value) === String(value))?.label

    const rawList: FeeType[] = useMemo(() => toList(feeTypes), [feeTypes])

    const filteredList = useMemo(() => {
        const q = searchTerm.trim().toLowerCase()
        if (!q) return rawList
        return rawList.filter((item) =>
            (item.name || "").toLowerCase().includes(q) ||
            (item.description || "").toLowerCase().includes(q) ||
            (item.fee_group?.name || labelFor(feeGroupOptions, item.fee_group_id) || "").toLowerCase().includes(q)
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawList, searchTerm, feeGroupOptions])

    const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE))

    const tableData = filteredList
        .slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
        .map((item, index) => ({
            id: item.id,
            sl: (page - 1) * ITEMS_PER_PAGE + index + 1,
            name: item.name || "-",
            fee_group: item.fee_group?.name || labelFor(feeGroupOptions, item.fee_group_id) || "-",
            academic_year: item.academic_year?.name || labelFor(academicYearOptions, item.academic_year_id) || "-",
            description: item.description || "-",
            full_data: item,
        }))

    const handleOpenAddModal = () => {
        setEditing(null)
        setFormData({ ...initialFormState, academic_year_id: currentAcademicYearId })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (item: FeeType) => {
        setEditing(item)
        setFormData({
            name: item.name || "",
            description: item.description || "",
            fee_group_id: item.fee_group_id ?? item.fee_group?.id ?? "",
            academic_year_id: item.academic_year_id ?? item.academic_year?.id ?? "",
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

    const setField = (key: keyof typeof initialFormState, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }))
    }

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}
        if (!formData.name.trim()) newErrors.name = "Name is required"
        if (!formData.fee_group_id) newErrors.fee_group_id = "Fee group is required"
        if (!formData.academic_year_id) newErrors.academic_year_id = "Academic year is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!validateForm()) return

        const payload = {
            fee_group_id: formData.fee_group_id ? Number(formData.fee_group_id) : null,
            name: formData.name.trim(),
            description: formData.description.trim(),
            academic_year_id: formData.academic_year_id ? Number(formData.academic_year_id) : null,
        }

        try {
            if (editing) {
                await updateMutation.mutateAsync({ id: editing.id, ...payload })
                toast.success("Fee type updated successfully")
            } else {
                await addMutation.mutateAsync(payload)
                toast.success("Fee type added successfully")
            }
            handleCloseModal()
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to save fee type"))
        }
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        try {
            await removeMutation.mutateAsync(deleteTarget.id)
            toast.success("Fee type deleted successfully")
            setDeleteTarget(null)
            if (tableData.length === 1 && page > 1) setPage(page - 1)
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to delete fee type"))
        }
    }

    const isSaving = addMutation.isPending || updateMutation.isPending

    if (isLoading && !feeTypes) {
        return <LoadingOverlay isLoading={true} />
    }

    return (
        <div className="page_wrapper" >
            <div className="student_list" >
                {isModalOpen && (
                    <PopupScreen title={editing ? "Edit Fee Type" : "Add Fee Type"} onClick={handleCloseModal} >
                        <div className="popup_body" >
                            <div className="body_section" >
                                <InputField
                                    type="text"
                                    label="Name *"
                                    placeHolder="Enter name"
                                    value={formData.name}
                                    error={errors.name}
                                    onChange={(e: any) => setField("name", e?.target ? e.target.value : e)}
                                />
                                <CustomSelect
                                    label="Fee Group *"
                                    placeholder="Select fee group"
                                    value={formData.fee_group_id}
                                    options={feeGroupOptions}
                                    error={errors.fee_group_id}
                                    onChange={(val) => setField("fee_group_id", val)}
                                />
                            </div>

                            <div className="body_section" >
                                <CustomSelect
                                    label="Academic Year *"
                                    placeholder="Select academic year"
                                    value={formData.academic_year_id}
                                    options={academicYearOptions}
                                    error={errors.academic_year_id}
                                    onChange={(val) => setField("academic_year_id", val)}
                                />
                                <InputField
                                    type="text"
                                    label="Description"
                                    placeHolder="Enter description"
                                    value={formData.description}
                                    onChange={(e: any) => setField("description", e?.target ? e.target.value : e)}
                                />
                            </div>

                            <div className="buttons">
                                <SecondaryButton
                                    title={editing ? "Cancel" : "Reset"}
                                    onClick={editing
                                        ? handleCloseModal
                                        : () => {
                                            setFormData({ ...initialFormState, academic_year_id: currentAcademicYearId })
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
                    <PopupScreen title="Delete Fee Type" onClick={() => setDeleteTarget(null)} >
                        <div className="popup_body" >
                            <div className="body_section" >
                                <p>
                                    Are you sure you want to delete fee type <strong>"{deleteTarget.name}"</strong>?
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
                    addButtonTitle="Add Fees Type"
                    isSearchBar
                    searchValue={searchTerm}
                    searchOnchange={(val) => {
                        setSearchTerm(val)
                        setPage(1)
                    }}
                    title="Fees Type"
                >
                    <DataTable
                        columns={columns}
                        data={tableData}
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
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

export default FeesType;
