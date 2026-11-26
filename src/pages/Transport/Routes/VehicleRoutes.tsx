import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";

export interface VehicleRouteItem {
  id: number | string;
  route_title: string;
  fare: number | string;
}

const initialFormState = {
  route_title: "",
  fare: "",
};

const ITEMS_PER_PAGE = 5;

// Sample initial data matching the screenshot
const defaultRoutes: VehicleRouteItem[] = [
  { id: 1, route_title: "Test Route", fare: 200 },
  { id: 2, route_title: "Test Route", fare: 200 },
  { id: 3, route_title: "Test Route", fare: 200 },
  { id: 4, route_title: "Test Route", fare: 200 },
  { id: 5, route_title: "Test Route", fare: 200 },
  { id: 6, route_title: "North Campus Express", fare: 250 },
  { id: 7, route_title: "South City Route", fare: 180 },
  { id: 8, route_title: "East Metro Connector", fare: 220 },
  { id: 9, route_title: "West Suburb Shuttle", fare: 300 },
  { id: 10, route_title: "Central Ring Road", fare: 150 },
];

const VehicleRoutes: React.FC = () => {
  const [routes, setRoutes] = useState<VehicleRouteItem[]>(() => {
    try {
      const saved = localStorage.getItem("vehicle_routes_data");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultRoutes;
  });

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<VehicleRouteItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<VehicleRouteItem | null>(null);

  // Sync to local storage for persistence
  const updateRouteList = (newList: VehicleRouteItem[]) => {
    setRoutes(newList);
    try {
      localStorage.setItem("vehicle_routes_data", JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "route_title", title: "Route Title" },
    { key: "fare", title: "Fare (₹)" },
  ];

  // Search filter
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return routes;
    const q = searchTerm.trim().toLowerCase();
    return routes.filter((item) => {
      const matchTitle = (item.route_title || "").toLowerCase().includes(q);
      const matchFare = String(item.fare || "").toLowerCase().includes(q);
      return matchTitle || matchFare;
    });
  }, [routes, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [filteredList.length]);

  // Paginated table data
  const tableData = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return paginated.map((item, index) => ({
      id: item.id,
      sl: startIndex + index + 1,
      route_title: item.route_title || "-",
      fare: `₹ ${item.fare}`,
      full_data: item,
    }));
  }, [filteredList, page]);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingRoute(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: VehicleRouteItem) => {
    setEditingRoute(item);
    setFormData({
      route_title: item.route_title || "",
      fare: String(item.fare || ""),
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.route_title.trim()) {
      newErrors.route_title = "Route title is required";
    }
    if (!String(formData.fare).trim()) {
      newErrors.fare = "Fare is required";
    } else if (isNaN(Number(formData.fare)) || Number(formData.fare) < 0) {
      newErrors.fare = "Please enter a valid fare amount";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit create or update
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    if (editingRoute) {
      const updated = routes.map((r) =>
        r.id === editingRoute.id
          ? {
              ...r,
              route_title: formData.route_title.trim(),
              fare: Number(formData.fare),
            }
          : r
      );
      updateRouteList(updated);
      toast.success("Route updated successfully");
    } else {
      const newRoute: VehicleRouteItem = {
        id: Date.now(),
        route_title: formData.route_title.trim(),
        fare: Number(formData.fare),
      };
      updateRouteList([newRoute, ...routes]);
      toast.success("Route added successfully");
    }
    handleCloseModal();
  };

  // Delete handlers
  const handleDeleteClick = (route: VehicleRouteItem) => {
    setDeleteTarget(route);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const updated = routes.filter((r) => r.id !== deleteTarget.id);
    updateRouteList(updated);
    toast.success("Route deleted successfully");
    setDeleteTarget(null);

    // Adjust page if empty after deletion
    if (page > 1 && (page - 1) * ITEMS_PER_PAGE >= updated.length) {
      setPage(page - 1);
    }
  };

  return (
    <div className="page_wrapper">
      <div className="vehicle_routes_page">
        {/* Create / Edit Route Popup */}
        {isModalOpen && (
          <PopupScreen
            className="route_popup_modal"
            title={editingRoute ? "Edit Route" : "Add Route"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="route_form_grid">
                <InputField
                  type="text"
                  label="Route Title"
                  placeHolder="Enter route title"
                  value={formData.route_title}
                  error={errors.route_title}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, route_title: val }));
                    if (errors.route_title) {
                      setErrors((prev) => ({ ...prev, route_title: "" }));
                    }
                  }}
                />

                <InputField
                  type="number"
                  label="Fare"
                  placeHolder="Enter fare"
                  value={formData.fare}
                  error={errors.fare}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, fare: val }));
                    if (errors.fare) {
                      setErrors((prev) => ({ ...prev, fare: "" }));
                    }
                  }}
                />
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingRoute ? "Cancel" : "Reset"}
                  onClick={
                    editingRoute
                      ? handleCloseModal
                      : () => {
                          setFormData(initialFormState);
                          setErrors({});
                        }
                  }
                />
                <PrimaryButton
                  title={editingRoute ? "Update Route" : "Save Route"}
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
            className="route_popup_modal"
            title="Delete Route"
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section" style={{ padding: "12px 0" }}>
                <p>
                  Are you sure you want to delete route{" "}
                  <strong>"{deleteTarget.route_title}"</strong>?
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

        {/* Route List Table */}
        <TableWrapper
          title="Route List"
          addButtonTitle="Add Route"
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
                  title="Edit Route"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete Route"
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

export default VehicleRoutes;
