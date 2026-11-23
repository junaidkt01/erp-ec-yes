// src/pages/SidebarController/SidebarController.tsx

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import InputCheckbox from "../../components/InputCheckbox/InputCheckbox";
import { InputField } from "../../components/InputFields/InputFields";
import { CustomSelect } from "../../components/InputFields/CustomSelect";
import PopupScreen from "../../components/PopupScreen/PopupScreen";
import LoadingOverlay from "../../components/Loadingoverlay";
import TableWrapper from "../../components/TableWrapper";
import {
  useFetchRawSidebarMenus,
  useUpdateSidebarMenus,
  useCreateSidebarMenu,
  useUpdateSingleSidebarMenu,
  useDeleteSidebarMenu,
  useCreateSidebarSubMenu,
  useUpdateSidebarSubMenu,
  useDeleteSidebarSubMenu,
  parseIsActive,
  type RawSidebarMenuItem,
  type SubMenuItem,
  type CreateSidebarMenuPayload,
  type CreateSidebarSubMenuPayload,
} from "../../hooks/useSidebarMenus";
import { useFetchAllPermissions } from "../../hooks/useRolesAndAccess";
import "./SidebarController.scss";

interface GroupedSection {
  section: string;
  items: {
    menu: RawSidebarMenuItem;
    originalIndex: number;
  }[];
}

const initialMenuFormState: CreateSidebarMenuPayload = {
  section: "General",
  title: "",
  icon: "/sidebar/default.svg",
  path: "",
  order: 1,
  is_active: true,
  permission: "",
  permission_id: null,
};

interface SubMenuFormState {
  id?: number;
  sidebar_menu_id: number | string;
  title: string;
  path?: string;
  order?: number;
  is_active?: boolean;
  permission?: string | null;
  permission_id?: number | string | null;
}

const initialSubMenuFormState: SubMenuFormState = {
  sidebar_menu_id: 0,
  title: "",
  path: "",
  order: 1,
  is_active: true,
  permission: "",
  permission_id: null,
};

