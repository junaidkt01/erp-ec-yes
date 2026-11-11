import { useEffect, useState } from "react";
import { toast } from "sonner";
import PopupScreen from "../../components/PopupScreen/PopupScreen";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import { InputField } from "../../components/InputFields/InputFields";
import InputCheckbox from "../../components/InputCheckbox/InputCheckbox";
import {
    useFetchAllPermissions,
    useFetchRolePermissions,
    useSyncRolePermissions,
    useCreateRole,
    toPermissionArray,
    type Permission,
    type Role,
} from "../../hooks/useRolesAndAccess";

// GET /roles/{id}/permissions — same shapes as GET /permissions
const toPermissionList = (data: any, fallback: Permission[] = []): Permission[] => {
    const list = toPermissionArray(data);
    return list.length || data !== undefined ? list : fallback;
};

// Eye button — read-only list of the role's permissions
export const ViewRolePermissionsPopup = ({ role, onClose }: { role: Role; onClose: () => void }) => {
    const { data, isLoading, isError } = useFetchRolePermissions(role.id);
    const permissions = toPermissionList(data, role.permissions ?? []);

    console.log("ViewRolePermissionsPopup", data?.assigned_permissions, permissions, role)

    return (
        <PopupScreen title={`Permissions — ${role.display_name || role.name}`} onClick={onClose}>
            <div className="popup_body role_permissions_popup">
                {isLoading ? (
                    <p className="permissions_empty">Loading permissions...</p>
                ) : isError ? (
                    <p className="permissions_empty">Failed to load permissions.</p>
                ) : !data?.assigned_permissions?.length ? (
                    <p className="permissions_empty">No permissions assigned to this role.</p>
                ) : (
                    <ul className="permission_list">
                        {data?.assigned_permissions?.map((p: any) => (
                            <li key={p}>{p}</li>
                        ))}
                    </ul>
                )}

                <div className="buttons">
                    <SecondaryButton onClick={onClose} title="Close" />
                </div>
            </div>
        </PopupScreen>
    );
};

// export const EditRolePermissionsPopup = ({ role, onClose }: { role: Role; onClose: () => void }) => {
//     const { data: allPermissions = [], isLoading: allLoading, isError: allError } = useFetchAllPermissions();
//     const { data: roleData, isLoading: roleLoading, isError: roleError } = useFetchRolePermissions(role.id);
//     const syncMutation = useSyncRolePermissions();

//     const isLoading = allLoading || roleLoading;
//     const isError = allError || roleError;

//     const [selected, setSelected] = useState<Set<string>>(
//         () => new Set((role.permissions ?? []).map((p) => p.name))
//     );

//     // Once the role's current permissions arrive, use them as the starting selection
//     const [seeded, setSeeded] = useState(false);
//     if (!seeded && roleData !== undefined) {
//         setSeeded(true);
//         setSelected(new Set(toPermissionList(roleData, role.permissions ?? []).map((p) => p.name)));
//     }

//     const toggle = (name: string) => {
//         setSelected((prev) => {
//             const next = new Set(prev);
//             next.has(name) ? next.delete(name) : next.add(name);
//             return next;
//         });
//     };

//     const handleClose = () => {
//         if (!syncMutation.isPending) onClose();
//     };

//     const handleSave = async () => {
//         try {
//             await syncMutation.mutateAsync({ id: role.id, permissions: [...selected] });
//             toast.success("Permissions updated successfully");
//             onClose();
//         } catch (err: any) {
//             toast.error(err?.response?.data?.message || err?.message || "Failed to update permissions");
//         }
//     };

//     return (
//         <PopupScreen title={`Edit Permissions — ${role.display_name || role.name}`} onClick={handleClose}>
//             <div className="popup_body role_permissions_popup">
//                 {isLoading ? (
//                     <p className="permissions_empty">Loading permissions...</p>
//                 ) : isError ? (
//                     <p className="permissions_empty">Failed to load permissions.</p>
//                 ) : !allPermissions.length ? (
//                     <p className="permissions_empty">No permissions found.</p>
//                 ) : (
//                     <div className="checkbox_group permission_checkbox_grid">
//                         {allPermissions.map((p) => (
//                             <InputCheckbox
//                                 key={p.id}
//                                 label={p.name}
//                                 checked={selected.has(p.name)}
//                                 onChange={() => toggle(p.name)}
//                             />
//                         ))}
//                     </div>
//                 )}

