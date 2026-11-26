import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
  useFetchAllRoomTypes,
  useAddRoomType,
  useUpdateRoomType,
  useDeleteRoomType,
  type RoomTypeItem,
} from "../../../hooks/useHostel";

const initialFormState = {
  name: "",
  description: "",
};

const ITEMS_PER_PAGE = 10;

const RoomType: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Room type API queries and mutations
  const { data: apiData } = useFetchAllRoomTypes({
    page,
    per_page: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
  });
  const addRoomTypeMutation = useAddRoomType();
  const updateRoomTypeMutation = useUpdateRoomType();
  const deleteRoomTypeMutation = useDeleteRoomType();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoomTypeItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<RoomTypeItem | null>(null);

  // Extract raw list
  const rawList: RoomTypeItem[] = useMemo(() => {
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
      const matchDesc = (item.description || "").toLowerCase().includes(q);
      return matchName || matchDesc;
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
    { key: "name", title: "Room Type" },
    { key: "description", title: "Description" },
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
      description: item.description || "-",
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
  const handleOpenEditModal = (item: RoomTypeItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
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

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Room type name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingItem) {
        await updateRoomTypeMutation.mutateAsync({
          id: editingItem.id,
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        toast.success("Room type updated successfully");
      } else {
        await addRoomTypeMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        toast.success("Room type added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save room type";
      toast.error(msg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (item: RoomTypeItem) => {
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoomTypeMutation.mutateAsync(deleteTarget.id);
      toast.success("Room type deleted successfully");
      setDeleteTarget(null);

      if (page > 1 && tableData.length <= 1) {
        setPage(page - 1);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete room type";
      toast.error(msg);
    }
  };

  return (
    <div className="page_wrapper">
      <div className="room_type_page">
        {/* Create / Edit Room Type Popup */}
        {isModalOpen && (
          <PopupScreen
            className="room_type_popup_modal"
            title={editingItem ? "Edit Room Type" : "Add Room Type"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="form_fields_wrapper" style={{ display: "grid", gap: "16px" }}>
                <InputField
                  type="text"
                  label="Room Type"
                  placeHolder="Enter room type"
                  value={formData.name}
                  error={errors.name}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, name: val }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                />

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
                    addRoomTypeMutation.isPending || updateRoomTypeMutation.isPending
                      ? "Saving..."
                      : editingItem
                      ? "Update Room Type"
                      : "Save Room Type"
                  }
                  icon={<Save size={16} />}
                  onClick={handleSubmit}
                  disabled={addRoomTypeMutation.isPending || updateRoomTypeMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Popup */}
        {deleteTarget && (
          <PopupScreen
            className="room_type_popup_modal"
            title="Delete Room Type"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>
                  Are you sure you want to delete room type{" "}
                  <strong>"{deleteTarget.name}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton onClick={handleCancelDelete} title="Cancel" />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title={deleteRoomTypeMutation.isPending ? "Deleting..." : "Delete"}
                  disabled={deleteRoomTypeMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Room Type List Table */}
        <TableWrapper
          title="Room Type"
          addButtonTitle="Add Room Type"
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
                  title="Edit Room Type"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Room Type"
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

export default RoomType;
