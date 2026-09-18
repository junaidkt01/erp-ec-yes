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

export const STAFF_CATEGORY_OPTIONS: SelectOption[] = [
  { label: "Teacher", value: "Teacher", id: "Teacher" },
  { label: "Parent", value: "Parent", id: "Parent" },
  { label: "Others", value: "Others", id: "Others" },
];

export const SCHOOLS_STATES: SelectOption[] = [
  { label: "Andhra Pradesh", value: "Andhra Pradesh", id: "Andhra Pradesh" },
  { label: "Bihar", value: "Bihar", id: "Bihar" },
  { label: "Jammu & Kashmir", value: "Jammu & Kashmir", id: "Jammu & Kashmir" },
  { label: "Karnataka", value: "Karnataka", id: "Karnataka" },
  { label: "Kerala", value: "Kerala", id: "Kerala" },
  { label: "Maharashtra", value: "Maharashtra", id: "Maharashtra" },
  { label: "Rajasthan", value: "Rajasthan", id: "Rajasthan" },
  { label: "West Bengal", value: "West Bengal", id: "West Bengal" },
];

export const SCHOOLS_ZONE: SelectOption[] = [
  { label: "Doda", value: "doda", id: "doda" },
  { label: "Jammu", value: "jammu", id: "jammu" },
  { label: "Mandi", value: "mandi", id: "mandi" },
  { label: "Maharashtra", value: "maharashtra", id: "maharashtra" },
  { label: "Mender", value: "mender", id: "mender" },
  { label: "Northeast", value: "northeast", id: "northeast" },
  { label: "Poonch", value: "poonch", id: "poonch" },
  { label: "Rajouri", value: "rajouri", id: "rajouri" },
  { label: "Rajasthan", value: "rajasthan", id: "rajasthan" },
  { label: "South", value: "south", id: "south" },
  { label: "Srinagar", value: "srinagar", id: "srinagar" },
  { label: "Surankote", value: "surankote", id: "surankote" },
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
