import React, { useMemo, useState } from "react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay, { ErrorStatusOverlay } from "../../../components/Loadingoverlay";
import { useAuth } from "../../../auth/useAuth";
import { useTeacherWidgets, type ClassItem } from "../../../hooks/useTeacherWidgets";
import { useDebounce } from "../../../hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

const TeacherClasses: React.FC = () => {
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

  const rawClasses: ClassItem[] = useMemo(() => {
    const yourClasses = data?.widgets?.your_classes;
    if (yourClasses?.classes && yourClasses.classes.length > 0) {
      return yourClasses.classes;
    }
    if (yourClasses?.pills && yourClasses.pills.length > 0) {
      return yourClasses.pills.map((pill, idx) => ({
        id: idx + 1,
        name: pill,
      }));
    }
    return [];
  }, [data]);

  const filteredList = useMemo(() => {
    if (!debouncedSearch.trim()) return rawClasses;
    const q = debouncedSearch.trim().toLowerCase();
    return rawClasses.filter((item) => {
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchId = String(item.id || "").toLowerCase().includes(q);
      return matchName || matchId;
    });
  }, [rawClasses, debouncedSearch]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [filteredList.length]);

  const tableData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filteredList.slice(start, start + ITEMS_PER_PAGE);
    return paginated.map((item, index) => ({
      sl: start + index + 1,
      id: item.id ?? "-",
      name: item.name,
    }));
  }, [filteredList, page]);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "id", title: "Class ID" },
    { key: "name", title: "Class Name" },
  ];

  if (isLoading && !data) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (isError && !data) {
    return (
      <ErrorStatusOverlay
        isError={true}
        status={(error as any)?.response?.status ?? 500}
        message={error?.message || "Failed to load classes"}
      />
    );
  }

  return (
    <div className="page_wrapper">
      <div className="your_classes_page">
        <TableWrapper
          title="Your Classes"
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
            emptyMessage="No classes found."
          />
        </TableWrapper>
      </div>
    </div>
  );
};

export default TeacherClasses;
