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

export interface VehicleItem {
  id: number | string;
  vehicle_no: string;
  model_no: string;
  year_made: string | number;
  driver_id?: number | string;
  driver_name: string;
  driver_phone: string;
  note?: string;
}

const initialFormState = {
  vehicle_no: "",
  model_no: "",
  year_made: "",
  driver_id: "" as string | number,
  driver_name: "",
  driver_phone: "",
  note: "",
};

const ITEMS_PER_PAGE = 6;

// Initial sample data matching the screenshot
const defaultVehicles: VehicleItem[] = [
  {
    id: 1,
    vehicle_no: "Test Vehicle 23232",
    model_no: "Test Model 4343433",
    year_made: "2007",
    driver_name: "Jhon Martin",
    driver_phone: "7037373929",
    note: "",
  },
  {
    id: 2,
    vehicle_no: "Test Vehicle 23232",
    model_no: "Test Model 4343433",
    year_made: "2007",
    driver_name: "Jhon Martin",
    driver_phone: "7037373929",
    note: "",
  },
  {
    id: 3,
    vehicle_no: "Test Vehicle 23232",
    model_no: "Test Model 4343433",
    year_made: "2007",
    driver_name: "Jhon Martin",
    driver_phone: "7037373929",
    note: "",
  },
  {
    id: 4,
    vehicle_no: "Test Vehicle 23232",
    model_no: "Test Model 4343433",
    year_made: "2007",
    driver_name: "Jhon Martin",
    driver_phone: "7037373929",
    note: "",
  },
  {
    id: 5,
    vehicle_no: "Test Vehicle 23232",
    model_no: "Test Model 4343433",
    year_made: "2007",
    driver_name: "Jhon Martin",
    driver_phone: "7037373929",
    note: "",
  },
  {
    id: 6,
    vehicle_no: "Test Vehicle 23232",
    model_no: "Test Model 4343433",
    year_made: "2007",
    driver_name: "Jhon Martin",
    driver_phone: "7037373929",
    note: "",
  },
];

