import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
  useFetchAllAssignVehicles,
  useAddAssignVehicle,
  useUpdateAssignVehicle,
  useDeleteAssignVehicle,
  useFetchAllRoutes,
  useFetchAllVehicles,
  type AssignVehicleItem,
} from "../../../hooks/useTransport";

const ITEMS_PER_PAGE = 10;

const AssignVechicle: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Assign vehicle list
  const { data: apiData } = useFetchAllAssignVehicles({
    page,
    per_page: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
  });

  // Routes and Vehicles for dropdown selection
  const { data: routesData } = useFetchAllRoutes({ per_page: 100 });
  const { data: vehiclesData } = useFetchAllVehicles({ per_page: 100 });

  const addAssignMutation = useAddAssignVehicle();
  const updateAssignMutation = useUpdateAssignVehicle();
  const deleteAssignMutation = useDeleteAssignVehicle();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssignVehicleItem | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AssignVehicleItem | null>(null);

  // Formatted route options
  const routeOptions = useMemo(() => {
    const raw: any[] = Array.isArray(routesData)
      ? routesData
      : Array.isArray(routesData?.data)
      ? routesData.data
      : Array.isArray(routesData?.data?.data)
      ? routesData.data.data
      : [];

    return raw.map((r) => ({
      label: `${r.title || r.route_title || "Route"} (${r.fare ? "₹" + r.fare : ""})`,
      value: r.id,
      title: r.title || r.route_title || "",
    }));
  }, [routesData]);

  // Formatted vehicle options
  const vehicleOptions = useMemo(() => {
    const raw: any[] = Array.isArray(vehiclesData)
      ? vehiclesData
      : Array.isArray(vehiclesData?.data)
      ? vehiclesData.data
      : Array.isArray(vehiclesData?.data?.data)
      ? vehiclesData.data.data
      : [];

    return raw.map((v) => ({
      label: `${v.vehicle_no || "Vehicle"} - ${v.vehicle_model || v.model_no || ""}`,
      value: v.id,
      vehicle_no: v.vehicle_no || "",
    }));
  }, [vehiclesData]);

  // Extract raw list
  const rawList: AssignVehicleItem[] = useMemo(() => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;
    if (Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData.data?.data)) return apiData.data.data;
    return [];
  }, [apiData]);

  // Search filter
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item) => {
      const routeStr = (
        item.route?.title ||
        item.route?.route_title ||
        item.route_title ||
        (typeof item.route === "string" ? item.route : "")
      ).toLowerCase();

      const vehicleStr = (
        item.vehicle?.vehicle_no ||
        item.vehicle_no ||
        (typeof item.vehicle === "string" ? item.vehicle : "")
      ).toLowerCase();

      return routeStr.includes(q) || vehicleStr.includes(q);
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
    { key: "route", title: "Route" },
    { key: "vehicle", title: "Vehicle" },
  ];

  // Paginated table data
  const tableData = useMemo(() => {
    const isBackendPaginated = Boolean(
      apiData?.data?.last_page || apiData?.last_page || apiData?.meta?.last_page
    );

    const itemsToDisplay = isBackendPaginated
      ? filteredList
      : filteredList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return itemsToDisplay.map((item) => {
      const routeDisplay =
        item.route?.title ||
        item.route?.route_title ||
        item.route_title ||
        (typeof item.route === "string" ? item.route : null) ||
        "-";

      const vehicleDisplay =
        item.vehicle?.vehicle_no ||
        item.vehicle_no ||
        (typeof item.vehicle === "string" ? item.vehicle : null) ||
        "-";

      return {
        id: item.id,
        route: routeDisplay,
        vehicle: vehicleDisplay,
        full_data: item,
      };
    });
  }, [apiData, filteredList, page]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setSelectedRoute("");
    setSelectedVehicle("");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AssignVehicleItem) => {
    setEditingItem(item);
    const routeId = item.route_id || item.route?.id || "";
    const vehicleId = item.vehicle_id || item.vehicle?.id || "";
    setSelectedRoute(String(routeId));
    setSelectedVehicle(String(vehicleId));
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedRoute("");
    setSelectedVehicle("");
    setErrors({});
  };

  const handleReset = () => {
    setSelectedRoute("");
    setSelectedVehicle("");
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!selectedRoute) newErrors.route = "Please select a route";
    if (!selectedVehicle) newErrors.vehicle = "Please select a vehicle";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingItem) {
        await updateAssignMutation.mutateAsync({
          id: editingItem.id,
          route_id: Number(selectedRoute) || selectedRoute,
          vehicle_id: Number(selectedVehicle) || selectedVehicle,
        });
        toast.success("Assigned vehicle updated successfully");
      } else {
        await addAssignMutation.mutateAsync({
          route_id: Number(selectedRoute) || selectedRoute,
          vehicle_id: Number(selectedVehicle) || selectedVehicle,
        });
        toast.success("Vehicle assigned successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to assign vehicle";
      toast.error(msg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (item: AssignVehicleItem) => {
    setDeleteTarget(item);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAssignMutation.mutateAsync(deleteTarget.id);
      toast.success("Assignment removed successfully");
      setDeleteTarget(null);

      if (page > 1 && tableData.length <= 1) {
        setPage(page - 1);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to remove assignment";
      toast.error(msg);
    }
  };

  return (
    <div className="page_wrapper">
      <div className="assign_vehicle_page">
        {/* Add/Edit Assign Vehicle Popup */}
        {isModalOpen && (
          <PopupScreen
            className="assign_popup_modal"
            title={editingItem ? "Edit Assigned Vehicle" : "Add Assign Vehicle"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="assign_form_grid">
                <CustomSelect
                  label="Route"
                  placeholder="Select route"
                  options={routeOptions}
                  value={selectedRoute}
                  error={errors.route}
                  onChange={(val) => {
                    setSelectedRoute(String(val));
                    if (errors.route) setErrors((prev) => ({ ...prev, route: "" }));
                  }}
                />

                <CustomSelect
                  label="Vehicle"
                  placeholder="Select vehicle"
                  options={vehicleOptions}
                  value={selectedVehicle}
                  error={errors.vehicle}
                  onChange={(val) => {
                    setSelectedVehicle(String(val));
                    if (errors.vehicle) setErrors((prev) => ({ ...prev, vehicle: "" }));
                  }}
                />
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingItem ? "Cancel" : "Reset"}
                  onClick={editingItem ? handleCloseModal : handleReset}
                />
                <PrimaryButton
                  title={
                    addAssignMutation.isPending || updateAssignMutation.isPending
                      ? "Saving..."
                      : editingItem
                      ? "Update"
                      : "Save"
                  }
                  icon={<Save size={16} />}
                  onClick={handleSave}
                  disabled={addAssignMutation.isPending || updateAssignMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Popup */}
        {deleteTarget && (
          <PopupScreen
            className="assign_popup_modal"
            title="Remove Assignment"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>
                  Are you sure you want to remove this route-vehicle assignment?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton onClick={handleCancelDelete} title="Cancel" />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title={deleteAssignMutation.isPending ? "Removing..." : "Delete"}
                  disabled={deleteAssignMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Assign Vehicle List Table */}
        <TableWrapper
          title="Assign Vehicle List"
          addButtonTitle="Add Assign Vehicle"
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
                  title="Edit"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete"
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

export default AssignVechicle;
