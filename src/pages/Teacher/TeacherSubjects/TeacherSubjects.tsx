import React, { useMemo, useState } from "react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay, { ErrorStatusOverlay } from "../../../components/Loadingoverlay";
import { useAuth } from "../../../auth/useAuth";
import { useTeacherWidgets, type SubjectItem } from "../../../hooks/useTeacherWidgets";
import { useDebounce } from "../../../hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

const TeacherSubjects: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: authData } = useAuth();
  const resolvedTeacherId =
    authData?.teacher_id ??
    (authData?.user?.roles?.some((r: any) =>
      (typeof r === "string" ? r : r?.name)?.toLowerCase().includes("teacher")
    )
      ? authData?.user?.id
      : undefined) ??
    19;

  const { data, isLoading, isError, error } = useTeacherWidgets(resolvedTeacherId);

  const rawSubjects: SubjectItem[] = useMemo(() => {
    const subjectsWidget = data?.widgets?.subjects;
    if (subjectsWidget?.subjects && subjectsWidget.subjects.length > 0) {
      return subjectsWidget.subjects;
    }
    if (subjectsWidget?.pills && subjectsWidget.pills.length > 0) {
      return subjectsWidget.pills.map((pill, idx) => ({
        id: idx + 1,
        name: pill,
        code: "-",
        type: "Theory",
      }));
    }
    return [];
  }, [data]);

  const filteredList = useMemo(() => {
    if (!debouncedSearch.trim()) return rawSubjects;
    const q = debouncedSearch.trim().toLowerCase();
    return rawSubjects.filter((item) => {
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchCode = (item.code || "").toLowerCase().includes(q);
      const matchType = (item.type || "").toLowerCase().includes(q);
      return matchName || matchCode || matchType;
    });
  }, [rawSubjects, debouncedSearch]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [filteredList.length]);

  const tableData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filteredList.slice(start, start + ITEMS_PER_PAGE);
    return paginated.map((item, index) => ({
      sl: start + index + 1,
      name: item.name,
      code: item.code || "-",
      type: item.type || "Theory",
      id: item.id ?? "-",
    }));
  }, [filteredList, page]);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "name", title: "Subject Name" },
    { key: "code", title: "Subject Code" },
    { key: "type", title: "Type" },
    { key: "id", title: "Subject ID" },
  ];

  if (isLoading && !data) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (isError && !data) {
    return (
      <ErrorStatusOverlay
        isError={true}
        status={(error as any)?.response?.status ?? 500}
        message={error?.message || "Failed to load subjects"}
      />
    );
  }

  return (
    <div className="page_wrapper">
      <div className="your_subjects_page">
        <TableWrapper
          title="Your Subjects"
          isSearchBar
          searchValue={searchTerm}
          searchOnchange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
        >
          <DataTable
            columns={columns}
            data={tableData}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            emptyMessage="No subjects found."
          />
        </TableWrapper>
      </div>
    </div>
  );
};

export default TeacherSubjects;
