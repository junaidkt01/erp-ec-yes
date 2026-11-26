import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { InputField } from "../../../components/InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
  useFetchAllRoutes,
  useAddRoute,
  useUpdateRoute,
  useDeleteRoute,
  type RouteItem,
} from "../../../hooks/useTransport";

const initialFormState = {
  route_title: "",
  fare: "",
};

const ITEMS_PER_PAGE = 10;

const VehicleRoutes: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Transport API hooks
  const { data: apiData } = useFetchAllRoutes({
    page,
    per_page: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
  });
  const addRouteMutation = useAddRoute();
  const updateRouteMutation = useUpdateRoute();
  const deleteRouteMutation = useDeleteRoute();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<RouteItem | null>(null);

  // Extract raw list from response
  const rawList: RouteItem[] = useMemo(() => {
    if (!apiData) return [];
    if (Array.isArray(apiData)) return apiData;
    if (Array.isArray(apiData.data)) return apiData.data;
    if (Array.isArray(apiData.data?.data)) return apiData.data.data;
    return [];
  }, [apiData]);

  // Client-side fallback filtering if server returns full collection
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item) => {
      const title = (item.title || item.route_title || "").toLowerCase();
      const fare = String(item.fare || "").toLowerCase();
      return title.includes(q) || fare.includes(q);
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
    { key: "route_title", title: "Route Title" },
    { key: "fare", title: "Fare (₹)" },
  ];

  // Paginated table data
  const tableData = useMemo(() => {
    // If backend already paginated
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
      route_title: item.title || item.route_title || "-",
      fare: item.fare !== undefined && item.fare !== null ? `₹ ${item.fare}` : "-",
      full_data: item,
    }));
  }, [apiData, filteredList, page]);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingRoute(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: RouteItem) => {
    setEditingRoute(item);
    setFormData({
      route_title: item.title || item.route_title || "",
      fare: String(item.fare ?? ""),
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
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingRoute) {
        await updateRouteMutation.mutateAsync({
          id: editingRoute.id,
          title: formData.route_title.trim(),
          fare: Number(formData.fare),
        });
        toast.success("Route updated successfully");
      } else {
        await addRouteMutation.mutateAsync({
          title: formData.route_title.trim(),
          fare: Number(formData.fare),
        });
        toast.success("Route created successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save route";
      toast.error(msg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (route: RouteItem) => {
    setDeleteTarget(route);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRouteMutation.mutateAsync(deleteTarget.id);
      toast.success("Route deleted successfully");
      setDeleteTarget(null);
      if (page > 1 && tableData.length <= 1) {
        setPage(page - 1);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete route";
      toast.error(msg);
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
                  title={
                    addRouteMutation.isPending || updateRouteMutation.isPending
                      ? "Saving..."
                      : editingRoute
                      ? "Update Route"
                      : "Save Route"
                  }
                  icon={<Save size={16} />}
                  onClick={handleSubmit}
                  disabled={addRouteMutation.isPending || updateRouteMutation.isPending}
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
                  <strong>"{deleteTarget.title || deleteTarget.route_title}"</strong>?
                </p>
              </div>

              <div className="buttons">
                <SecondaryButton onClick={handleCancelDelete} title="Cancel" />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  title={deleteRouteMutation.isPending ? "Deleting..." : "Delete"}
                  disabled={deleteRouteMutation.isPending}
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
