export interface SubMenuItem {
  title: string;
  is_active: boolean;
}

export interface RawSidebarMenuItem {
  id?: number;
  section: string;
  title: string;
  icon: string;
  path: string;
  sub_menus?: SubMenuItem[];
  permission?: string | null;
  order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SidebarMenuItem {
  title: string;
  icon: string;
  path: string;
  sub_menus?: SubMenuItem[];
}

export interface SidebarMenuGroup {
  title: string;
  menus: SidebarMenuItem[];
}

/**
 * Converts flat backend menu items (with `section` field) into grouped SidebarMenuGroup[]
 */
export const formatSidebarMenus = (
  rawItems: (RawSidebarMenuItem | SidebarMenuGroup)[]
): SidebarMenuGroup[] => {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return [];
  }

  // If already in grouped format, return directly
  const first = rawItems[0] as any;
  if (first && "menus" in first && Array.isArray(first.menus)) {
    return rawItems as SidebarMenuGroup[];
  }

  const items = rawItems as RawSidebarMenuItem[];

  // Filter active and sort by order
  const activeItems = items
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const groupMap = new Map<string, SidebarMenuItem[]>();

  for (const item of activeItems) {
    const sectionName = item.section || "General";
    if (!groupMap.has(sectionName)) {
      groupMap.set(sectionName, []);
    }

    const menuItem: SidebarMenuItem = {
      title: item.title,
      icon: item.icon,
      path: item.path,
    };

    if (item.sub_menus && Array.isArray(item.sub_menus)) {
      menuItem.sub_menus = item.sub_menus.map((sub_menu: any) => ({
        title: typeof sub_menu === "string" ? sub_menu : sub_menu.title,
        is_active: typeof sub_menu === "string" ? true : sub_menu.is_active !== false,
      }));
    }

    groupMap.get(sectionName)!.push(menuItem);
  }

  return Array.from(groupMap.entries()).map(([title, menus]) => ({
    title,
    menus,
  }));
};


// export const sidebar_menus: SidebarMenuGroup[] = [
//   {
//     title: "Administration",
//     menus: [
//       {
//         title: "Admin Section",
//         icon: "/sidebar_icons/admin_section.svg",
//         path: "/admin-section",

//         sub_menus: [
//           "Admission Query",
//           "Complaint",
//           "Postal Receive",
//           "Postal Dispatch",
//           "Phone Call Log",
//           "Admin Setup",
//           "ID Card",
//           "Certificate",
//           "Generate Certificate",
//           "Generate ID Card",
//         ],
//       },
//       {
//         title: "Academics",
//         icon: "/sidebar_icons/academics.svg",
//         path: "/academics",

//         sub_menus: [
//           "Optional Subject",
//           "Section",
//           "Class",
//           "Subjects",
//           "Assign Class Teacher",
//           "Assign Subject",
//           "Class Room ",
//           "Class Routine",
//         ],
//       },
//       {
//         title: "Study Material",
//         icon: "/sidebar_icons/study_material.svg",
//         path: "/study-material",

//         sub_menus: [
//           "Upload Content",
//           "Assignment",
//           "Syllabus",
//           "Other Downloads",
//         ],
//       },
//       {
//         title: "Lesson Plan",
//         icon: "/sidebar_icons/lesson_plan.svg",
//         path: "/lesson-plan",
//       },
//       {
//         title: "Bulk Print",
//         icon: "/sidebar_icons/bulk_print.svg",
//         path: "/bulk-print",
//       },
//       {
//         title: "Download Center",
//         icon: "/sidebar_icons/download_center.svg",
//         path: "/download-center",

//         sub_menus: [
//           "Content Type",
//           "Content List",
//           "Shared Content List",
//           "Video List",
//         ],
//       },
//     ],
//   },
//   {
//     title: "Student",
//     menus: [
//       {
//         title: "Student Info",
//         icon: "/sidebar_icons/student_info.svg",
//         path: "/student-info",

//         sub_menus: [
//           "Student Category",
//           "Add Student",
//           "Student List",
//           "Multi Class Student",
//           "Delete Student Record",
//           "Unassigned Student",
//           "Student Attendance",
//           "Student Group",
//           "Student Promote",
//           "Disabled Students",
//           "Subject Wise Attendance",
//           "Student Export",
//           "SMS Sending Time",
//           "Student Settings",
//         ],
//       },
//       {
//         title: "Remarks Point",
//         icon: "/sidebar_icons/behaviour_records.svg",
//         path: "/behaviour-records",

//         sub_menus: [
//           "Incidents",
//           "Assign Incident",
//           "Student Incident Report",
//           "Remarks Report",
//           // "Behaviour Report",
//           "Incident Wise report",
//           "Settings",
//         ],
//       },
//       {
//         title: "Fees",
//         icon: "/sidebar_icons/fees.svg",
//         path: "/fees",

//         sub_menus: [
//           "Fees Group",
//           "Fees Type",
//           "Fees Invoice",
//           "Bank Payment",
//           "Fees Carry Forward",
//         ],
//       },
//       {
//         title: "Home Work",
//         icon: "/sidebar_icons/home_work.svg",
//         path: "/home-work",
//       },
//       {
//         title: "Library",
//         icon: "/sidebar_icons/library.svg",
//         path: "/library",
//       },
//       {
//         title: "Transport",
//         icon: "/sidebar_icons/transport.svg",
//         path: "/transport",
//       },
//       {
//         title: "YES Garden",
//         icon: "/sidebar_icons/dormitory.svg",
//         path: "/dormitory",
//       },
//     ],
//   },
//   {
//     title: "HR",
//     menus: [
//       {
//         title: "Human Resource",
//         icon: "/sidebar_icons/admin_section.svg",
//         path: "/human-resource",

//         sub_menus: ["Add Staff", "Staff List"],
//       },
//     ],
//   },

//   {
//     title: "Exam",
//     menus: [
//       {
//         title: "Examination",
//         icon: "/sidebar_icons/examination.svg",
//         path: "/examination",
//       },
//       {
//         title: "Exam Plan",
//         icon: "/sidebar_icons/exam_plan.svg",
//         path: "/exam-plan",
//       },
//       {
//         title: "Online Exam",
//         icon: "/sidebar_icons/online_exam.svg",
//         path: "/online_exam",
//       },
//     ],
//   },

//   {
//     title: "Settings Section",
//     menus: [
//       {
//         title: "General Settings",
//         icon: "/sidebar_icons/examination.svg",
//         path: "/settings-section",

//         sub_menus: ["General Settings"],
//       },
//     ],
//   },
// ];
