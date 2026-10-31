import { BASE_URL } from "../../api/endpoints";

const COLORED_BADGES = new Set([
    "completed",
    "evaluated",
    "submitted",
    "pending",
    "excellent",
    "good",
    "average",
    "poor",
]);

// The API sends "YYYY-MM-DD" or an ISO timestamp; tables and the modal show the date part only.
export const formatDate = (value?: string | null) => (value ? value.split("T")[0] : "-");

// InputField type="date" works with Date objects, while filters and the API use "YYYY-MM-DD".
export const toDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const [year, month, day] = value.split("T")[0].split("-").map(Number);
    return year && month && day ? new Date(year, month - 1, day) : null;
};

// Built from local parts: toISOString() would move the date back a day in timezones ahead of UTC.
export const toDateString = (date: Date | null) => {
    if (!date) return "";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
};

export const getBadgeClass = (value?: string | null) => {
    const key = (value || "").toLowerCase();
    return COLORED_BADGES.has(key) ? key : "neutral";
};

export const getPersonName = (person: any): string => {
    if (!person) return "";
    return typeof person === "string" ? person : person.full_name || person.name || "";
};

export const getSubjectName = (item: any): string =>
    item?.homework?.subject?.name || item?.subject_name || item?.subject?.name || "-";

export const getClassSection = (item: any): string => {
    const className = item?.homework?.class?.name || item?.class_name || item?.class?.name;
    const sectionName = item?.homework?.section?.name || item?.section_name || item?.section?.name;
    if (!className) return "-";
    return sectionName ? `${className} (${sectionName})` : className;
};

// Same convention as Profile.tsx: relative paths from the API are served from BASE_URL/public.
export const getFileUrl = (path?: string | null) => {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    const cleanPath = path.replace(/^\/+/, "");
    return cleanPath.startsWith("public/") ? `${BASE_URL}/${cleanPath}` : `${BASE_URL}/public/${cleanPath}`;
};

export const getFileName = (path: string) => {
    const name = path.split("?")[0].split("/").pop() || "Attachment";
    try {
        return decodeURIComponent(name);
    } catch {
        return name;
    }
};

export const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Average";
    return "Poor";
};
