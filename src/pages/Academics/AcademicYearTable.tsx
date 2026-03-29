//test//AcademicYearTable//

import { useState } from "react";
import {
  useFetchAllAcademicYears,
  useAddAcademicYear,
  useUpdateAcademicYear,
  useRemoveAcademicYear,
} from "../../hooks/useAcademicYear";

const AcademicYearTable = () => {
  const { data, isLoading } = useFetchAllAcademicYears();
  const { mutate: addAcademicYear } = useAddAcademicYear();
  const { mutate: updateAcademicYear } = useUpdateAcademicYear();
  const { mutate: removeAcademicYear } = useRemoveAcademicYear();

  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_current: 0,
  });

  const handleAdd = () => {
    addAcademicYear(form);
  };

  const handleUpdate = (id: number) => {
    updateAcademicYear({
      id,
      ...form,
    });
  };

  const handleDelete = (id: number) => {
    removeAcademicYear(id);
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Academic Years</h2>

      {/* Add Form */}
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="date"
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
        />
        <input
          type="date"
          onChange={(e) => setForm({ ...form, end_date: e.target.value })}
        />
        <select
          onChange={(e) =>
            setForm({ ...form, is_current: Number(e.target.value) })
          }
        >
          <option value={0}>Not Current</option>
          <option value={1}>Current</option>
        </select>

        <button onClick={handleAdd}>Add Academic Year</button>
      </div>

      {/* Table */}
      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Start</th>
            <th>End</th>
            <th>Current</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((year) => (
            <tr key={year.id}>
              <td>{year.id}</td>
              <td>{year.name}</td>
              <td>{year.start_date}</td>
              <td>{year.end_date}</td>
              <td>{year.is_current ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleUpdate(year.id)}>Update</button>
                <button onClick={() => handleDelete(year.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcademicYearTable;