import React, { useMemo, useState } from "react"
import { toast } from "sonner"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import InputCheckbox from "../../../components/InputCheckbox/InputCheckbox"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import LoadingOverlay from "../../../components/Loadingoverlay"
import {
    useFetchAllFeeGroups,
    useAddFeeGroup,
    useUpdateFeeGroup,
    useRemoveFeeGroup,
    type FeeGroup,
} from "../../../hooks/useFeeGroup"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear"
import { useAuth } from "../../../auth/useAuth"

const initialFormState = {
    name: "",
    description: "",
    academic_year_id: "" as string | number,
    is_active: true,
}

const ITEMS_PER_PAGE = 10

const getErrorMessage = (err: any, fallback: string) =>
    err?.response?.data?.message || err?.message || fallback

const FeesGroup = () => {
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")

    const { data: apiResponse, isLoading } = useFetchAllFeeGroups(page)
    const { data: academicYears } = useFetchAllAcademicYears()
    const { data: auth } = useAuth()

    const addMutation = useAddFeeGroup()
    const updateMutation = useUpdateFeeGroup()
    const removeMutation = useRemoveFeeGroup()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editing, setEditing] = useState<FeeGroup | null>(null)
    const [formData, setFormData] = useState(initialFormState)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [deleteTarget, setDeleteTarget] = useState<FeeGroup | null>(null)

    const branchId: number | null = auth?.user?.branch_id ?? null

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "name", title: "Name" },
        { key: "description", title: "Description" },
        { key: "academic_year", title: "Academic Year" },
        { key: "status", title: "Status" },
    ]

    const academicYearOptions = useMemo(() => {
        const list = Array.isArray(academicYears) ? academicYears : []
        return list.map((y: any) => ({ label: y.name, value: y.id }))
    }, [academicYears])

    const currentAcademicYearId = useMemo(() => {
        const list = Array.isArray(academicYears) ? academicYears : []
        return list.find((y: any) => Number(y.is_current) === 1)?.id ?? ""
    }, [academicYears])

    // API may return a plain array or a paginated object
    const rawList: FeeGroup[] = useMemo(() => {
        if (Array.isArray(apiResponse?.data)) return apiResponse.data
        if (Array.isArray(apiResponse)) return apiResponse
        return []
    }, [apiResponse])

    const filteredList = useMemo(() => {
        const q = searchTerm.trim().toLowerCase()
        if (!q) return rawList
        return rawList.filter((item) =>
            (item.name || "").toLowerCase().includes(q) ||
            (item.description || "").toLowerCase().includes(q)
        )
    }, [rawList, searchTerm])

    const backendLastPage = apiResponse?.last_page || apiResponse?.meta?.last_page
    const perPage = Number(apiResponse?.per_page || apiResponse?.meta?.per_page || ITEMS_PER_PAGE)

    const totalPages = backendLastPage
        ? Number(backendLastPage)
        : Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE))

    const yearName = (item: FeeGroup) =>
        item.academic_year?.name ||
        academicYearOptions.find((y) => Number(y.value) === Number(item.academic_year_id))?.label ||
        "-"

    const tableData = useMemo(() => {
        const list = backendLastPage
            ? filteredList
            : filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
        const start = (page - 1) * (backendLastPage ? perPage : ITEMS_PER_PAGE)

        return list.map((item, index) => ({
            id: item.id,
            sl: start + index + 1,
            name: item.name || "-",
            description: item.description || "-",
            academic_year: yearName(item),
            status: item.is_active === undefined || Boolean(Number(item.is_active)) ? "Active" : "Inactive",
            full_data: item,
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredList, page, backendLastPage, perPage, academicYearOptions])

    const handleOpenAddModal = () => {
        setEditing(null)
        setFormData({ ...initialFormState, academic_year_id: currentAcademicYearId })
        setErrors({})
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (item: FeeGroup) => {
        setEditing(item)
        setFormData({
            name: item.name || "",
            description: item.description || "",
            academic_year_id: item.academic_year_id ?? item.academic_year?.id ?? "",
            is_active: item.is_active === undefined ? true : Boolean(Number(item.is_active)),
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

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}
        if (!formData.name.trim()) newErrors.name = "Name is required"
        if (!formData.academic_year_id) newErrors.academic_year_id = "Academic year is required"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!validateForm()) return

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            academic_year_id: formData.academic_year_id ? Number(formData.academic_year_id) : null,
            branch_id: editing?.branch_id ?? branchId,
            is_active: formData.is_active,
        }

        try {
            if (editing) {
                await updateMutation.mutateAsync({ id: editing.id, ...payload })
                toast.success("Fee group updated successfully")
            } else {
                await addMutation.mutateAsync(payload)
                toast.success("Fee group added successfully")
            }
            handleCloseModal()
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to save fee group"))
        }
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        try {
            await removeMutation.mutateAsync(deleteTarget.id)
            toast.success("Fee group deleted successfully")
            setDeleteTarget(null)
        } catch (err) {
            toast.error(getErrorMessage(err, "Failed to delete fee group"))
        }
    }

    const isSaving = addMutation.isPending || updateMutation.isPending

    if (isLoading && !apiResponse) {
        return <LoadingOverlay isLoading={true} />
    }

    return (
        <div className="page_wrapper" >
            <div className="student_list" >
                {isModalOpen && (
                    <PopupScreen title={editing ? "Edit Fee Group" : "Add Fee Group"} onClick={handleCloseModal} >
                        <div className="popup_body" >
                            <div className="body_section" >
                                <InputField
                                    type="text"
                                    label="Name *"
                                    placeHolder="Enter name"
                                    value={formData.name}
                                    error={errors.name}
                                    onChange={(e: any) => {
                                        const val = e?.target ? e.target.value : e
                                        setFormData((prev) => ({ ...prev, name: val }))
                                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                                    }}
                                />
                                <InputField
                                    type="text"
                                    label="Description"
                                    placeHolder="Enter description"
                                    value={formData.description}
                                    onChange={(e: any) => {
                                        const val = e?.target ? e.target.value : e
                                        setFormData((prev) => ({ ...prev, description: val }))
                                    }}
                                />
                            </div>

                            <div className="body_section" >
                                <CustomSelect
                                    label="Academic Year *"
                                    placeholder="Select academic year"
                                    value={formData.academic_year_id}
                                    options={academicYearOptions}
                                    error={errors.academic_year_id}
                                    onChange={(val) => {
                                        setFormData((prev) => ({ ...prev, academic_year_id: val }))
                                        if (errors.academic_year_id) setErrors((prev) => ({ ...prev, academic_year_id: "" }))
                                    }}
                                />
                                <InputCheckbox
                                    label="Active"
                                    checked={formData.is_active}
                                    onChange={() => setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))}
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
                    <PopupScreen title="Delete Fee Group" onClick={() => setDeleteTarget(null)} >
                        <div className="popup_body" >
                            <div className="body_section" >
                                <p>
                                    Are you sure you want to delete fee group <strong>"{deleteTarget.name}"</strong>?
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
                    addButtonTitle="Add Fee group"
                    title="Fee groups"
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

export default FeesGroup;
