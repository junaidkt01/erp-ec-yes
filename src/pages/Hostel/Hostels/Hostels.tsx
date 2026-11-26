import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
  useFetchAllDormitories,
  useAddDormitory,
  useUpdateDormitory,
  useDeleteDormitory,
  type DormitoryItem,
} from "../../../hooks/useHostel";

const initialFormState = {
  name: "",
  type: "Boys",
  address: "",
  intake: "",
  description: "",
};

const typeOptions = [
  { label: "Boys", value: "Boys" },
  { label: "Girls", value: "Girls" },
  { label: "Mixed", value: "Mixed" },
];

const ITEMS_PER_PAGE = 10;

const Hostels: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Dormitory API queries & mutations
  const { data: apiData } = useFetchAllDormitories({
    page,
    per_page: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
  });
  const addDormitoryMutation = useAddDormitory();
  const updateDormitoryMutation = useUpdateDormitory();
  const deleteDormitoryMutation = useDeleteDormitory();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DormitoryItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DormitoryItem | null>(null);

  // Extract raw list
  const rawList: DormitoryItem[] = useMemo(() => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;
    if (Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData.data?.data)) return apiData.data.data;
    return [];
  }, [apiData]);

  // Client-side search filtering
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item) => {
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchType = (item.type || "").toLowerCase().includes(q);
      const matchAddress = (item.address || "").toLowerCase().includes(q);
      const matchIntake = String(item.intake || "").toLowerCase().includes(q);
      return matchName || matchType || matchAddress || matchIntake;
    });
  }, [rawList, searchTerm]);

  // Pagination calculation
  const totalPages = useMemo(() => {
    if (apiData?.data?.last_page) return apiData.data.last_page;
    if (apiData?.last_page) return apiData.last_page;
    if (apiData?.meta?.last_page) return apiData.meta.last_page;
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [apiData, filteredList.length]);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "name", title: "Dormitory Name" },
    { key: "type", title: "Type" },
    { key: "address", title: "Address" },
    { key: "intake", title: "Intake" },
  ];

  // Paginated table data
  const tableData = useMemo(() => {
    const isBackendPaginated = Boolean(
      apiData?.data?.last_page || apiData?.last_page || apiData?.meta?.last_page
    );

    const itemsToDisplay = isBackendPaginated
      ? filteredList
      : filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const startIndex = (page - 1) * ITEMS_PER_PAGE;

    return itemsToDisplay.map((item, index) => ({
      id: item.id,
      sl: startIndex + index + 1,
      name: item.name || "-",
      type: item.type || "-",
      address: item.address || "-",
      intake: item.intake !== undefined && item.intake !== null ? item.intake : "-",
      full_data: item,
    }));
  }, [apiData, filteredList, page]);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: DormitoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      type: item.type || "Boys",
      address: item.address || "",
      intake: String(item.intake ?? ""),
      description: item.description || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Dormitory name is required";
    }
    if (!formData.type) {
      newErrors.type = "Please select a type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit create or update
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingItem) {
        await updateDormitoryMutation.mutateAsync({
          id: editingItem.id,
          name: formData.name.trim(),
          type: formData.type,
          address: formData.address.trim() || undefined,
          intake: formData.intake ? Number(formData.intake) || formData.intake : undefined,
          description: formData.description.trim() || undefined,
        });
        toast.success("Dormitory updated successfully");
      } else {
        await addDormitoryMutation.mutateAsync({
          name: formData.name.trim(),
          type: formData.type,
          address: formData.address.trim() || undefined,
          intake: formData.intake ? Number(formData.intake) || formData.intake : undefined,
          description: formData.description.trim() || undefined,
        });
        toast.success("Dormitory created successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save dormitory";
      toast.error(msg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (item: DormitoryItem) => {
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDormitoryMutation.mutateAsync(deleteTarget.id);
      toast.success("Dormitory deleted successfully");
      setDeleteTarget(null);

      if (page > 1 && tableData.length <= 1) {
        setPage(page - 1);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete dormitory";
      toast.error(msg);
    }
  };

  return (
    <div className="page_wrapper">
      <div className="hostels_page">
        {/* Create / Edit Dormitory Popup */}
        {isModalOpen && (
          <PopupScreen
            className="dormitory_popup_modal"
            title={editingItem ? "Edit Dormitory" : "Add Dormitory"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="dormitory_form_wrapper" style={{ display: "grid", gap: "16px" }}>
                {/* Row 1: Name & Type */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <InputField
                    type="text"
                    label="Dormitory Name"
                    placeHolder="Enter dormitory name"
                    value={formData.name}
                    error={errors.name}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, name: val }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                  />

                  <CustomSelect
                    label="Type"
                    placeholder="Select type"
                    options={typeOptions}
                    value={formData.type}
                    error={errors.type}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, type: String(val) }));
                      if (errors.type) setErrors((prev) => ({ ...prev, type: "" }));
                    }}
                  />
                </div>

                {/* Row 2: Address & Intake */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <InputField
                    type="text"
                    label="Address"
                    placeHolder="Enter address"
                    value={formData.address}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, address: val }));
                    }}
                  />

                  <InputField
                    type="number"
                    label="Intake"
                    placeHolder="Enter intake"
                    value={formData.intake}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, intake: val }));
                    }}
                  />
                </div>

                {/* Row 3: Description */}
                <div>
                  <InputField
                    type="text"
                    label="Description"
                    placeHolder="Enter description"
                    value={formData.description}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, description: val }));
                    }}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingItem ? "Cancel" : "Reset"}
                  onClick={
                    editingItem
                      ? handleCloseModal
                      : () => {
                          setFormData(initialFormState);
                          setErrors({});
                        }
                  }
                />
                <PrimaryButton
                  title={
                    addDormitoryMutation.isPending || updateDormitoryMutation.isPending
                      ? "Saving..."
                      : editingItem
                      ? "Update Dormitory"
                      : "Save Dormitory"
                  }
                  icon={<Save size={16} />}
                  onClick={handleSubmit}
                  disabled={addDormitoryMutation.isPending || updateDormitoryMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Popup */}
        {deleteTarget && (
          <PopupScreen
            className="dormitory_popup_modal"
            title="Delete Dormitory"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>
                  Are you sure you want to delete dormitory{" "}
                  <strong>"{deleteTarget.name}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton onClick={handleCancelDelete} title="Cancel" />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title={deleteDormitoryMutation.isPending ? "Deleting..." : "Delete"}
                  disabled={deleteDormitoryMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Dormitory List Table */}
        <TableWrapper
          title="Dormitory List"
          addButtonTitle="Add Dormitory"
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          onClick={handleOpenAddModal}
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            actions={(row) => (
              <div className="actions">
                <button
                  type="button"
                  className="edit_btn hvr_zm_out"
                  title="Edit Dormitory"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Dormitory"
                  onClick={() => handleDeleteClick(row.full_data)}
                >
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

export default Hostels;
