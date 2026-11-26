import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import { useFetchAllStaff } from "../../../hooks/useStaff";
import {
  useFetchAllVehicles,
  useAddVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  type VehicleItem,
} from "../../../hooks/useTransport";

const initialFormState = {
  vehicle_no: "",
  model_no: "",
  year_made: "",
  driver_id: "" as string | number,
  driver_name: "",
  driver_phone: "",
  note: "",
};

const ITEMS_PER_PAGE = 10;

const Vehicles: React.FC = () => {
  // Fetch drivers from staff API
  const { data: staffData } = useFetchAllStaff(1, { role: "Driver" });

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Transport API hooks
  const { data: apiData } = useFetchAllVehicles({
    page,
    per_page: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
  });
  const addVehicleMutation = useAddVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<VehicleItem | null>(null);

  // Extract staff list and format driver options
  const driverOptions = useMemo(() => {
    const rawStaff: any[] = Array.isArray(staffData?.data)
      ? staffData.data
      : Array.isArray(staffData?.data?.data)
      ? staffData.data.data
      : Array.isArray(staffData)
      ? staffData
      : [];

    const mapped = rawStaff.map((d: any) => ({
      label: `${d.full_name || d.name || "Staff"} (${d.phone || d.mobile_no || "No phone"})`,
      value: d.id,
      driver_name: d.full_name || d.name || "Driver",
      driver_phone: d.phone || d.mobile_no || "",
    }));

    return mapped;
  }, [staffData]);

  // Extract raw list of vehicles
  const rawList: VehicleItem[] = useMemo(() => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;
    if (Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData.data?.data)) return apiData.data.data;
    return [];
  }, [apiData]);

  // Client-side fallback filtering
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item) => {
      const matchVehicle = (item.vehicle_no || "").toLowerCase().includes(q);
      const matchModel = (item.vehicle_model || item.model_no || "").toLowerCase().includes(q);
      const matchYear = String(item.year_made || "").toLowerCase().includes(q);
      const matchDriver = (item.driver_name || "").toLowerCase().includes(q);
      const matchPhone = (item.driver_contact || item.driver_phone || "").toLowerCase().includes(q);
      return matchVehicle || matchModel || matchYear || matchDriver || matchPhone;
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
    { key: "vehicle_no", title: "Vehicle No" },
    { key: "model_no", title: "Model No" },
    { key: "year_made", title: "Year Made" },
    { key: "driver_name", title: "Driver Name" },
    { key: "driver_phone", title: "Driver Phone Number" },
  ];

  // Paginated table data
  const tableData = useMemo(() => {
    const isBackendPaginated = Boolean(
      apiData?.data?.last_page || apiData?.last_page || apiData?.meta?.last_page
    );

    const itemsToDisplay = isBackendPaginated
      ? filteredList
      : filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return itemsToDisplay.map((item) => ({
      id: item.id,
      vehicle_no: item.vehicle_no || "-",
      model_no: item.vehicle_model || item.model_no || "-",
      year_made: item.year_made || "-",
      driver_name: item.driver_name || "-",
      driver_phone: item.driver_contact || item.driver_phone || "-",
      full_data: item,
    }));
  }, [apiData, filteredList, page]);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: VehicleItem) => {
    setEditingVehicle(item);
    setFormData({
      vehicle_no: item.vehicle_no || "",
      model_no: item.vehicle_model || item.model_no || "",
      year_made: String(item.year_made || ""),
      driver_id: item.driver_id ?? "",
      driver_name: item.driver_name || "",
      driver_phone: item.driver_contact || item.driver_phone || "",
      note: item.note || "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.vehicle_no.trim()) {
      newErrors.vehicle_no = "Vehicle number is required";
    }
    if (!formData.model_no.trim()) {
      newErrors.model_no = "Vehicle model is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const selectedDriver = driverOptions.find(
      (d) => String(d.value) === String(formData.driver_id)
    );

    const driverName = selectedDriver ? selectedDriver.driver_name : formData.driver_name || undefined;
    const driverPhone = selectedDriver ? selectedDriver.driver_phone : formData.driver_phone || undefined;
    const driverIdNum = formData.driver_id ? Number(formData.driver_id) || undefined : undefined;

    try {
      if (editingVehicle) {
        await updateVehicleMutation.mutateAsync({
          id: editingVehicle.id,
          vehicle_no: formData.vehicle_no.trim(),
          vehicle_model: formData.model_no.trim(),
          year_made: formData.year_made.trim(),
          driver_id: driverIdNum,
          driver_name: driverName,
          driver_contact: driverPhone,
          note: formData.note.trim() || undefined,
        });
        toast.success("Vehicle updated successfully");
      } else {
        await addVehicleMutation.mutateAsync({
          vehicle_no: formData.vehicle_no.trim(),
          vehicle_model: formData.model_no.trim(),
          year_made: formData.year_made.trim(),
          driver_id: driverIdNum,
          driver_name: driverName,
          driver_contact: driverPhone,
          note: formData.note.trim() || undefined,
        });
        toast.success("Vehicle added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save vehicle";
      toast.error(msg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (vehicle: VehicleItem) => {
    setDeleteTarget(vehicle);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVehicleMutation.mutateAsync(deleteTarget.id);
      toast.success("Vehicle deleted successfully");
      setDeleteTarget(null);

      if (page > 1 && tableData.length <= 1) {
        setPage(page - 1);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete vehicle";
      toast.error(msg);
    }
  };

  return (
    <div className="page_wrapper">
      <div className="vehicles_page">
        {/* Create / Edit Vehicle Popup */}
        {isModalOpen && (
          <PopupScreen
            className="vehicle_popup_modal"
            title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="vehicle_form_wrapper">
                {/* Row 1: Vehicle Number & Vehicle Model */}
                <div className="form_row">
                  <InputField
                    type="text"
                    label="Vehicle Number"
                    placeHolder="Enter vehicle number"
                    value={formData.vehicle_no}
                    error={errors.vehicle_no}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, vehicle_no: val }));
                      if (errors.vehicle_no) setErrors((prev) => ({ ...prev, vehicle_no: "" }));
                    }}
                  />

                  <InputField
                    type="text"
                    label="Vehicle Model"
                    placeHolder="Enter vehicle model"
                    value={formData.model_no}
                    error={errors.model_no}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, model_no: val }));
                      if (errors.model_no) setErrors((prev) => ({ ...prev, model_no: "" }));
                    }}
                  />
                </div>

                {/* Row 2: Year Made & Driver */}
                <div className="form_row">
                  <InputField
                    type="text"
                    label="Year Made"
                    placeHolder="Enter year (e.g. 2024)"
                    value={formData.year_made}
                    error={errors.year_made}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, year_made: val }));
                      if (errors.year_made) setErrors((prev) => ({ ...prev, year_made: "" }));
                    }}
                  />

                  <CustomSelect
                    label="Driver"
                    placeholder="Select driver"
                    options={driverOptions}
                    value={formData.driver_id}
                    error={errors.driver_id}
                    onChange={(val: any) => {
                      const sel = driverOptions.find((d) => String(d.value) === String(val));
                      setFormData((prev) => ({
                        ...prev,
                        driver_id: val,
                        driver_name: sel?.driver_name || "",
                        driver_phone: sel?.driver_phone || "",
                      }));
                    }}
                  />
                </div>

                {/* Row 3: Note */}
                <div className="form_full_width">
                  <InputField
                    type="text"
                    label="Note"
                    placeHolder="Enter note"
                    value={formData.note}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, note: val }));
                    }}
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingVehicle ? "Cancel" : "Reset"}
                  onClick={
                    editingVehicle
                      ? handleCloseModal
                      : () => {
                          setFormData(initialFormState);
                          setErrors({});
                        }
                  }
                />
                <PrimaryButton
                  title={
                    addVehicleMutation.isPending || updateVehicleMutation.isPending
                      ? "Saving..."
                      : editingVehicle
                      ? "Update Vehicle"
                      : "Save Vehicle"
                  }
                  icon={<Save size={16} />}
                  onClick={handleSubmit}
                  disabled={addVehicleMutation.isPending || updateVehicleMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Popup */}
        {deleteTarget && (
          <PopupScreen
            className="vehicle_popup_modal"
            title="Delete Vehicle"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>
                  Are you sure you want to delete vehicle{" "}
                  <strong>"{deleteTarget.vehicle_no}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton onClick={handleCancelDelete} title="Cancel" />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title={deleteVehicleMutation.isPending ? "Deleting..." : "Delete"}
                  disabled={deleteVehicleMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Vehicle List Table */}
        <TableWrapper
          title="Vehicle List"
          addButtonTitle="Add Vehicle"
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
                  title="Edit Vehicle"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Vehicle"
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

export default Vehicles;