const SidebarController: React.FC = () => {
  const { data: rawMenus, isLoading, isError, refetch } = useFetchRawSidebarMenus();
  const { data: permissionsData, isLoading: isPermissionsLoading } = useFetchAllPermissions();

  const updateBatchMutation = useUpdateSidebarMenus();
  const createMenuMutation = useCreateSidebarMenu();
  const updateSingleMenuMutation = useUpdateSingleSidebarMenu();
  const deleteMenuMutation = useDeleteSidebarMenu();
  const createSubMenuMutation = useCreateSidebarSubMenu();
  const updateSubMenuMutation = useUpdateSidebarSubMenu();
  const deleteSubMenuMutation = useDeleteSidebarSubMenu();

  const [menus, setMenus] = useState<RawSidebarMenuItem[]>([]);
  const [initialMenus, setInitialMenus] = useState<RawSidebarMenuItem[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Modals state
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<RawSidebarMenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<CreateSidebarMenuPayload>(initialMenuFormState);
  const [menuErrors, setMenuErrors] = useState<{ [k: string]: string }>({});

  const [isSubMenuModalOpen, setIsSubMenuModalOpen] = useState(false);
  const [editingSubMenu, setEditingSubMenu] = useState<{ parentMenuId: number; sub: SubMenuItem } | null>(null);
  const [subMenuForm, setSubMenuForm] = useState<SubMenuFormState>(initialSubMenuFormState);
  const [subMenuErrors, setSubMenuErrors] = useState<{ [k: string]: string }>({});

  // Delete target confirmation states
  const [deleteTargetMenu, setDeleteTargetMenu] = useState<RawSidebarMenuItem | null>(null);
  const [deleteTargetSubMenu, setDeleteTargetSubMenu] = useState<{ parentTitle: string; parentMenuId: number; sub: SubMenuItem } | null>(null);

  // Initialize and normalize menu items on initial load
  useEffect(() => {
    if (rawMenus && Array.isArray(rawMenus)) {
      const normalized: RawSidebarMenuItem[] = rawMenus.map((item) => ({
        ...item,
        id: item.id,
        is_active: parseIsActive(item.is_active),
        permission: item.permission ?? item.permission_name ?? null,
        permission_id: item.permission_id ?? null,
        sub_menus: Array.isArray(item.sub_menus)
          ? item.sub_menus.map((sub: any) => ({
            ...sub,
            id: sub.id,
            title: typeof sub === "string" ? sub : (sub.title || ""),
            is_active: typeof sub === "string" ? true : parseIsActive(sub.is_active),
            permission: typeof sub === "object" ? (sub.permission ?? sub.permission_name ?? null) : null,
            permission_id: typeof sub === "object" ? (sub.permission_id ?? null) : null,
          }))
          : [],
      }));

      setMenus(normalized);
      setInitialMenus(JSON.parse(JSON.stringify(normalized)));
    }
  }, [rawMenus]);

  // Track if there are any uncommitted checkbox/toggle changes
  const isDirty = useMemo(() => {
    if (initialMenus.length === 0 && menus.length === 0) return false;
    return JSON.stringify(menus) !== JSON.stringify(initialMenus);
  }, [menus, initialMenus]);

  // Dropdown options for Permissions (derived from GET /api/permissions)
  const permissionOptions = useMemo(() => {
    const list = permissionsData || [];
    return [
      { label: "None (No permission required)", value: "" },
      ...list.map((p) => ({
        label: `${p.name} (ID: ${p.id})`,
        value: String(p.id),
      })),
    ];
  }, [permissionsData]);

  // Dropdown options for Sections
  const existingSections = useMemo(() => {
    const set = new Set<string>();
    menus.forEach((m) => {
      if (m.section) set.add(m.section);
    });
    return Array.from(set);
  }, [menus]);

  // Parent menu options for SubMenu creation/editing
  const parentMenuOptions = useMemo(() => {
    return menus.map((m) => ({
      label: `${m.section ? `[${m.section}] ` : ""}${m.title}`,
      value: m.id!,
    }));
  }, [menus]);

  // ── Toggle handlers ───────────────────────────────────────────────────────

  const handleToggleMenu = (originalIndex: number) => {
    setMenus((prev) => {
      const next = [...prev];
      const target = { ...next[originalIndex] };
      const nextActive = !target.is_active;
      target.is_active = nextActive;

      if (target.sub_menus && target.sub_menus.length > 0) {
        target.sub_menus = target.sub_menus.map((sub) => ({
          ...sub,
          is_active: nextActive,
        }));
      }

      next[originalIndex] = target;
      return next;
    });
  };

  const handleToggleSubMenu = (originalIndex: number, subIndex: number) => {
    setMenus((prev) => {
      const next = [...prev];
      const target = { ...next[originalIndex] };
      if (!target.sub_menus) return prev;

      const updatedSubMenus = target.sub_menus.map((sub, idx) => {
        if (idx === subIndex) {
          return { ...sub, is_active: !sub.is_active };
        }
        return sub;
      });

      target.sub_menus = updatedSubMenus;
      const hasAnyActiveSub = updatedSubMenus.some((sub) => sub.is_active);
      target.is_active = hasAnyActiveSub;

      next[originalIndex] = target;
      return next;
    });
  };

  const handleToggleSection = (originalIndices: number[]) => {
    const isAllActive = originalIndices.every((idx) => {
      const item = menus[idx];
      if (!item.is_active) return false;
      if (item.sub_menus && item.sub_menus.length > 0) {
        return item.sub_menus.every((s) => s.is_active);
      }
      return true;
    });

    const targetState = !isAllActive;

    setMenus((prev) => {
      const next = [...prev];
      originalIndices.forEach((idx) => {
        const item = { ...next[idx] };
        item.is_active = targetState;
        if (item.sub_menus && item.sub_menus.length > 0) {
          item.sub_menus = item.sub_menus.map((sub) => ({
            ...sub,
            is_active: targetState,
          }));
        }
        next[idx] = item;
      });
      return next;
    });
  };

  const handleSelectAll = () => {
    setMenus((prev) =>
      prev.map((item) => ({
        ...item,
        is_active: true,
        sub_menus: item.sub_menus?.map((sub) => ({
          ...sub,
          is_active: true,
        })),
      }))
    );
  };

  const handleDeselectAll = () => {
    setMenus((prev) =>
      prev.map((item) => ({
        ...item,
        is_active: false,
        sub_menus: item.sub_menus?.map((sub) => ({
          ...sub,
          is_active: false,
        })),
      }))
    );
  };

  const handleReset = () => {
    if (initialMenus.length > 0) {
      setMenus(JSON.parse(JSON.stringify(initialMenus)));
      toast.info("Changes reset to original state");
    }
  };

  // Submit batch checkbox/status updates
  const handleSubmitBatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isDirty) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateBatchMutation.mutateAsync({
        menus,
        initialMenus,
      });
      setInitialMenus(JSON.parse(JSON.stringify(menus)));
      toast.success("Sidebar settings updated successfully");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update sidebar settings"
      );
    }
  };

  // ── Menu Modal Handlers ───────────────────────────────────────────────────

  const handleOpenAddMenu = () => {
    setEditingMenu(null);
    setMenuForm({
      ...initialMenuFormState,
      section: existingSections[0] || "General",
      order: menus.length + 1,
    });
    setMenuErrors({});
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (menu: RawSidebarMenuItem) => {
    setEditingMenu(menu);
    setMenuForm({
      section: menu.section || "General",
      title: menu.title || "",
      icon: menu.icon || "/sidebar/default.svg",
      path: menu.path || "",
      order: menu.order ?? 1,
      is_active: parseIsActive(menu.is_active),
      permission: menu.permission || "",
      permission_id: menu.permission_id ? String(menu.permission_id) : "",
    });
    setMenuErrors({});
    setIsMenuModalOpen(true);
  };

  const handleCloseMenuModal = () => {
    setIsMenuModalOpen(false);
    setEditingMenu(null);
    setMenuForm(initialMenuFormState);
    setMenuErrors({});
  };

  const handleSaveMenu = async () => {
    const errs: { [k: string]: string } = {};
    if (!menuForm.title.trim()) errs.title = "Title is required";
    if (!menuForm.path.trim()) errs.path = "Path is required";
    if (!menuForm.section.trim()) errs.section = "Section is required";

    if (Object.keys(errs).length > 0) {
      setMenuErrors(errs);
      return;
    }

    const payload = {
      section: menuForm.section.trim(),
      title: menuForm.title.trim(),
      icon: menuForm.icon?.trim() || "/sidebar/default.svg",
      path: menuForm.path.trim(),
      order: Number(menuForm.order) || 1,
      is_active: Boolean(menuForm.is_active),
      permission: menuForm.permission ? String(menuForm.permission).trim() : null,
      permission_id: menuForm.permission_id ? Number(menuForm.permission_id) : null,
    };

    try {
      if (editingMenu && editingMenu.id) {
        await updateSingleMenuMutation.mutateAsync({
          id: editingMenu.id,
          ...payload,
        });
        toast.success("Menu updated successfully");
      } else {
        await createMenuMutation.mutateAsync(payload);
        toast.success("Menu created successfully");
      }
      handleCloseMenuModal();
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save menu"
      );
    }
  };

  // ── SubMenu Modal Handlers ────────────────────────────────────────────────

  const handleOpenAddSubMenu = (parentMenuId?: number) => {
    setEditingSubMenu(null);
    setSubMenuForm({
      ...initialSubMenuFormState,
      sidebar_menu_id: parentMenuId || (menus[0]?.id ?? 0),
      order: 1,
    });
    setSubMenuErrors({});
    setIsSubMenuModalOpen(true);
  };

  const handleOpenEditSubMenu = (parentMenuId: number, sub: SubMenuItem) => {
    setEditingSubMenu({ parentMenuId, sub });
    setSubMenuForm({
      sidebar_menu_id: parentMenuId,
      title: sub.title || "",
      path: sub.path || "",
      order: sub.order ?? 1,
      is_active: parseIsActive(sub.is_active),
      permission: sub.permission || "",
      permission_id: sub.permission_id ? String(sub.permission_id) : "",
    });
    setSubMenuErrors({});
    setIsSubMenuModalOpen(true);
  };

  const handleCloseSubMenuModal = () => {
    setIsSubMenuModalOpen(false);
    setEditingSubMenu(null);
    setSubMenuForm(initialSubMenuFormState);
    setSubMenuErrors({});
  };

  const handleSaveSubMenu = async () => {
    const errs: { [k: string]: string } = {};
    if (!subMenuForm.title.trim()) errs.title = "Submenu title is required";
    if (!subMenuForm.sidebar_menu_id) errs.sidebar_menu_id = "Parent menu is required";

    if (Object.keys(errs).length > 0) {
      setSubMenuErrors(errs);
      return;
    }

    const payload: CreateSidebarSubMenuPayload = {
      sidebar_menu_id: Number(subMenuForm.sidebar_menu_id),
      title: subMenuForm.title.trim(),
      path: subMenuForm.path?.trim() || undefined,
      order: Number(subMenuForm.order) || 1,
      is_active: Boolean(subMenuForm.is_active),
      permission: subMenuForm.permission ? String(subMenuForm.permission).trim() : null,
      permission_id: subMenuForm.permission_id ? Number(subMenuForm.permission_id) : null,
    };

    try {
      if (editingSubMenu && editingSubMenu.sub.id) {
        // PUT /api/sidebar-sub-menus/{id}
        await updateSubMenuMutation.mutateAsync({
          id: editingSubMenu.sub.id,
          ...payload,
        });
        toast.success("Submenu updated successfully");
      } else {
        // POST /api/sidebar-sub-menus
        await createSubMenuMutation.mutateAsync(payload);
        toast.success("Submenu created successfully");
      }
      handleCloseSubMenuModal();
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to save submenu"
      );
    }
  };

  // ── Delete Handlers ───────────────────────────────────────────────────────

  const handleConfirmDeleteMenu = async () => {
    if (!deleteTargetMenu?.id) return;
    try {
      await deleteMenuMutation.mutateAsync(deleteTargetMenu.id);
      toast.success("Menu deleted successfully");
      setDeleteTargetMenu(null);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete menu"
      );
    }
  };

  const handleConfirmDeleteSubMenu = async () => {
    if (!deleteTargetSubMenu?.sub?.id) {
      toast.error("Submenu ID not found");
      return;
    }

    try {
      // DELETE /api/sidebar-sub-menus/{id}
      await deleteSubMenuMutation.mutateAsync(deleteTargetSubMenu.sub.id);
      toast.success("Submenu deleted successfully");
      setDeleteTargetSubMenu(null);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete submenu"
      );
    }
  };

  // ── Grouped sections with search ──────────────────────────────────────────

  const groupedSections = useMemo(() => {
    const map = new Map<string, { menu: RawSidebarMenuItem; originalIndex: number }[]>();

    menus.forEach((menu, index) => {
      if (searchValue.trim()) {
        const q = searchValue.trim().toLowerCase();
        const sectionMatch = (menu.section || "").toLowerCase().includes(q);
        const titleMatch = (menu.title || "").toLowerCase().includes(q);
        const permMatch = (menu.permission || "").toLowerCase().includes(q);
        const subMatch = menu.sub_menus?.some(
          (sub) =>
            (sub.title || "").toLowerCase().includes(q) ||
            (sub.permission || "").toLowerCase().includes(q)
        );

        if (!sectionMatch && !titleMatch && !subMatch && !permMatch) {
          return;
        }
      }

      const sectionName = menu.section || "General";
      if (!map.has(sectionName)) {
        map.set(sectionName, []);
      }
      map.get(sectionName)!.push({ menu, originalIndex: index });
    });

    const result: GroupedSection[] = [];
    map.forEach((items, section) => {
      result.push({ section, items });
    });

    return result;
  }, [menus, searchValue]);

  const totalMenusCount = menus.length;
  const activeMenusCount = useMemo(() => {
    return menus.filter((m) => m.is_active).length;
  }, [menus]);

  const isSavingBatch = updateBatchMutation.isPending;

  return (
    <div className="page_wrapper">
      <div className="sidebar_controller_page">
        {/* ── Add / Edit Menu Modal ─────────────────────────────────────────── */}
        {isMenuModalOpen && (
          <PopupScreen
            title={editingMenu ? `Edit Menu: ${editingMenu.title}` : "Add New Menu"}
            onClick={handleCloseMenuModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <InputField
                    type="text"
                    label="Menu Title *"
                    placeHolder="e.g. Academics, Library"
                    value={menuForm.title}
                    error={menuErrors.title}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setMenuForm((prev) => ({ ...prev, title: val }));
                      if (menuErrors.title) setMenuErrors((prev) => ({ ...prev, title: "" }));
                    }}
                  />
                  <InputField
                    type="text"
                    label="Section *"
                    placeHolder="e.g. General, Administration, Academic"
                    value={menuForm.section}
                    error={menuErrors.section}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setMenuForm((prev) => ({ ...prev, section: val }));
                      if (menuErrors.section) setMenuErrors((prev) => ({ ...prev, section: "" }));
                    }}
                  />
                </div>

                <div className="body_section">
                  <InputField
                    type="text"
                    label="Path / Route *"
                    placeHolder="e.g. /academics/subjects"
                    value={menuForm.path}
                    error={menuErrors.path}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setMenuForm((prev) => ({ ...prev, path: val }));
                      if (menuErrors.path) setMenuErrors((prev) => ({ ...prev, path: "" }));
                    }}
                  />
                  <InputField
                    type="text"
                    label="Icon Path"
                    placeHolder="e.g. /sidebar/academics.svg"
                    value={menuForm.icon}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setMenuForm((prev) => ({ ...prev, icon: val }));
                    }}
                  />
                </div>

                <div className="body_section">
                  <CustomSelect
                    label="Required Permission"
                    placeholder={
                      isPermissionsLoading ? "Loading permissions..." : "Select permission"
                    }
                    value={menuForm.permission_id ? String(menuForm.permission_id) : ""}
                    options={permissionOptions}
                    onChange={(val) => {
                      const selected = permissionsData?.find(
                        (p) => String(p.id) === String(val)
                      );
                      setMenuForm((prev) => ({
                        ...prev,
                        permission_id: selected ? selected.id : null,
                        permission: selected ? selected.name : null,
                      }));
                    }}
                  />
                  <InputField
                    type="number"
                    label="Order"
                    placeHolder="e.g. 1"
                    value={menuForm.order}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setMenuForm((prev) => ({ ...prev, order: Number(val) }));
                    }}
                  />
                </div>

                <div className="body_section">
                  <InputCheckbox
                    checked={Boolean(menuForm.is_active)}
                    onChange={() =>
                      setMenuForm((prev) => ({ ...prev, is_active: !prev.is_active }))
                    }
                    label="Menu Active (Visible in sidebar)"
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Cancel" onClick={handleCloseMenuModal} />
                <PrimaryButton
                  title={
                    createMenuMutation.isPending || updateSingleMenuMutation.isPending
                      ? "Saving..."
                      : editingMenu
                        ? "Update Menu"
                        : "Create Menu"
                  }
                  onClick={handleSaveMenu}
                  disabled={
                    createMenuMutation.isPending || updateSingleMenuMutation.isPending
                  }
                  isLoading={
                    createMenuMutation.isPending || updateSingleMenuMutation.isPending
                  }
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* ── Add / Edit SubMenu Modal ──────────────────────────────────────── */}
        {isSubMenuModalOpen && (
          <PopupScreen
            title={
              editingSubMenu
                ? `Edit Submenu: ${editingSubMenu.sub.title}`
                : "Add New Submenu"
            }
            onClick={handleCloseSubMenuModal}
          >
            <div className="popup_body">
              <div className="fields_wrapper">
                <div className="body_section">
                  <CustomSelect
                    label="Parent Menu *"
                    placeholder="Select parent menu"
                    value={subMenuForm.sidebar_menu_id}
                    options={parentMenuOptions}
                    error={subMenuErrors.sidebar_menu_id}
                    onChange={(val) => {
                      setSubMenuForm((prev) => ({
                        ...prev,
                        sidebar_menu_id: Number(val),
                      }));
                      if (subMenuErrors.sidebar_menu_id) {
                        setSubMenuErrors((prev) => ({ ...prev, sidebar_menu_id: "" }));
                      }
                    }}
                  />
                  <InputField
                    type="text"
                    label="Submenu Title *"
                    placeHolder="e.g. Time Tables, Assign Subject"
                    value={subMenuForm.title}
                    error={subMenuErrors.title}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setSubMenuForm((prev) => ({ ...prev, title: val }));
                      if (subMenuErrors.title) {
                        setSubMenuErrors((prev) => ({ ...prev, title: "" }));
                      }
                    }}
                  />
                </div>

                <div className="body_section">
                  <InputField
                    type="text"
                    label="Submenu Path"
                    placeHolder="e.g. timetable or /academics/timetable"
                    value={subMenuForm.path}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setSubMenuForm((prev) => ({ ...prev, path: val }));
                    }}
                  />
                  <InputField
                    type="number"
                    label="Order"
                    placeHolder="e.g. 1"
                    value={subMenuForm.order}
                    onChange={(e: any) => {
                      const val = e?.target ? e.target.value : e;
                      setSubMenuForm((prev) => ({ ...prev, order: Number(val) }));
                    }}
                  />
                </div>

                <div className="body_section">
                  <CustomSelect
                    label="Required Permission"
                    placeholder={
                      isPermissionsLoading ? "Loading permissions..." : "Select permission"
                    }
                    value={
                      subMenuForm.permission_id
                        ? String(subMenuForm.permission_id)
                        : ""
                    }
                    options={permissionOptions}
                    onChange={(val) => {
                      const selected = permissionsData?.find(
                        (p) => String(p.id) === String(val)
                      );
                      setSubMenuForm((prev) => ({
                        ...prev,
                        permission_id: selected ? selected.id : null,
                        permission: selected ? selected.name : null,
                      }));
                    }}
                  />
                  <InputCheckbox
                    checked={Boolean(subMenuForm.is_active)}
                    onChange={() =>
                      setSubMenuForm((prev) => ({
                        ...prev,
                        is_active: !prev.is_active,
                      }))
                    }
                    label="Submenu Active (Visible)"
                  />
                </div>
              </div>

              <div className="buttons">
                <SecondaryButton title="Cancel" onClick={handleCloseSubMenuModal} />
                <PrimaryButton
                  title={
                    createSubMenuMutation.isPending || updateSubMenuMutation.isPending
                      ? "Saving..."
                      : editingSubMenu
                        ? "Update Submenu"
                        : "Create Submenu"
                  }
                  onClick={handleSaveSubMenu}
                  disabled={
                    createSubMenuMutation.isPending || updateSubMenuMutation.isPending
                  }
                  isLoading={
                    createSubMenuMutation.isPending || updateSubMenuMutation.isPending
                  }
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* ── Delete Menu Confirmation Modal ───────────────────────────────── */}
        {deleteTargetMenu && (
          <PopupScreen
            title={`Delete Menu: ${deleteTargetMenu.title}`}
            onClick={() => setDeleteTargetMenu(null)}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to permanently delete the menu{" "}
                  <strong>"{deleteTargetMenu.title}"</strong> and all its submenus?
                </p>
              </div>
              <div className="buttons">
                <SecondaryButton
                  title="Cancel"
                  onClick={() => setDeleteTargetMenu(null)}
                  disable={deleteMenuMutation.isPending}
                />
                <PrimaryButton
                  title={deleteMenuMutation.isPending ? "Deleting..." : "Delete Menu"}
                  onClick={handleConfirmDeleteMenu}
                  disabled={deleteMenuMutation.isPending}
                  isLoading={deleteMenuMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* ── Delete SubMenu Confirmation Modal ────────────────────────────── */}
        {deleteTargetSubMenu && (
          <PopupScreen
            title={`Delete Submenu: ${deleteTargetSubMenu.sub.title}`}
            onClick={() => setDeleteTargetSubMenu(null)}
          >
            <div className="popup_body">
              <div className="body_section">
                <p>
                  Are you sure you want to delete the submenu{" "}
                  <strong>"{deleteTargetSubMenu.sub.title}"</strong> from{" "}
                  <strong>"{deleteTargetSubMenu.parentTitle}"</strong>?
                </p>
              </div>
              <div className="buttons">
                <SecondaryButton
                  title="Cancel"
                  onClick={() => setDeleteTargetSubMenu(null)}
                  disable={deleteSubMenuMutation.isPending}
                />
                <PrimaryButton
                  title={
                    deleteSubMenuMutation.isPending ? "Deleting..." : "Delete Submenu"
                  }
                  onClick={handleConfirmDeleteSubMenu}
                  disabled={deleteSubMenuMutation.isPending}
                  isLoading={deleteSubMenuMutation.isPending}
                />
              </div>
            </div>
          </PopupScreen>
        )}

        {/* ── Main Content Screen ───────────────────────────────────────────── */}
        <TableWrapper
          title="Sidebar Settings"
          isSearchBar
          searchValue={searchValue}
          searchOnchange={setSearchValue}
        >
          {isLoading && <LoadingOverlay isLoading={true} />}

          {isError && menus.length === 0 && !isLoading && (
            <div className="controller_error_container">
              <p className="error_message">Failed to load sidebar configuration.</p>
              <PrimaryButton title="Retry" onClick={() => refetch()} />
            </div>
          )}

          {!isLoading && menus.length === 0 && !isError && (
            <div className="controller_empty_container">
              <p className="empty_message">No sidebar menus available to configure.</p>
              <PrimaryButton title="Add First Menu" onClick={handleOpenAddMenu} />
            </div>
          )}

          {menus.length > 0 && (
            <div className="search_screen">
              {/* Header Toolbar */}
              <div className="controller_toolbar">
                <div className="toolbar_stats">
                  <span className="stats_badge active">
                    {activeMenusCount} Active / {totalMenusCount} Total Menus
                  </span>
                  {isDirty && (
                    <span className="stats_badge unsaved">Unsaved Status Changes</span>
                  )}
                </div>

                <div className="toolbar_actions">
                  <button
                    type="button"
                    className="toolbar_action_btn add_menu_btn"
                    onClick={handleOpenAddMenu}
                  >
                    + Add Menu
                  </button>
                  <button
                    type="button"
                    className="toolbar_action_btn"
                    onClick={() => handleOpenAddSubMenu()}
                  >
                    + Add Submenu
                  </button>
                  <button
                    type="button"
                    className="toolbar_action_btn"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="toolbar_action_btn"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Sections list */}
              {groupedSections.length === 0 ? (
                <div className="controller_no_results">
                  <p>No sidebar menus match "{searchValue}"</p>
                </div>
              ) : (
                groupedSections.map((group) => {
                  const sectionIndices = group.items.map((i) => i.originalIndex);
                  const isAllSectionActive = sectionIndices.every((idx) => {
                    const item = menus[idx];
                    if (!item.is_active) return false;
                    if (item.sub_menus && item.sub_menus.length > 0) {
                      return item.sub_menus.every((s) => s.is_active);
                    }
                    return true;
                  });

                  return (
                    <div className="section_container" key={group.section}>
                      {/* Section Header */}
                      <div className="search_screen_title need_margin section_header_row">
                        <span className="section_title_text">{group.section}</span>
                        <div className="section_header_actions">
                          <button
                            type="button"
                            className="section_toggle_btn"
                            onClick={() => handleToggleSection(sectionIndices)}
                          >
                            {isAllSectionActive ? "Deselect Section" : "Select Section"}
                          </button>
                        </div>
                      </div>

                      {/* Cards list for this section */}
                      <div className="popup_body">
                        {group.items.map(({ menu, originalIndex }) => (
                          <div
                            className="fields_wrapper menu_controller_card"
                            key={menu.id ?? menu.title}
                          >
                            {/* Menu Header Row */}
                            <div className="menu_header_row">
                              <div className="menu_header_left">
                                <InputCheckbox
                                  checked={!!menu.is_active}
                                  onChange={() => handleToggleMenu(originalIndex)}
                                  label=""
                                />
                                <span className="menu_title_label">{menu.title}</span>
                                {menu.path && (
                                  <span className="menu_path_tag">{menu.path}</span>
                                )}

                                {/* Permission Badge */}
                                {menu.permission ? (
                                  <span
                                    className="perm_badge"
                                    title={`Permission ID: ${menu.permission_id || "N/A"}`}
                                  >
                                    {/* <span className="perm_lock">🔒</span> */}
                                    {menu.permission}
                                    {menu.permission_id && (
                                      <span className="perm_id">#{menu.permission_id}</span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="perm_badge unassigned">
                                    No Permission
                                  </span>
                                )}
                              </div>

                              <div className="menu_header_actions">
                                <button
                                  type="button"
                                  className="add_sub_mini_btn"
                                  title="Add Submenu to this menu"
                                  onClick={() => handleOpenAddSubMenu(menu.id)}
                                >
                                  + Submenu
                                </button>
                                <button
                                  type="button"
                                  className="action_btn edit_btn"
                                  title="Edit Menu"
                                  onClick={() => handleOpenEditMenu(menu)}
                                >
                                  <img src="/svgs/edit.svg" alt="Edit" />
                                </button>
                                <button
                                  type="button"
                                  className="action_btn delete_btn"
                                  title="Delete Menu"
                                  onClick={() => setDeleteTargetMenu(menu)}
                                >
                                  <img src="/svgs/delete.svg" alt="Delete" />
                                </button>
                              </div>
                            </div>

                            {/* Submenus section */}
                            {menu.sub_menus && menu.sub_menus.length > 0 && (
                              <div className="submenu_grid">
                                {menu.sub_menus.map((sub, subIndex) => (
                                  <div
                                    key={sub.id || sub.title || subIndex}
                                    className="submenu_item_card"
                                  >
                                    <div className="sub_left">
                                      <InputCheckbox
                                        checked={!!sub.is_active}
                                        onChange={() =>
                                          handleToggleSubMenu(originalIndex, subIndex)
                                        }
                                        label=""
                                      />
                                      <span className="sub_title_label">
                                        {sub.title}
                                      </span>

                                      {/* Submenu Permission Badge */}
                                      {sub.permission ? (
                                        <span
                                          className="perm_badge sub_perm"
                                          title={`Permission ID: ${sub.permission_id || "N/A"}`}
                                        >
                                          {/* <span className="perm_lock">🔒</span> */}
                                          {sub.permission}
                                          {sub.permission_id && (
                                            <span className="perm_id">
                                              #{sub.permission_id}
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        <span className="perm_badge sub_perm unassigned">
                                          Public
                                        </span>
                                      )}
                                    </div>

                                    <div className="sub_actions">
                                      <button
                                        type="button"
                                        className="action_btn sub_action_btn"
                                        title="Edit Submenu"
                                        onClick={() =>
                                          handleOpenEditSubMenu(menu.id!, sub)
                                        }
                                      >
                                        <img src="/svgs/edit.svg" alt="Edit" />
                                      </button>
                                      <button
                                        type="button"
                                        className="action_btn sub_action_btn delete_sub_btn"
                                        title="Delete Submenu"
                                        onClick={() =>
                                          setDeleteTargetSubMenu({
                                            parentTitle: menu.title,
                                            parentMenuId: menu.id!,
                                            sub,
                                          })
                                        }
                                      >
                                        <img src="/svgs/delete.svg" alt="Delete" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Action Buttons for batch status changes */}
              <div className="popup_body buttons_section">
                <div className="buttons">
                  <SecondaryButton
                    title="Reset"
                    onClick={handleReset}
                    disable={isSavingBatch || !isDirty}
                  />
                  <PrimaryButton
                    title={isSavingBatch ? "Saving..." : "Save Status Changes"}
                    type="button"
                    onClick={handleSubmitBatch}
                    isLoading={isSavingBatch}
                    disabled={isSavingBatch || !isDirty}
                  />
                </div>
              </div>
            </div>
          )}
        </TableWrapper>
      </div>
    </div>
  );
};

export default SidebarController;
