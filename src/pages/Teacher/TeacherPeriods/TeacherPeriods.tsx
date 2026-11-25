import React, { useMemo, useState } from "react";
import TableWrapper from "../../../components/TableWrapper";
import DataTable, { type Column } from "../../../components/DataTable/DataTable";
import LoadingOverlay, { ErrorStatusOverlay } from "../../../components/Loadingoverlay";
import { useAuth } from "../../../auth/useAuth";
import { useTeacherWidgets, type PeriodItem } from "../../../hooks/useTeacherWidgets";
import { useDebounce } from "../../../hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

const TeacherPeriods: React.FC = () => {
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

  const rawPeriods: PeriodItem[] = useMemo(() => {
    const nextPeriods = data?.widgets?.next_periods;
    if (nextPeriods?.periods && nextPeriods.periods.length > 0) {
      return nextPeriods.periods;
    }
    if (nextPeriods?.pills && nextPeriods.pills.length > 0) {
      return nextPeriods.pills.map((pill, idx) => ({
        id: idx + 1,
        display: pill,
        class_name: "-",
        section_name: "-",
        subject_name: pill,
        subject_code: "-",
        start_time: "-",
        end_time: "-",
        day: "-",
      }));
    }
    return [];
  }, [data]);

  const filteredList = useMemo(() => {
    if (!debouncedSearch.trim()) return rawPeriods;
    const q = debouncedSearch.trim().toLowerCase();
    return rawPeriods.filter((item) => {
      const matchSubject = (item.subject_name || "").toLowerCase().includes(q);
      const matchCode = (item.subject_code || "").toLowerCase().includes(q);
      const matchClass = (item.class_name || "").toLowerCase().includes(q);
      const matchSection = (item.section_name || "").toLowerCase().includes(q);
      const matchDay = (item.day || "").toLowerCase().includes(q);
      const matchDisplay = (item.display || "").toLowerCase().includes(q);
      return matchSubject || matchCode || matchClass || matchSection || matchDay || matchDisplay;
    });
  }, [rawPeriods, debouncedSearch]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  }, [filteredList.length]);

  const tableData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = filteredList.slice(start, start + ITEMS_PER_PAGE);
    return paginated.map((item, index) => ({
      sl: start + index + 1,
      subject: item.subject_name || item.subject_code || item.display || "-",
      class: item.class_name || "-",
      section: item.section_name || "-",
      day: item.day || "-",
      time: item.start_time
        ? `${item.start_time}${item.end_time ? ` - ${item.end_time}` : ""}`
        : "-",
      code: item.subject_code || "-",
    }));
  }, [filteredList, page]);

  const columns: Column[] = [
    { key: "sl", title: "SL" },
    { key: "subject", title: "Subject" },
    { key: "class", title: "Class" },
    { key: "section", title: "Section" },
    { key: "day", title: "Day" },
    { key: "time", title: "Time" },
    { key: "code", title: "Subject Code" },
  ];

  if (isLoading && !data) {
    return <LoadingOverlay isLoading={true} />;
  }

  if (isError && !data) {
    return (
      <ErrorStatusOverlay
        isError={true}
        status={(error as any)?.response?.status ?? 500}
        message={error?.message || "Failed to load periods"}
      />
    );
  }

  return (
    <div className="page_wrapper">
      <div className="your_periods_page">
        <TableWrapper
          title="Next Periods"
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
            emptyMessage="No upcoming periods found."
          />
        </TableWrapper>
      </div>
    </div>
  );
};

export default TeacherPeriods;
