import { useState } from "react";
import { toast } from "sonner";
import PopupScreen from "../../components/PopupScreen/PopupScreen";
import { PrimaryButton, SecondaryButton } from "../../components/Buttons/Buttons";
import { InputField } from "../../components/InputFields/InputFields";
import {
    useCreatePermission,
    useUpdatePermission,
    useDeletePermission,
    type Permission,
} from "../../hooks/useRolesAndAccess";

interface AddPermissionPopupProps {
    onClose: () => void;
}

export const AddPermissionPopup = ({ onClose }: AddPermissionPopupProps) => {
    const [name, setName] = useState("");
    const [guardName, setGuardName] = useState("web");
    const [nameError, setNameError] = useState("");

    const createMutation = useCreatePermission();

    const handleClose = () => {
        if (!createMutation.isPending) onClose();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setNameError("Permission name is required");
            return;
        }

        try {
            await createMutation.mutateAsync({
                name: trimmed,
                guard_name: guardName.trim() || "web",
            });
            toast.success("Permission added successfully");
            onClose();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to add permission";
            toast.error(msg);
        }
    };

    return (
        <PopupScreen title="Add Permission" onClick={handleClose}>
            <div className="popup_body role_permissions_popup">
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                    <div className="body_section">
                        <InputField
                            type="text"
                            label="Permission Name *"
                            placeHolder="e.g. manage_fee, edit_student"
                            value={name}
                            error={nameError}
                            onChange={(e: any) => {
                                const val = e?.target ? e.target.value : e;
                                setName(val);
                                if (nameError) setNameError("");
                            }}
                        />
                    </div>

                    <div className="body_section">
                        <InputField
                            type="text"
                            label="Guard Name"
                            placeHolder="web (default)"
                            value={guardName}
                            onChange={(e: any) => {
                                const val = e?.target ? e.target.value : e;
                                setGuardName(val);
                            }}
                        />
                    </div>

                    <div className="buttons" style={{ marginTop: "12px" }}>
                        <SecondaryButton
                            onClick={handleClose}
                            title="Cancel"
                            disable={createMutation.isPending}
                        />
                        <PrimaryButton
                            type="submit"
                            disabled={createMutation.isPending}
                            isLoading={createMutation.isPending}
                            title={createMutation.isPending ? "Adding..." : "Add Permission"}
                        />
                    </div>
                </form>
            </div>
        </PopupScreen>
    );
};

interface EditPermissionPopupProps {
    permission: Permission;
    onClose: () => void;
}

export const EditPermissionPopup = ({ permission, onClose }: EditPermissionPopupProps) => {
    const [name, setName] = useState(permission.name || "");
    const [guardName, setGuardName] = useState(permission.guard_name || "web");
    const [nameError, setNameError] = useState("");

    const updateMutation = useUpdatePermission();

    const handleClose = () => {
        if (!updateMutation.isPending) onClose();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setNameError("Permission name is required");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                id: permission.id,
                name: trimmed,
                guard_name: guardName.trim() || "web",
            });
            toast.success("Permission updated successfully");
            onClose();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to update permission";
            toast.error(msg);
        }
    };

    return (
        <PopupScreen title="Edit Permission" onClick={handleClose}>
            <div className="popup_body role_permissions_popup">
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                    <div className="body_section">
                        <InputField
                            type="text"
                            label="Permission Name *"
                            placeHolder="e.g. manage_fee"
                            value={name}
                            error={nameError}
                            onChange={(e: any) => {
                                const val = e?.target ? e.target.value : e;
                                setName(val);
                                if (nameError) setNameError("");
                            }}
                        />
                    </div>

                    <div className="body_section">
                        <InputField
                            type="text"
                            label="Guard Name"
                            placeHolder="web (default)"
                            value={guardName}
                            onChange={(e: any) => {
                                const val = e?.target ? e.target.value : e;
                                setGuardName(val);
                            }}
                        />
                    </div>

                    <div className="buttons" style={{ marginTop: "12px" }}>
                        <SecondaryButton
                            onClick={handleClose}
                            title="Cancel"
                            disable={updateMutation.isPending}
                        />
                        <PrimaryButton
                            type="submit"
                            disabled={updateMutation.isPending}
                            isLoading={updateMutation.isPending}
                            title={updateMutation.isPending ? "Updating..." : "Update Permission"}
                        />
                    </div>
                </form>
            </div>
        </PopupScreen>
    );
};

interface DeletePermissionPopupProps {
    permission: Permission;
    onClose: () => void;
}

export const DeletePermissionPopup = ({ permission, onClose }: DeletePermissionPopupProps) => {
    const deleteMutation = useDeletePermission();

    const handleClose = () => {
        if (!deleteMutation.isPending) onClose();
    };

    const handleConfirm = async () => {
        try {
            await deleteMutation.mutateAsync(permission.id);
            toast.success("Permission deleted successfully");
            onClose();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete permission";
            toast.error(msg);
        }
    };

    return (
        <PopupScreen title="Delete Permission" onClick={handleClose}>
            <div className="popup_body">
                <div className="body_section">
                    <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#212121" }}>
                        Are you sure you want to delete permission <strong>"{permission.name}"</strong>?
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#8a8894" }}>
                        This will permanently remove the permission from the system, including any assigned roles and users.
                    </p>
                </div>

                <div className="buttons" style={{ marginTop: "20px" }}>
                    <SecondaryButton
                        onClick={handleClose}
                        title="Cancel"
                        disable={deleteMutation.isPending}
                    />
                    <PrimaryButton
                        onClick={handleConfirm}
                        disabled={deleteMutation.isPending}
                        isLoading={deleteMutation.isPending}
                        title={deleteMutation.isPending ? "Deleting..." : "Delete"}
                    />
                </div>
            </div>
        </PopupScreen>
    );
};
