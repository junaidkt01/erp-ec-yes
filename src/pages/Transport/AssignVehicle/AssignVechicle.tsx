import React, { useMemo, useState } from "react";
import { Save } from "lucide-react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import PopupScreen from "../../../components/PopupScreen/PopupScreen";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";

export interface AssignVehicleItem {
  id: number | string;
  route: string;
  vehicle: string;
}

const ITEMS_PER_PAGE = 6;

// Sample assignment list matching the screenshot
const defaultAssignments: AssignVehicleItem[] = [
  { id: 1, route: "Test Route", vehicle: "Test Vehicle 4343433" },
  { id: 2, route: "Test Route", vehicle: "Test Vehicle 4343433" },
  { id: 3, route: "Test Route", vehicle: "Test Vehicle 4343433" },
  { id: 4, route: "Test Route", vehicle: "Test Vehicle 4343433" },
  { id: 5, route: "Test Route", vehicle: "Test Vehicle 4343433" },
  { id: 6, route: "Test Route", vehicle: "Test Vehicle 4343433" },
];

const routeOptions = [
  { label: "Test Route", value: "Test Route" },
  { label: "North Campus Express", value: "North Campus Express" },
  { label: "South City Route", value: "South City Route" },
  { label: "East Metro Connector", value: "East Metro Connector" },
];

const vehicleOptions = [
  { label: "Test Vehicle 4343433", value: "Test Vehicle 4343433" },
  { label: "School Bus 101", value: "School Bus 101" },
  { label: "Van 204", value: "Van 204" },
  { label: "Mini Bus 305", value: "Mini Bus 305" },
];

const AssignVechicle: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignVehicleItem[]>(defaultAssignments);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");

  const columns: Column[] = [
    { key: "route", title: "Route" },
    { key: "vehicle", title: "Vehicle" },
  ];

  // Search filter
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return assignments;
    const q = searchTerm.trim().toLowerCase();
    return assignments.filter((item) => {
      const matchRoute = (item.route || "").toLowerCase().includes(q);
      const matchVehicle = (item.vehicle || "").toLowerCase().includes(q);
      return matchRoute || matchVehicle;
    });
  }, [assignments, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [filteredList.length]);

  // Paginated table data
  const tableData = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filteredList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return paginated.map((item) => ({
      id: item.id,
      route: item.route || "-",
      vehicle: item.vehicle || "-",
      full_data: item,
    }));
  }, [filteredList, page]);

  const handleOpenAddModal = () => {
    setSelectedRoute("");
    setSelectedVehicle("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoute("");
    setSelectedVehicle("");
  };

  const handleReset = () => {
    setSelectedRoute("");
    setSelectedVehicle("");
  };

  const handleSave = () => {
    if (selectedRoute && selectedVehicle) {
      setAssignments((prev) => [
        {
          id: Date.now(),
          route: selectedRoute,
          vehicle: selectedVehicle,
        },
        ...prev,
      ]);
    }
    handleCloseModal();
  };

  return (
    <div className="page_wrapper">
      <div className="assign_vehicle_page">
        {/* Add Assign Vehicle Popup */}
        {isModalOpen && (
          <PopupScreen
            className="assign_popup_modal"
            title="Add Assign Vehicle"
            onClick={handleCloseModal}
          >
            <div className="popup_body">
              <div className="assign_form_grid">
                <CustomSelect
                  label="Route"
                  placeholder="Select route"
                  options={routeOptions}
                  value={selectedRoute}
                  onChange={(val) => setSelectedRoute(val)}
                />

                <CustomSelect
                  label="Vehicle"
                  placeholder="Select vehicle"
                  options={vehicleOptions}
                  value={selectedVehicle}
                  onChange={(val) => setSelectedVehicle(val)}
                />
              </div>

              <div className="buttons">
                <SecondaryButton
                  title="Reset"
                  onClick={handleReset}
                />
                <PrimaryButton
                  title="Save"
                  icon={<Save size={16} />}
                  onClick={handleSave}
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
            actions={() => (
              <div className="actions">
                <button
                  type="button"
                  className="edit_btn hvr_zm_out"
                  title="Edit"
                  onClick={() => setIsModalOpen(true)}
                >
                  <img src="/svgs/edit.svg" alt="Edit" />
                </button>
                <button
                  type="button"
                  className="delete_btn hvr_zm_out"
                  title="Delete"
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
