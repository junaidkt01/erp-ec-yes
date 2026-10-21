import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import InputCheckbox from "../../components/InputCheckbox/InputCheckbox";
import LoadingOverlay from "../../components/Loadingoverlay";
import TableWrapper from "../../components/TableWrapper";
import {
  useFetchRawSidebarMenus,
  useUpdateSidebarMenus,
  type RawSidebarMenuItem,
} from "../../hooks/useSidebarMenus";
import "./SidebarController.scss";

interface GroupedSection {
  section: string;
  items: {
    menu: RawSidebarMenuItem;
    originalIndex: number;
  }[];
}

const SidebarController: React.FC = () => {
  const { data: rawMenus, isLoading, isError, refetch } = useFetchRawSidebarMenus();
  const updateMutation = useUpdateSidebarMenus();

  const [menus, setMenus] = useState<RawSidebarMenuItem[]>([]);
  const [initialMenus, setInitialMenus] = useState<RawSidebarMenuItem[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Initialize and normalize menu items on initial load
  useEffect(() => {
    if (rawMenus && Array.isArray(rawMenus)) {
      const normalized: RawSidebarMenuItem[] = rawMenus.map((item) => ({
        ...item,
        is_active: item.is_active !== false,
        sub_menus: Array.isArray(item.sub_menus)
          ? item.sub_menus.map((sub: any) => ({
              title: typeof sub === "string" ? sub : (sub.title || ""),
              is_active: typeof sub === "string" ? true : sub.is_active !== false,
            }))
          : [],
      }));

      // Set state if first time or if not dirty
      setMenus(normalized);
      setInitialMenus(normalized);
    }
  }, [rawMenus]);

  // Track if there are any uncommitted changes
  const isDirty = useMemo(() => {
    if (initialMenus.length === 0 && menus.length === 0) return false;
    return JSON.stringify(menus) !== JSON.stringify(initialMenus);
  }, [menus, initialMenus]);

  // Toggle parent menu item and cascade to all its submenus
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

  // Toggle individual submenu item
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

      // If at least one submenu is active, parent menu must be active
      const hasAnyActiveSub = updatedSubMenus.some((sub) => sub.is_active);
      target.is_active = hasAnyActiveSub;

      next[originalIndex] = target;
      return next;
    });
  };

  // Toggle all items and submenus in an entire section
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

  // Select all menus and submenus globally
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

  // Deselect all menus and submenus globally
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

  // Reset to initial server state
  const handleReset = () => {
    if (initialMenus.length > 0) {
      setMenus(JSON.parse(JSON.stringify(initialMenus)));
      toast.info("Changes reset to original state");
    }
  };

  // Submit updated sidebar configuration
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      await updateMutation.mutateAsync(menus);
      setInitialMenus(JSON.parse(JSON.stringify(menus)));
      toast.success("Sidebar settings updated successfully");
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update sidebar settings";
      toast.error(errorMsg);
    }
  };

  // Group items by section and apply search filter
  const groupedSections = useMemo(() => {
    const map = new Map<string, { menu: RawSidebarMenuItem; originalIndex: number }[]>();

    menus.forEach((menu, index) => {
      if (searchValue.trim()) {
        const q = searchValue.trim().toLowerCase();
        const sectionMatch = (menu.section || "").toLowerCase().includes(q);
        const titleMatch = (menu.title || "").toLowerCase().includes(q);
        const subMatch = menu.sub_menus?.some((sub) =>
          (sub.title || "").toLowerCase().includes(q)
        );

        if (!sectionMatch && !titleMatch && !subMatch) {
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

  // Summary counts
  const totalMenusCount = menus.length;
  const activeMenusCount = useMemo(() => {
    return menus.filter((m) => m.is_active).length;
  }, [menus]);

  return (
    <div className="page_wrapper">
      <div className="sidebar_controller_page">
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
            </div>
          )}

          {menus.length > 0 && (
            <div className="search_screen">
              {/* Header Toolbar */}
              <div className="controller_toolbar">
                <div className="toolbar_stats">
                  <span className="stats_badge active">
                    {activeMenusCount} Active / {totalMenusCount} Total
                  </span>
                  {isDirty && (
                    <span className="stats_badge unsaved">Unsaved Changes</span>
                  )}
                </div>

                <div className="toolbar_actions">
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
                      {/* SECTION */}
                      <div className="search_screen_title need_margin section_header_row">
                        <span className="section_title_text">{group.section}</span>
                        <button
                          type="button"
                          className="section_toggle_btn"
                          onClick={() => handleToggleSection(sectionIndices)}
                        >
                          {isAllSectionActive ? "Deselect Section" : "Select Section"}
                        </button>
                      </div>

                      <div className="popup_body">
                        {group.items.map(({ menu, originalIndex }) => (
                          <div
                            className="fields_wrapper menu_controller_card"
                            key={menu.id ?? menu.title}
                          >
                            {/* TITLE NAME BY DYNAMIC */}
                            <p className="search_screen_title menu_title_item">
                              <InputCheckbox
                                checked={!!menu.is_active}
                                onChange={() => handleToggleMenu(originalIndex)}
                                label={menu.title}
                              />
                            </p>

                            {/* SUB MENUS NAME BY DYNAMIC */}
                            {menu.sub_menus && menu.sub_menus.length > 0 && (
                              <div className="body_section submenu_checkbox_group">
                                {menu.sub_menus.map((sub, subIndex) => (
                                  <div
                                    key={sub.title || subIndex}
                                    className="submenu_checkbox_item"
                                  >
                                    <InputCheckbox
                                      checked={!!sub.is_active}
                                      onChange={() =>
                                        handleToggleSubMenu(originalIndex, subIndex)
                                      }
                                      label={sub.title}
                                    />
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

              {/* Action Buttons */}
              <div className="popup_body buttons_section">
                <div className="buttons">
                  <SecondaryButton
                    title="Reset"
                    onClick={handleReset}
                    disable={updateMutation.isPending || !isDirty}
                  />
                  <PrimaryButton
                    title={updateMutation.isPending ? "Saving..." : "Submit"}
                    type="button"
                    onClick={handleSubmit}
                    isLoading={updateMutation.isPending}
                    disabled={updateMutation.isPending}
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