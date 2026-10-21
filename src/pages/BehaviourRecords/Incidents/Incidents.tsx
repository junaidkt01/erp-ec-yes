import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import { InputField } from "../../../components/InputFields/InputFields";
import InputRadioButtons from "../../../components/InputRadioButtons/InputRadioButtons";
import LoadingOverlay from "../../../components/Loadingoverlay";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import TableWrapper from "../../../components/TableWrapper";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useAddIncident,
  useFetchAllIncidents,
  useRemoveIncident,
  useUpdateIncident,
  type Incident,
} from "../../../hooks/useIncidents";

const initialFormState = {
  title: "",
  point: "",
  description: "",
  incidentType: "Positive Incident",
};

const Incidents: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Queries and mutations
  const { data: apiResponse, isLoading } = useFetchAllIncidents(page, debouncedSearch);
  console.log("apiResponse: ", apiResponse)
  const addIncidentMutation = useAddIncident();
  const updateIncidentMutation = useUpdateIncident();
  const removeIncidentMutation = useRemoveIncident();

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<Incident | null>(null);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "title", title: "Title" },
    { key: "point", title: "Point" },
    { key: "description", title: "Description" },
  ];

  // Extract raw list and pagination info
  const rawList: any[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data?.data)) return apiResponse.data.data;
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  const totalPages = useMemo(() => {
    return (
      apiResponse?.data?.last_page ||
      apiResponse?.meta?.last_page ||
      apiResponse?.last_page ||
      (rawList.length > 0 ? Math.ceil(rawList.length / (apiResponse?.data?.per_page || 15)) : 1)
    );
  }, [apiResponse, rawList]);

  // Client-side fallback filter if backend does not filter by search param
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return rawList;
    const q = searchTerm.trim().toLowerCase();
    return rawList.filter((item: any) => {
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchDesc = (item.description || "").toLowerCase().includes(q);
      const matchPoint = String(item.point || "").includes(q);
      return matchTitle || matchDesc || matchPoint;
    });
  }, [rawList, searchTerm]);

  // Map to DataTable rows
  const tableData = useMemo(() => {
    const perPage = apiResponse?.data?.per_page || apiResponse?.meta?.per_page || 15;
    return filteredList.map((item: any, index: number) => {
      const isNegative =
        item.is_negative === true ||
        item.is_negative === 1 ||
        item.is_negative === "1" ||
        item.is_negative === "true";

      const pointVal = Number(item.point) || 0;
      const displayPoint = isNegative
        ? pointVal > 0
          ? `-${pointVal}`
          : `${pointVal}`
        : `${pointVal}`;

      return {
        id: item.id,
        sl: (page - 1) * perPage + (index + 1),
        title: item.title || "-",
        point: displayPoint,
        description: item.description || "-",
        full_data: item,
      };
    });
  }, [filteredList, page, apiResponse]);

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingIncident(null);
    setFormData(initialFormState);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (item: Incident) => {
    const isNegative =
      item.is_negative === true ||
      item.is_negative === 1 ||
      // item.is_negative === "1" ||
      // item.is_negative === "true";

    setEditingIncident(item);
    setFormData({
      title: item.title || "",
      point: String(Math.abs(Number(item.point) || 0) || item.point || ""),
      description: item.description || "",
      incidentType: isNegative ? "Negative Incident" : "Positive Incident",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncident(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (formData.point === "" || isNaN(Number(formData.point))) {
      newErrors.point = "Valid point number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit create or update
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      point: Math.abs(Number(formData.point)),
      is_negative: formData.incidentType === "Negative Incident",
      description: formData.description.trim(),
    };

    try {
      if (editingIncident) {
        await updateIncidentMutation.mutateAsync({
          id: editingIncident.id,
          ...payload,
        });
        toast.success("Incident updated successfully");
      } else {
        await addIncidentMutation.mutateAsync(payload);
        toast.success("Incident added successfully");
      }
      handleCloseModal();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save incident";
      toast.error(errorMsg);
    }
  };

  // Delete handlers
  const handleDeleteClick = (incident: Incident) => {
    setDeleteTarget(incident);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeIncidentMutation.mutateAsync(deleteTarget.id);
      toast.success("Incident deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete incident";
      toast.error(errorMsg);
    }
  };

  const isSaving =
    addIncidentMutation.isPending || updateIncidentMutation.isPending;

  if (isLoading && !apiResponse) {
    return <LoadingOverlay isLoading={true} />;
  }

  return (
    <div className="page_wrapper">
      <div className="incidents">
        {/* Create / Edit Incident Popup */}
        {isModalOpen && (
          <PopupScreen
            title={editingIncident ? "Edit Incident" : "Add Incident"}
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="body_section">
                <InputField
                  type="text"
                  label="Title"
                  placeHolder="Enter title"
                  value={formData.title}
                  error={errors.title}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, title: val }));
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                />
                <InputField
                  type="number"
                  label="Point"
                  placeHolder="Enter point"
                  value={formData.point}
                  error={errors.point}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, point: val }));
                    if (errors.point) setErrors((prev) => ({ ...prev, point: "" }));
                  }}
                />
              </div>

              <div className="body_section">
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

              <div className="body_section">
                <InputRadioButtons
                  name="incident_type"
                  title="Incident Type"
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, incidentType: value }))
                  }
                  options={[
                    { label: "Positive Incident", value: "Positive Incident" },
                    { label: "Negative Incident", value: "Negative Incident" },
                  ]}
                  selectedValue={formData.incidentType}
                  key={0}
                />
              </div>

              <div className="buttons">
                <SecondaryButton
                  title={editingIncident ? "Cancel" : "Reset"}
                  onClick={
                    editingIncident
                      ? handleCloseModal
                      : () => {
                        setFormData(initialFormState);
                        setErrors({});
                      }
                  }
                />
                <PrimaryButton
                  title={
                    isSaving
                      ? "Saving..."
                      : editingIncident
                        ? "Update Information"
                        : "Save Information"
                  }
                  onClick={handleSubmit}
                  disabled={isSaving}
                  isLoading={isSaving}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Delete Confirmation Popup */}
        {deleteTarget && (
          <PopupScreen
            title={`Delete ${deleteTarget.title}`}
            onClick={handleCancelDelete}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>Are you sure you want to delete this incident record?</p>
              </div>

              <div className="buttons">
                <SecondaryButton
                  onClick={handleCancelDelete}
                  title="Cancel"
                  disable={removeIncidentMutation.isPending}
                />
                <PrimaryButton
                  onClick={handleConfirmDelete}
                  disabled={removeIncidentMutation.isPending}
                  isLoading={removeIncidentMutation.isPending}
                  title={
                    removeIncidentMutation.isPending
                      ? "Deleting..."
                      : "Delete"
                  }
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* Incidents Table */}
        <TableWrapper
          onClick={handleOpenAddModal}
          isAddButton
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={setSearchTerm}
          title="Incident List"
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={apiResponse?.data?.current_page || page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            actions={(row) => (
              <div className="actions">
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="Edit Incident"
                  onClick={() => handleOpenEditModal(row.full_data)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="hvr_zm_out"
                  title="Delete Incident"
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

export default Incidents;