//                 <div className="buttons">
//                     <SecondaryButton onClick={handleClose} title="Cancel" disable={syncMutation.isPending} />
//                     <PrimaryButton
//                         onClick={handleSave}
//                         disabled={syncMutation.isPending || isLoading || isError}
//                         isLoading={syncMutation.isPending}
//                         title={syncMutation.isPending ? "Saving..." : "Save"}
//                     />
//                 </div>
//             </div>
//         </PopupScreen>
//     );
// };



export const EditRolePermissionsPopup = ({ role, onClose, }: { role: Role; onClose: () => void; }) => {
    const { data: allPermissions = [], isLoading: allLoading, isError: allError } = useFetchAllPermissions();

    const { data: roleData, isLoading: roleLoading, isError: roleError } = useFetchRolePermissions(role.id);

    const syncMutation = useSyncRolePermissions();

    const [selected, setSelected] = useState<Set<string>>(new Set());

    const isLoading = allLoading || roleLoading;
    const isError = allError || roleError;

    // Extract ONLY permissions assigned to this role
    useEffect(() => {
        if (roleData === undefined) return;

        const assignedPermissions = Array.isArray(
            roleData?.assigned_permissions
        )
            ? roleData.assigned_permissions
            : [];

        const permissionNames = assignedPermissions
            .map((permission: any) =>
                typeof permission === "string"
                    ? permission
                    : permission?.name
            )
            .filter((name: any): name is string => typeof name === "string");

        setSelected(new Set(permissionNames));
    }, [roleData]);

    const toggle = (name: string) => {
        setSelected((prev) => {
            const next = new Set(prev);

            if (next.has(name)) {
                next.delete(name);
            } else {
                next.add(name);
            }

            return next;
        });
    };

    const handleClose = () => {
        if (!syncMutation.isPending) onClose();
    };

    const handleSave = async () => {
        try {
            await syncMutation.mutateAsync({
                id: role.id,
                permissions: [...selected],
            });

            toast.success("Permissions updated successfully");
            onClose();
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update permissions"
            );
        }
    };

    return (
        <PopupScreen
            title={`Edit Permissions — ${role.display_name || role.name}`}
            onClick={handleClose}
        >
            <div className="popup_body role_permissions_popup">
                {isLoading ? (
                    <p className="permissions_empty">
                        Loading permissions...
                    </p>
                ) : isError ? (
                    <p className="permissions_empty">
                        Failed to load permissions.
                    </p>
                ) : !allPermissions.length ? (
                    <p className="permissions_empty">
                        No permissions found.
                    </p>
                ) : (
                    <div className="checkbox_group permission_checkbox_grid">
                        {allPermissions.map((permission) => (
                            <InputCheckbox
                                key={permission.id}
                                label={permission.name}
                                checked={selected.has(permission.name)}
                                onChange={() => toggle(permission.name)}
                            />
                        ))}
                    </div>
                )}

                <div className="buttons">
                    <SecondaryButton
                        onClick={handleClose}
                        title="Cancel"
                        disable={syncMutation.isPending}
                    />

                    <PrimaryButton
                        onClick={handleSave}
                        disabled={
                            syncMutation.isPending ||
                            isLoading ||
                            isError
                        }
                        isLoading={syncMutation.isPending}
                        title={
                            syncMutation.isPending
                                ? "Saving..."
                                : "Save"
                        }
                    />
                </div>
            </div>
        </PopupScreen>
    );
};


// export const EditRolePermissionsPopup = ({ role, onClose }: { role: Role; onClose: () => void }) => {
//     const { data: allPermissions = [], isLoading: allLoading, isError: allError } = useFetchAllPermissions();
//     const { data: roleData, isLoading: roleLoading, isError: roleError } = useFetchRolePermissions(role.id);
//     const syncMutation = useSyncRolePermissions();

//     const isLoading = allLoading || roleLoading;
//     const isError = allError || roleError;

//     // Initialize selected with the role's current permissions
//     const [selected, setSelected] = useState<Set<string>>(
//         () => new Set(toPermissionList(roleData, role.permissions ?? []).map((p) => p.name))
//     );

//     // No need for separate seeding logic; initial state is set above
//     const toggle = (name: string) => {
//         setSelected((prev) => {
//             const next = new Set(prev);
//             next.has(name) ? next.delete(name) : next.add(name);
//             return next;
//         });
//     };

//     const handleClose = () => {
//         if (!syncMutation.isPending) onClose();
//     };

//     const handleSave = async () => {
//         try {
//             await syncMutation.mutateAsync({ id: role.id, permissions: [...selected] });
//             toast.success("Permissions updated successfully");
//             onClose();
//         } catch (err: any) {
//             toast.error(err?.response?.data?.message || err?.message || "Failed to update permissions");
//         }
//     };