const Vehicles: React.FC = () => {
  // Fetch drivers from staff API by driver role
  const { data: staffData } = useFetchAllStaff(1, { role: "Driver" });

  const [vehicles, setVehicles] = useState<VehicleItem[]>(() => {
    try {
      const saved = localStorage.getItem("vehicles_data");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultVehicles;
  });

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

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

    // Filter staff who have driver role or designation
    const drivers = rawStaff.filter((s: any) => {
      const roleStr = String(s.role || s.role_name || "").toLowerCase();
      const desigStr = String(s.designation || "").toLowerCase();
      return roleStr.includes("driver") || desigStr.includes("driver");
    });

    const activeList = drivers.length > 0 ? drivers : rawStaff;

    const mapped = activeList.map((d: any) => ({
      label: `${d.full_name || d.name || "Driver"} (${d.phone || "No phone"})`,
      value: d.id,
      driver_name: d.full_name || d.name || "Driver",
      driver_phone: d.phone || "",
    }));

    // Fallback sample drivers if no staff loaded yet
    if (mapped.length === 0) {
      return [
        {
          label: "Jhon Martin (7037373929)",
          value: "sample-1",
          driver_name: "Jhon Martin",
          driver_phone: "7037373929",
        },
        {
          label: "Robert Smith (9876543210)",
          value: "sample-2",
          driver_name: "Robert Smith",
          driver_phone: "9876543210",
        },
      ];
    }

    return mapped;
  }, [staffData]);

  // Sync to local storage for quick preview
  const updateVehicleList = (newList: VehicleItem[]) => {
    setVehicles(newList);
    try {
      localStorage.setItem("vehicles_data", JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  const columns: Column[] = [
    { key: "vehicle_no", title: "Vehicle No" },
    { key: "model_no", title: "Model No" },
    { key: "year_made", title: "Year Made" },
    { key: "driver_name", title: "Driver Name" },
    { key: "driver_phone", title: "Driver Phone Number" },
  ];

  // Search filter
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return vehicles;
    const q = searchTerm.trim().toLowerCase();
    return vehicles.filter((item) => {
      const matchVehicle = (item.vehicle_no || "").toLowerCase().includes(q);
      const matchModel = (item.model_no || "").toLowerCase().includes(q);
      const matchYear = String(item.year_made || "").toLowerCase().includes(q);
      const matchDriver = (item.driver_name || "").toLowerCase().includes(q);
      const matchPhone = (item.driver_phone || "").toLowerCase().includes(q);
      return matchVehicle || matchModel || matchYear || matchDriver || matchPhone;
    });
  }, [vehicles, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [filteredList.length]);

  // Paginated table data
  const tableData = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return paginated.map((item) => ({
      id: item.id,
      vehicle_no: item.vehicle_no || "-",
      model_no: item.model_no || "-",
      year_made: item.year_made || "-",
      driver_name: item.driver_name || "-",
      driver_phone: item.driver_phone || "-",
      full_data: item,
    }));
  }, [filteredList, page]);

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
      model_no: item.model_no || "",
      year_made: String(item.year_made || ""),
      driver_id: item.driver_id || "",
      driver_name: item.driver_name || "",
      driver_phone: item.driver_phone || "",
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

  // Form submission (placeholder state update, APIs can be plugged in later)
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const selectedDriver = driverOptions.find(
      (d) => String(d.value) === String(formData.driver_id)
    );

    const driverName = selectedDriver
      ? selectedDriver.driver_name
      : formData.driver_name || "Jhon Martin";
    const driverPhone = selectedDriver
      ? selectedDriver.driver_phone
      : formData.driver_phone || "7037373929";

    if (editingVehicle) {
      const updated = vehicles.map((v) =>
        v.id === editingVehicle.id
          ? {
              ...v,
              vehicle_no: formData.vehicle_no || v.vehicle_no,
              model_no: formData.model_no || v.model_no,
              year_made: formData.year_made || v.year_made,
              driver_id: formData.driver_id,
              driver_name: driverName,
              driver_phone: driverPhone,
              note: formData.note,
            }
          : v
      );
      updateVehicleList(updated);
      toast.success("Vehicle updated successfully");
    } else {
      const newVehicle: VehicleItem = {
        id: Date.now(),
        vehicle_no: formData.vehicle_no || "Test Vehicle",
        model_no: formData.model_no || "Test Model",
        year_made: formData.year_made || "2024",
        driver_id: formData.driver_id,
        driver_name: driverName,
        driver_phone: driverPhone,
        note: formData.note,
      };
      updateVehicleList([newVehicle, ...vehicles]);
      toast.success("Vehicle added successfully");
    }
    handleCloseModal();
  };

  // Delete handlers
  const handleDeleteClick = (vehicle: VehicleItem) => {
    setDeleteTarget(vehicle);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updated = vehicles.filter((v) => v.id !== deleteTarget.id);
    updateVehicleList(updated);
    toast.success("Vehicle deleted successfully");
    setDeleteTarget(null);

    if (page > 1 && (page - 1) * ITEMS_PER_PAGE >= updated.length) {
      setPage(page - 1);
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
                    }}
                  />
                </div>

                {/* Row 2: Year Made & Driver */}
                <div className="form_row">
                  <InputField
                    type="text"
                    label="Year Made"
                    placeHolder="Enter year"
                    value={formData.year_made}
                    error={errors.year_made}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setFormData((prev) => ({ ...prev, year_made: val }));
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
                  title={editingVehicle ? "Update Vehicle" : "Save Vehicle"}
                  icon={<Save size={16} />}
                  onClick={handleSubmit}
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
                <SecondaryButton
                  onClick={handleCancelDelete}
                  title="Cancel"
                />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title="Delete"
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
