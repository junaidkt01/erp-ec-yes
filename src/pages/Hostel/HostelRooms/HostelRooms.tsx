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
  useFetchAllRoomTypes,
  useFetchAllDormitoryRooms,
  useAddDormitoryRoom,
  useUpdateDormitoryRoom,
  useDeleteDormitoryRoom,
  type DormitoryRoomItem,
} from "../../../hooks/useHostel";

const initialFormState = {
  dormitory_id: "",
  room_number: "",
  room_type_id: "",
  number_of_bed: "",
  cost_per_bed: "",
  description: "",
};

const ITEMS_PER_PAGE = 10;

const HostelRooms: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Room list API
  const { data: apiData } = useFetchAllDormitoryRooms({
    page,
    per_page: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
  });

  // Dormitories and Room Types for dropdown selection
  const { data: dormsData } = useFetchAllDormitories({ per_page: 100 });
  const { data: roomTypesData } = useFetchAllRoomTypes({ per_page: 100 });

  const addRoomMutation = useAddDormitoryRoom();
  const updateRoomMutation = useUpdateDormitoryRoom();
  const deleteRoomMutation = useDeleteDormitoryRoom();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DormitoryRoomItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<DormitoryRoomItem | null>(null);

  // Formatted dormitory options
  const dormitoryOptions = useMemo(() => {
    const raw: any[] = Array.isArray(dormsData)
      ? dormsData
      : Array.isArray(dormsData?.data)
      ? dormsData.data
      : Array.isArray(dormsData?.data?.data)
      ? dormsData.data.data
      : [];

    return raw.map((d) => ({
      label: d.name || "Dormitory",
      value: d.id,
    }));
  }, [dormsData]);

  // Formatted room type options
  const roomTypeOptions = useMemo(() => {
    const raw: any[] = Array.isArray(roomTypesData)
      ? roomTypesData
      : Array.isArray(roomTypesData?.data)
      ? roomTypesData.data
      : Array.isArray(roomTypesData?.data?.data)
      ? roomTypesData.data.data
      : [];

    return raw.map((t) => ({
      label: t.name || "Room Type",
      value: t.id,
    }));
  }, [roomTypesData]);

  // Extract raw list
  const rawList: DormitoryRoomItem[] = useMemo(() => {
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
      const dormName = (item.dormitory?.name || item.dormitory_name || "").toLowerCase();
      const roomNum = String(item.room_number || "").toLowerCase();
      const typeName = (item.room_type?.name || item.room_type_name || "").toLowerCase();
      const bedCount = String(item.number_of_bed || "").toLowerCase();
      const cost = String(item.cost_per_bed || "").toLowerCase();
      return (
        dormName.includes(q) ||
        roomNum.includes(q) ||
        typeName.includes(q) ||
        bedCount.includes(q) ||
        cost.includes(q)
      );
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
    { key: "dormitory", title: "Dormitory" },
    { key: "room_number", title: "Room Number" },
    { key: "room_type", title: "Room Type" },
    { key: "number_of_bed", title: "No. of Bed" },
    { key: "cost_per_bed", title: "Cost Per of Bed" },
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

    return itemsToDisplay.map((item, index) => {
      const dormName =
        item.dormitory?.name ||
        dormitoryOptions.find((d) => String(d.value) === String(item.dormitory_id))?.label ||
        "-";

      const typeName =
        item.room_type?.name ||
        roomTypeOptions.find((t) => String(t.value) === String(item.room_type_id))?.label ||
        "-";

      return {
        id: item.id,
        sl: startIndex + index + 1,
        dormitory: dormName,
        room_number: item.room_number || "-",
        room_type: typeName,
        number_of_bed: item.number_of_bed ?? "-",
        cost_per_bed: item.cost_per_bed !== undefined && item.cost_per_bed !== null ? `₹ ${item.cost_per_bed}` : "-",
        full_data: item,
      };
    });
  }, [apiData, filteredList, page, dormitoryOptions, roomTypeOptions]);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: DormitoryRoomItem) => {
    setEditingItem(item);
    setFormData({
      dormitory_id: String(item.dormitory_id || item.dormitory?.id || ""),
      room_number: item.room_number || "",
      room_type_id: String(item.room_type_id || item.room_type?.id || ""),
      number_of_bed: String(item.number_of_bed ?? ""),
      cost_per_bed: String(item.cost_per_bed ?? ""),
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
    if (!formData.dormitory_id) {
      newErrors.dormitory_id = "Please select a dormitory";
    }
    if (!formData.room_number.trim()) {
      newErrors.room_number = "Room number is required";
    }
    if (!formData.room_type_id) {
      newErrors.room_type_id = "Please select room type";
    }
    if (!formData.number_of_bed) {
      newErrors.number_of_bed = "Number of bed is required";
    }
    if (!formData.cost_per_bed) {
      newErrors.cost_per_bed = "Cost per bed is required";
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
        await updateRoomMutation.mutateAsync({
          id: editingItem.id,
          dormitory_id: Number(formData.dormitory_id) || formData.dormitory_id,
          room_number: formData.room_number.trim(),
          room_type_id: Number(formData.room_type_id) || formData.room_type_id,
          number_of_bed: Number(formData.number_of_bed),
          cost_per_bed: Number(formData.cost_per_bed),
          description: formData.description.trim() || undefined,
        });
        toast.success("Dormitory room updated successfully");
      } else {
        await addRoomMutation.mutateAsync({
          dormitory_id: Number(formData.dormitory_id) || formData.dormitory_id,
          room_number: formData.room_number.trim(),
          room_type_id: Number(formData.room_type_id) || formData.room_type_id,
          number_of_bed: Number(formData.number_of_bed),
          cost_per_bed: Number(formData.cost_per_bed),
          description: formData.description.trim() || undefined,
        });
        toast.success("Dormitory room added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save room";
      toast.error(msg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (item: DormitoryRoomItem) => {
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRoomMutation.mutateAsync(deleteTarget.id);
      toast.success("Dormitory room deleted successfully");
      setDeleteTarget(null);

      if (page > 1 && tableData.length <= 1) {
        setPage(page - 1);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete room";
      toast.error(msg);
    }
  };

  return (
    <div className="page_wrapper">
      <div className="hostel_rooms_page">
        {/* Create / Edit Dormitory Room Popup */}
        {isModalOpen && (
          <PopupScreen
            className="room_popup_modal"
            title={editingItem ? "Edit Dormitory Room" : "Add Route"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="room_form_wrapper" style={{ display: "grid", gap: "16px" }}>
                {/* Row 1: Dormitory & Room Number */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <CustomSelect
                    label="Dormitory"
                    placeholder="Select dormitory"
                    options={dormitoryOptions}
                    value={formData.dormitory_id}
                    error={errors.dormitory_id}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, dormitory_id: String(val) }));
                      if (errors.dormitory_id) setErrors((prev) => ({ ...prev, dormitory_id: "" }));
                    }}
                  />

                  <InputField
                    type="text"
                    label="Room Number"
                    placeHolder="Enter room number"
                    value={formData.room_number}
                    error={errors.room_number}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, room_number: val }));
                      if (errors.room_number) setErrors((prev) => ({ ...prev, room_number: "" }));
                    }}
                  />
                </div>

                {/* Row 2: Type, Number of Bed, Cost Per Bed */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <CustomSelect
                    label="Type"
                    placeholder="Select room type"
                    options={roomTypeOptions}
                    value={formData.room_type_id}
                    error={errors.room_type_id}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, room_type_id: String(val) }));
                      if (errors.room_type_id) setErrors((prev) => ({ ...prev, room_type_id: "" }));
                    }}
                  />

                  <InputField
                    type="number"
                    label="Number of Bed"
                    placeHolder="Enter number of bed"
                    value={formData.number_of_bed}
                    error={errors.number_of_bed}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, number_of_bed: val }));
                      if (errors.number_of_bed) setErrors((prev) => ({ ...prev, number_of_bed: "" }));
                    }}
                  />

                  <InputField
                    type="number"
                    label="Cost Per Bed"
                    placeHolder="Enter cost"
                    value={formData.cost_per_bed}
                    error={errors.cost_per_bed}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, cost_per_bed: val }));
                      if (errors.cost_per_bed) setErrors((prev) => ({ ...prev, cost_per_bed: "" }));
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
                    addRoomMutation.isPending || updateRoomMutation.isPending
                      ? "Saving..."
                      : editingItem
                      ? "Update Room"
                      : "Save Room"
                  }
                  icon={<Save size={16} />}
                  onClick={handleSubmit}
                  disabled={addRoomMutation.isPending || updateRoomMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Popup */}
        {deleteTarget && (
          <PopupScreen
            className="room_popup_modal"
            title="Delete Room"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>
                  Are you sure you want to delete room number{" "}
                  <strong>"{deleteTarget.room_number}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton onClick={handleCancelDelete} title="Cancel" />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title={deleteRoomMutation.isPending ? "Deleting..." : "Delete"}
                  disabled={deleteRoomMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Dormitory Room List Table */}
        <TableWrapper
          title="Dormitory Rooms"
          addButtonTitle="Add Dormitory Rooms"
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
                  title="Edit Room"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Room"
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

export default HostelRooms;