//     return (
//         <PopupScreen title={`Edit Permissions — ${role.display_name || role.name}`} onClick={handleClose}>
//             <div className="popup_body role_permissions_popup">
//                 {isLoading ? (
//                     <p className="permissions_empty">Loading permissions...</p>
//                 ) : isError ? (
//                     <p className="permissions_empty">Failed to load permissions.</p>
//                 ) : !allPermissions.length ? (
//                     <p className="permissions_empty">No permissions found.</p>
//                 ) : (
//                     <div className="checkbox_group permission_checkbox_grid">
//                         {allPermissions.map((p) => (
//                             <InputCheckbox
//                                 key={p.id}
//                                 label={p.name}
//                                 checked={selected.has(p.name)}
//                                 onChange={() => toggle(p.name)}
//                             />
//                         ))}
//                     </div>
//                 )}

//                 <div className="buttons">
//                     <SecondaryButton onClick={handleClose} title="Cancel" disable={syncMutation.isPending} />
//                     <PrimaryButton
//                         onClick={handleSave}
//                         disabled={syncMutation.isPending || isLoading || isError}
//                         isLoading={syncMutation.isPending}
//                         title={syncMutation.isPending ? "Saving..." : "Save"}
//                     />
//                 </div>
//             </div>
//         </PopupScreen>
//     );
// };




export const AddRolePopup = ({ onClose }: { onClose: () => void }) => {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const { data: allPermissions = [], isLoading: permissionsLoading, isError: permissionsError } = useFetchAllPermissions();
    const createRoleMutation = useCreateRole();
    const syncMutation = useSyncRolePermissions();

    const isPending = createRoleMutation.isPending || syncMutation.isPending;

    const togglePermission = (permName: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(permName) ? next.delete(permName) : next.add(permName);
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selected.size === allPermissions.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(allPermissions.map((p) => p.name)));
        }
    };

    const handleClose = () => {
        if (!isPending) onClose();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError("Role name is required");
            return;
        }

        try {
            const permissionsList = Array.from(selected);
            const created = await createRoleMutation.mutateAsync({
                name: trimmedName,
                guard_name: "api",
                permissions: permissionsList,
            });

            // If permissions were selected and role ID is returned, sync permissions to guarantee assignment
            const newRoleId = created?.id ?? created?.data?.id;
            if (newRoleId && permissionsList.length > 0) {
                try {
                    await syncMutation.mutateAsync({
                        id: newRoleId,
                        permissions: permissionsList,
                    });
                } catch (syncErr) {
                    console.warn("Permissions sync notice:", syncErr);
                }
            }

            toast.success("Role added successfully");
            onClose();
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add role";
            toast.error(errorMsg);
        }
    };

    return (
        <PopupScreen title="Add Role" onClick={handleClose}>
            <div className="popup_body role_permissions_popup">
                <div className="fields_wrapper" style={{ display: "block", marginBottom: "20px" }}>
                    <div className="body_section">
                        <InputField
                            type="text"
                            label="Role Name *"
                            placeHolder="Enter role name"
                            value={name}
                            error={nameError}
                            onChange={(e: any) => {
                                const val = e?.target ? e.target.value : e;
                                setName(val);
                                if (nameError) setNameError("");
                            }}
                        />
                    </div>
                </div>

                <div className="permissions_section_header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: "15px", color: "#212121" }}>
                        Assign Permissions (Optional)
                    </p>
                    {allPermissions.length > 0 && (
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#2950DA",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: 500,
                                padding: "4px 8px",
                            }}
                        >
                            {selected.size === allPermissions.length ? "Deselect All" : "Select All"}
                        </button>
                    )}
                </div>

                {permissionsLoading ? (
                    <p className="permissions_empty">Loading permissions...</p>
                ) : permissionsError ? (
                    <p className="permissions_empty">Failed to load permissions.</p>
                ) : !allPermissions.length ? (
                    <p className="permissions_empty">No permissions found.</p>
                ) : (
                    <div
                        className="checkbox_group permission_checkbox_grid"
                        style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}
                    >
                        {allPermissions.map((p) => (
                            <InputCheckbox
                                key={p.id}
                                label={p.name}
                                checked={selected.has(p.name)}
                                onChange={() => togglePermission(p.name)}
                            />
                        ))}
                    </div>
                )}

                <div className="buttons" style={{ marginTop: "24px" }}>
                    <SecondaryButton onClick={handleClose} title="Cancel" disable={isPending} />
                    <PrimaryButton
                        onClick={handleSubmit}
                        disabled={isPending}
                        isLoading={isPending}
                        title={isPending ? "Saving..." : "Save Role"}
                    />
                </div>
            </div>
        </PopupScreen>
    );
};
