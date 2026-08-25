export interface SelectOption {
  label: string;
  value: string;
  id?: string | number;
}

export const GENDER_OPTIONS: SelectOption[] = [
  { label: "Male", value: "male", id: "male" },
  { label: "Female", value: "female", id: "female" },
  { label: "Other", value: "other", id: "other" },
];

export const RELIGION_OPTIONS: SelectOption[] = [
  { label: "Muslim", value: "Muslim", id: "Muslim" },
  { label: "Hindu", value: "Hindu", id: "Hindu" },
  { label: "Christian", value: "Christian", id: "Christian" },
];

export const BLOOD_GROUP_OPTIONS: SelectOption[] = [
  { label: "A+", value: "A+", id: "A+" },
  { label: "O+", value: "O+", id: "O+" },
  { label: "B+", value: "B+", id: "B+" },
  { label: "AB+", value: "AB+", id: "AB+" },
  { label: "A-", value: "A-", id: "A-" },
  { label: "O-", value: "O-", id: "O-" },
  { label: "B-", value: "B-", id: "B-" },
  { label: "AB-", value: "AB-", id: "AB-" },
];

export const GUARDIAN_RELATION_OPTIONS: SelectOption[] = [
  { label: "Father", value: "father", id: "father" },
  { label: "Mother", value: "mother", id: "mother" },
  { label: "Other", value: "other", id: "other" },
];

export const SIBLING_STAFF_OPTIONS: SelectOption[] = [
  { label: "From Sibling", value: "from_sibling", id: "from_sibling" },
  { label: "From Staff", value: "from_staff", id: "from_staff" },
];

export const ROUTE_OPTIONS: SelectOption[] = [
  { label: "Pending", value: "Pending" },
  { label: "Solved", value: "Solved" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
];

export const HOSTEL_ROOM_OPTIONS: SelectOption[] = [
  { label: "Pending", value: "Pending" },
  { label: "Solved", value: "Solved" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
];

/**
 * Format options array into instruction description string dynamically
 */
export const formatOptionInstruction = (
  options: SelectOption[],
  includeValueKey = false
): string => {
  if (includeValueKey) {
    return options.map((opt) => `${opt.value}=${opt.label}`).join(", ");
  }
  return options.map((opt) => opt.label).join(", ");
};

/**
 * Resolve input value or ID from Excel back to normalized option value
 */
export const resolveOptionValue = (val: any, options: SelectOption[]): string => {
  if (val === null || val === undefined || val === "") return "";
  const strVal = String(val).trim().toLowerCase();

  const matched = options.find(
    (opt) =>
      opt.label.toLowerCase() === strVal ||
      opt.value.toLowerCase() === strVal ||
      String(opt.id).toLowerCase() === strVal
  );

  return matched ? matched.value : String(val);
};
