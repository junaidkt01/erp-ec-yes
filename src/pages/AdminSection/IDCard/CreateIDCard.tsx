import React, { useState, useRef } from "react";
import { 
    ArrowLeft, 
    UploadCloud, 
    Edit2, 
    Sparkles, 
    FileText, 
    X,
    Link2,
    Unlink,
    Move,
    Sliders,
    CornerUpLeft,
    Palette
} from "lucide-react";
import { toast } from "sonner";
import type { 
    IDCardConfig, 
    ApplicableUserType, 
    CardFieldsConfig,
    TextColorsConfig
} from "./types";
import { DEFAULT_ID_CONFIG } from "./types";
import IDCardPreview, { type SelectableElementId } from "./IDCardPreview";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";

interface CreateIDCardProps {
    onBack: () => void;
    onSaveSuccess?: (savedConfig: IDCardConfig) => void;
    initialConfig?: IDCardConfig;
}

export const CreateIDCard: React.FC<CreateIDCardProps> = ({
    onBack,
    onSaveSuccess,
    initialConfig = DEFAULT_ID_CONFIG,
}) => {
    const [config, setConfig] = useState<IDCardConfig>(initialConfig);
    const [selectedProfileId, setSelectedProfileId] = useState<string>("1");
    const [activeElement, setActiveElement] = useState<SelectableElementId | null>("photo");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isDraggingBg, setIsDraggingBg] = useState<boolean>(false);
    const [isDraggingLogo, setIsDraggingLogo] = useState<boolean>(false);
    const [isDraggingSig, setIsDraggingSig] = useState<boolean>(false);

    const bgInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const sigInputRef = useRef<HTMLInputElement>(null);

    // Helpers to update config
    const updateConfig = <K extends keyof IDCardConfig>(key: K, value: IDCardConfig[K]) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const updateSpacing = (key: keyof IDCardConfig["spacing"], val: number) => {
        setConfig((prev) => ({
            ...prev,
            spacing: { ...prev.spacing, [key]: val },
        }));
    };

    const toggleField = (fieldKey: keyof CardFieldsConfig) => {
        setConfig((prev) => ({
            ...prev,
            fields: {
                ...prev.fields,
                [fieldKey]: !prev.fields[fieldKey],
            },
        }));
    };

    const setAllFields = (val: boolean) => {
        setConfig((prev) => {
            const nextFields: CardFieldsConfig = { ...prev.fields };
            (Object.keys(nextFields) as (keyof CardFieldsConfig)[]).forEach((k) => {
                nextFields[k] = val;
            });
            return { ...prev, fields: nextFields };
        });
    };

    // Radius updates for each side
    const updateCornerRadius = (corner: "topLeft" | "topRight" | "bottomRight" | "bottomLeft", val: number) => {
        const num = Math.max(0, Math.min(50, val));
        if (config.photoRadius.isLinked) {
            setConfig((prev) => ({
                ...prev,
                photoStyle: "custom",
                photoRadius: {
                    ...prev.photoRadius,
                    topLeft: num,
                    topRight: num,
                    bottomRight: num,
                    bottomLeft: num,
                },
            }));
        } else {
            setConfig((prev) => ({
                ...prev,
                photoStyle: "custom",
                photoRadius: {
                    ...prev.photoRadius,
                    [corner]: num,
                },
            }));
        }
    };

    const toggleRadiusLink = () => {
        setConfig((prev) => ({
            ...prev,
            photoRadius: {
                ...prev.photoRadius,
                isLinked: !prev.photoRadius.isLinked,
            },
        }));
    };

    const applyShapePreset = (preset: "round" | "square" | "rounded" | "leaf" | "teardrop") => {
        if (preset === "round") {
            setConfig((prev) => ({
                ...prev,
                photoStyle: "round",
                photoRadius: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50, isLinked: true },
            }));
        } else if (preset === "square") {
            setConfig((prev) => ({
                ...prev,
                photoStyle: "square",
                photoRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, isLinked: true },
            }));
        } else if (preset === "rounded") {
            setConfig((prev) => ({
                ...prev,
                photoStyle: "custom",
                photoRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12, isLinked: true },
            }));
        } else if (preset === "leaf") {
            setConfig((prev) => ({
                ...prev,
                photoStyle: "custom",
                photoRadius: { topLeft: 50, topRight: 0, bottomRight: 50, bottomLeft: 0, isLinked: false },
            }));
        } else if (preset === "teardrop") {
            setConfig((prev) => ({
                ...prev,
                photoStyle: "custom",
                photoRadius: { topLeft: 50, topRight: 50, bottomRight: 0, bottomLeft: 50, isLinked: false },
            }));
        }
    };

    // Text color updates
    const updateTextColor = (key: keyof TextColorsConfig, color: string) => {
        setConfig((prev) => ({
            ...prev,
            textColors: {
                ...prev.textColors,
                [key]: color,
            },
        }));
    };

    const updateElementColor = (elementKey: string, color: string) => {
        setConfig((prev) => ({
            ...prev,
            elementColors: {
                ...prev.elementColors,
                [elementKey]: color,
            },
        }));
    };

    const applyColorTheme = (theme: "navy" | "purple" | "emerald" | "charcoal" | "maroon") => {
        if (theme === "navy") {
            setConfig((prev) => ({
                ...prev,
                textColors: {
                    primaryText: "#12255d",
                    labelColor: "#2b3658",
                    valueColor: "#1f2937",
                    headerTextColor: "#ffffff",
                },
                elementColors: {},
            }));
            toast.info("Applied Classic Navy color scheme");
        } else if (theme === "purple") {
            setConfig((prev) => ({
                ...prev,
                textColors: {
                    primaryText: "#4338ca",
                    labelColor: "#605dec",
                    valueColor: "#1e1b4b",
                    headerTextColor: "#ffffff",
                },
                elementColors: {},
            }));
            toast.info("Applied Royal Purple color scheme");
        } else if (theme === "emerald") {
            setConfig((prev) => ({
                ...prev,
                textColors: {
                    primaryText: "#065f46",
                    labelColor: "#047857",
                    valueColor: "#064e3b",
                    headerTextColor: "#ffffff",
                },
                elementColors: {},
            }));
            toast.info("Applied Emerald Green color scheme");
        } else if (theme === "charcoal") {
            setConfig((prev) => ({
                ...prev,
                textColors: {
                    primaryText: "#111827",
                    labelColor: "#374151",
                    valueColor: "#1f2937",
                    headerTextColor: "#ffffff",
                },
                elementColors: {},
            }));
            toast.info("Applied Dark Charcoal color scheme");
        } else if (theme === "maroon") {
            setConfig((prev) => ({
                ...prev,
                textColors: {
                    primaryText: "#831843",
                    labelColor: "#9d174d",
                    valueColor: "#500724",
                    headerTextColor: "#ffffff",
                },
                elementColors: {},
            }));
            toast.info("Applied Crimson Maroon color scheme");
        }
    };

    // Fine-tune position via input
    const updateSelectedPos = (axis: "x" | "y", val: number) => {
        if (!activeElement) return;
        const current = config.elementPositions[activeElement] || { x: 0, y: 0 };
        setConfig((prev) => ({
            ...prev,
            elementPositions: {
                ...prev.elementPositions,
                [activeElement]: {
                    ...current,
                    [axis]: val,
                },
            },
        }));
    };

    const resetCurrentElementPos = () => {
        if (!activeElement) return;
        setConfig((prev) => {
            const nextPositions = { ...prev.elementPositions };
            delete nextPositions[activeElement];
            return { ...prev, elementPositions: nextPositions };
        });
        toast.info(`Reset position for ${activeElement}`);
    };

    // File Handlers
    const handleFileUpload = (
        file: File, 
        target: "bgImage" | "logo" | "signature"
    ) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload a valid image file (PNG, JPG, JPEG)");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file size should be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            updateConfig(target, result);
            toast.success(`${target === "bgImage" ? "Background" : target === "logo" ? "Logo" : "Signature"} uploaded`);
        };
        reader.readAsDataURL(file);
    };

    // Preset Sizes
    const applySizePreset = (preset: "cr80_p" | "cr80_l" | "large_p") => {
        if (preset === "cr80_p") {
            setConfig((prev) => ({
                ...prev,
                layout: "portrait",
                pageWidth: 54,
                pageHeight: 85.6,
            }));
            toast.info("Applied CR-80 Standard Portrait (54 × 85.6 mm)");
        } else if (preset === "cr80_l") {
            setConfig((prev) => ({
                ...prev,
                layout: "landscape",
                pageWidth: 85.6,
                pageHeight: 54,
            }));
            toast.info("Applied CR-80 Standard Landscape (85.6 × 54 mm)");
        } else {
            setConfig((prev) => ({
                ...prev,
                layout: "portrait",
                pageWidth: 57,
                pageHeight: 89,
            }));
            toast.info("Applied Standard Card (57 × 89 mm)");
        }
    };

    // Template Presets
    const applyTemplatePreset = (role: ApplicableUserType) => {
        if (role === "Student") {
            setConfig(DEFAULT_ID_CONFIG);
            setSelectedProfileId("1");
            toast.info("Loaded Student ID Card template");
        } else if (role === "Staff") {
            setConfig((prev) => ({
                ...prev,
                title: "Staff & Faculty ID Card",
                applicableUser: "Staff",
                fields: {
                    admissionNo: true,
                    name: true,
                    class: true,
                    fatherName: false,
                    motherName: false,
                    address: true,
                    dob: true,
                    bloodGroup: true,
                    phone: true,
                    idNo: true,
                    qrCode: true,
                },
            }));
            setSelectedProfileId("3");
            toast.info("Loaded Staff & Faculty template");
        } else {
            setConfig((prev) => ({
                ...prev,
                title: `${role} Pass`,
                applicableUser: role,
            }));
        }
    };

    const handleReset = () => {
        setConfig(DEFAULT_ID_CONFIG);
        toast.info("ID Card template reset to default");
    };

    const handleSave = () => {
        if (!config.title.trim()) {
            toast.error("Please provide an ID Card title");
            return;
        }

        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("ID Card template saved successfully!");
            if (onSaveSuccess) {
                onSaveSuccess(config);
            }
        }, 800);
    };

    const activePos = activeElement ? config.elementPositions[activeElement] || { x: 0, y: 0 } : { x: 0, y: 0 };

    return (
        <div className="id_card_designer_wrapper">
            {/* Top Navigation & Breadcrumb Bar */}
            <div className="designer_nav_bar">
                <div className="nav_left_group">
                    <button 
                        type="button" 
                        onClick={onBack} 
                        className="btn_back_to_list"
                        title="Return to ID Card Templates List"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to ID Cards</span>
                    </button>
                    <span className="breadcrumb_separator">/</span>
                    <span className="breadcrumb_current">Create New ID Card</span>
                </div>

                <div className="nav_right_presets">
                    <span className="preset_label">
                        <Sparkles size={14} className="sparkle_icon" />
                        Quick Templates:
                    </span>
                    <button 
                        type="button" 
                        className={`preset_chip ${config.applicableUser === "Student" ? "active" : ""}`}
                        onClick={() => applyTemplatePreset("Student")}
                    >
                        Student ID
                    </button>
                    <button 
                        type="button" 
                        className={`preset_chip ${config.applicableUser === "Staff" ? "active" : ""}`}
                        onClick={() => applyTemplatePreset("Staff")}
                    >
                        Staff / Faculty
                    </button>
                    <button 
                        type="button" 
                        className={`preset_chip ${config.applicableUser === "Visitor" ? "active" : ""}`}
                        onClick={() => applyTemplatePreset("Visitor")}
                    >
                        Visitor Pass
                    </button>
                </div>
            </div>

            {/* Split Screen Designer Grid */}
            <div className="id_card_split_grid">
                {/* Left Column: Create ID Card Form */}
                <div className="id_card_form_card">
                    <div className="card_section_header">
                        <h2 className="main_section_title">Create ID Card</h2>
                        <span className="section_caption">Fully customizable draggable layout, photo resizing & corner radius</span>
                    </div>

                    <form 
                        className="designer_form_content" 
                        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                    >
                        {/* Row 1: ID Card Title & Admin Layout */}
                        <div className="form_row title_and_layout_row">
                            <div className="input_field_box title_box">
                                <label className="field_label_text">
                                    ID Card Title <span className="req_asterisk">*</span>
                                </label>
                                <div className="input_with_icon">
                                    <input 
                                        type="text" 
                                        value={config.title}
                                        onChange={(e) => updateConfig("title", e.target.value)}
                                        placeholder="e.g. Student ID Card"
                                        className="styled_text_input"
                                        required
                                    />
                                    <FileText size={16} className="trailing_icon" />
                                </div>
                            </div>

                            <div className="input_field_box layout_box">
                                <label className="field_label_text">Admin Layout</label>
                                <div className="layout_segmented_group">
                                    {/* Portrait Toggle */}
                                    <button 
                                        type="button" 
                                        className={`layout_toggle_btn ${config.layout === "portrait" ? "active" : ""}`}
                                        onClick={() => updateConfig("layout", "portrait")}
                                        title="Portrait Orientation (Vertical)"
                                    >
                                        <div className="icon_portrait_badge">
                                            <div className="badge_avatar_dot"></div>
                                            <div className="badge_line"></div>
                                        </div>
                                        <span className="layout_name">Portrait</span>
                                    </button>

                                    {/* Landscape Toggle */}
                                    <button 
                                        type="button" 
                                        className={`layout_toggle_btn ${config.layout === "landscape" ? "active" : ""}`}
                                        onClick={() => updateConfig("layout", "landscape")}
                                        title="Landscape Orientation (Horizontal)"
                                    >
                                        <div className="icon_landscape_badge">
                                            <div className="badge_avatar_dot"></div>
                                            <div className="badge_line"></div>
                                        </div>
                                        <span className="layout_name">Landscape</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Background Image Dropzone */}
                        <div className="form_row">
                            <div className="input_field_box full_width">
                                <div className="label_with_actions">
                                    <label className="field_label_text">Background Image</label>
                                    {config.bgImage && (
                                        <button 
                                            type="button" 
                                            className="text_clear_btn"
                                            onClick={() => updateConfig("bgImage", null)}
                                        >
                                            <X size={12} /> Clear Background
                                        </button>
                                    )}
                                </div>

                                <input 
                                    type="file" 
                                    ref={bgInputRef} 
                                    accept="image/png,image/jpeg,image/jpg" 
                                    className="hidden_file_input"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "bgImage");
                                    }}
                                />

                                <div 
                                    className={`dropzone_container ${isDraggingBg ? "drag_active" : ""} ${config.bgImage ? "has_file" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingBg(true); }}
                                    onDragLeave={() => setIsDraggingBg(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDraggingBg(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) handleFileUpload(file, "bgImage");
                                    }}
                                    onClick={() => bgInputRef.current?.click()}
                                >
                                    {config.bgImage ? (
                                        <div className="dropzone_uploaded_preview">
                                            <img src={config.bgImage} alt="Uploaded Background" className="bg_thumb_img" />
                                            <div className="file_meta_info">
                                                <p className="file_name">Custom Background Applied</p>
                                                <span className="file_hint">Click to replace or drag new file</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="dropzone_content">
                                            <div className="drop_icon_wrap">
                                                <UploadCloud size={24} className="cloud_icon" />
                                            </div>
                                            <p className="drop_primary_text">
                                                Drag and Drop File here <span className="link_text">Choose File</span>
                                            </p>
                                            <p className="drop_secondary_text">(JPG, JPEG, PNG, are allowed for upload)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Applicable User Dropdown */}
                        <div className="form_row">
                            <div className="input_field_box full_width">
                                <label className="field_label_text">Applicable User</label>
                                <select 
                                    value={config.applicableUser}
                                    onChange={(e) => {
                                        const role = e.target.value as ApplicableUserType;
                                        applyTemplatePreset(role);
                                    }}
                                    className="styled_select_input"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Staff">Staff / Faculty</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Visitor">Visitor / Guest</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 4: Page Layout Width & Height */}
                        <div className="form_row dimensions_row">
                            <div className="input_field_box">
                                <div className="label_with_actions">
                                    <label className="field_label_text">Page Layout Width</label>
                                    <span className="unit_tag">MM</span>
                                </div>
                                <div className="input_with_edit_icon">
                                    <input 
                                        type="number" 
                                        value={config.pageWidth}
                                        onChange={(e) => updateConfig("pageWidth", Number(e.target.value) || 0)}
                                        step="0.5"
                                        min="30"
                                        max="150"
                                        className="styled_text_input"
                                    />
                                    <span className="unit_suffix">MM</span>
                                    <Edit2 size={15} className="edit_pencil_icon" />
                                </div>
                            </div>

                            <div className="input_field_box">
                                <div className="label_with_actions">
                                    <label className="field_label_text">Page Layout Height</label>
                                    <span className="unit_tag">MM</span>
                                </div>
                                <div className="input_with_edit_icon">
                                    <input 
                                        type="number" 
                                        value={config.pageHeight}
                                        onChange={(e) => updateConfig("pageHeight", Number(e.target.value) || 0)}
                                        step="0.5"
                                        min="30"
                                        max="150"
                                        className="styled_text_input"
                                    />
                                    <span className="unit_suffix">MM</span>
                                    <Edit2 size={15} className="edit_pencil_icon" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Presets Bar */}
                        <div className="size_presets_quick_bar">
                            <span className="quick_lbl">Standards:</span>
                            <button type="button" onClick={() => applySizePreset("cr80_p")}>CR-80 Portrait (54×85.6)</button>
                            <button type="button" onClick={() => applySizePreset("cr80_l")}>CR-80 Landscape (85.6×54)</button>
                            <button type="button" onClick={() => applySizePreset("large_p")}>Standard (57×89)</button>
                        </div>

                        {/* Row 5: Profile Photo Style & User Photo Width / Height & Corner Radius Customization */}
                        <div className="form_section_group">
                            <div className="section_header_with_toggle_all">
                                <label className="field_label_text">Profile Photo & Custom Corner Radius</label>
                                <span className="interactive_pill_badge">Drag Corners & Handles on Card</span>
                            </div>

                            <div className="photo_style_segmented">
                                <button 
                                    type="button" 
                                    className={`photo_style_btn ${config.photoRadius.topLeft === 0 && config.photoRadius.topRight === 0 ? "active" : ""}`}
                                    onClick={() => applyShapePreset("square")}
                                >
                                    <div className="shape_icon_square"></div>
                                    <span>Square (0px)</span>
                                </button>
                                <button 
                                    type="button" 
                                    className={`photo_style_btn ${config.photoRadius.topLeft >= 50 ? "active" : ""}`}
                                    onClick={() => applyShapePreset("round")}
                                >
                                    <div className="shape_icon_round"></div>
                                    <span>Round (50%)</span>
                                </button>
                            </div>

                            {/* 4 Corner Radiuses Customization (Each Side Draggable / Configurable) */}
                            <div className="radius_customizer_box">
                                <div className="radius_box_header">
                                    <div className="rad_title_wrap">
                                        <Sliders size={13} className="rad_icon" />
                                        <span>Per-Corner Radius (Each Side):</span>
                                    </div>
                                    <div className="rad_actions">
                                        <button 
                                            type="button" 
                                            className={`link_radius_btn ${config.photoRadius.isLinked ? "linked" : ""}`}
                                            onClick={toggleRadiusLink}
                                            title={config.photoRadius.isLinked ? "All 4 corners linked together. Click to unlink." : "Corners independent. Click to link all 4."}
                                        >
                                            {config.photoRadius.isLinked ? <Link2 size={13} /> : <Unlink size={13} />}
                                            <span>{config.photoRadius.isLinked ? "Linked" : "Independent"}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="radius_corners_grid">
                                    <div className="corner_rad_item">
                                        <span className="corner_label">Top-Left</span>
                                        <input 
                                            type="number" 
                                            value={config.photoRadius.topLeft}
                                            onChange={(e) => updateCornerRadius("topLeft", Number(e.target.value) || 0)}
                                            min="0"
                                            max="50"
                                            className="rad_number_input"
                                        />
                                    </div>
                                    <div className="corner_rad_item">
                                        <span className="corner_label">Top-Right</span>
                                        <input 
                                            type="number" 
                                            value={config.photoRadius.topRight}
                                            onChange={(e) => updateCornerRadius("topRight", Number(e.target.value) || 0)}
                                            min="0"
                                            max="50"
                                            className="rad_number_input"
                                        />
                                    </div>
                                    <div className="corner_rad_item">
                                        <span className="corner_label">Bottom-Right</span>
                                        <input 
                                            type="number" 
                                            value={config.photoRadius.bottomRight}
                                            onChange={(e) => updateCornerRadius("bottomRight", Number(e.target.value) || 0)}
                                            min="0"
                                            max="50"
                                            className="rad_number_input"
                                        />
                                    </div>
                                    <div className="corner_rad_item">
                                        <span className="corner_label">Bottom-Left</span>
                                        <input 
                                            type="number" 
                                            value={config.photoRadius.bottomLeft}
                                            onChange={(e) => updateCornerRadius("bottomLeft", Number(e.target.value) || 0)}
                                            min="0"
                                            max="50"
                                            className="rad_number_input"
                                        />
                                    </div>
                                </div>

                                <div className="shape_pills_shortcuts">
                                    <span className="shortcuts_title">Quick Shapes:</span>
                                    <button type="button" onClick={() => applyShapePreset("rounded")}>Rounded (12px)</button>
                                    <button type="button" onClick={() => applyShapePreset("leaf")}>Leaf (50%/0%)</button>
                                    <button type="button" onClick={() => applyShapePreset("teardrop")}>Teardrop</button>
                                </div>
                            </div>

                            {/* Photo Dimensions */}
                            <div className="photo_dimensions_grid">
                                <div className="input_field_box">
                                    <div className="label_with_actions">
                                        <label className="field_label_text">User Photo Width</label>
                                        <span className="unit_tag">Drag to Resize</span>
                                    </div>
                                    <div className="input_with_edit_icon">
                                        <input 
                                            type="number" 
                                            value={config.userPhotoWidth}
                                            onChange={(e) => updateConfig("userPhotoWidth", Number(e.target.value) || 0)}
                                            step="0.5"
                                            className="styled_text_input"
                                        />
                                        <span className="unit_suffix">MM</span>
                                        <Edit2 size={15} className="edit_pencil_icon" />
                                    </div>
                                </div>
                                <div className="input_field_box">
                                    <div className="label_with_actions">
                                        <label className="field_label_text">User Photo Height</label>
                                        <span className="unit_tag">Drag to Resize</span>
                                    </div>
                                    <div className="input_with_edit_icon">
                                        <input 
                                            type="number" 
                                            value={config.userPhotoHeight}
                                            onChange={(e) => updateConfig("userPhotoHeight", Number(e.target.value) || 0)}
                                            step="0.5"
                                            className="styled_text_input"
                                        />
                                        <span className="unit_suffix">MM</span>
                                        <Edit2 size={15} className="edit_pencil_icon" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Position Inspector for Active Drag Item */}
                        {activeElement && (
                            <div className="active_element_inspector_card">
                                <div className="inspector_header">
                                    <div className="inspector_title_wrap">
                                        <Move size={14} className="move_icon" />
                                        <span>Selected Item: <strong>{activeElement.toUpperCase()}</strong></span>
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn_reset_element"
                                        onClick={resetCurrentElementPos}
                                        title="Reset this element's position back to standard flow"
                                    >
                                        <CornerUpLeft size={12} />
                                        <span>Reset Position</span>
                                    </button>
                                </div>
                                <div className="inspector_coords_grid">
                                    <div className="coord_item">
                                        <span className="axis_lbl">X Offset:</span>
                                        <input 
                                            type="number" 
                                            value={activePos.x}
                                            onChange={(e) => updateSelectedPos("x", Number(e.target.value) || 0)}
                                            className="coord_input"
                                        />
                                        <span className="px_lbl">px</span>
                                    </div>
                                    <div className="coord_item">
                                        <span className="axis_lbl">Y Offset:</span>
                                        <input 
                                            type="number" 
                                            value={activePos.y}
                                            onChange={(e) => updateSelectedPos("y", Number(e.target.value) || 0)}
                                            className="coord_input"
                                        />
                                        <span className="px_lbl">px</span>
                                    </div>
                                </div>

                                {/* Custom Color Override for Selected Item */}
                                <div className="inspector_color_row">
                                    <span className="color_lbl">Item Text Color:</span>
                                    <div className="color_picker_inline">
                                        <input 
                                            type="color" 
                                            value={config.elementColors?.[activeElement] || (activeElement === "name" ? config.textColors.primaryText : config.textColors.valueColor)}
                                            onChange={(e) => updateElementColor(activeElement, e.target.value)}
                                            className="color_input_dot"
                                        />
                                        <span className="color_hex_str">
                                            {config.elementColors?.[activeElement] || (activeElement === "name" ? config.textColors.primaryText : config.textColors.valueColor)}
                                        </span>
                                        {config.elementColors?.[activeElement] && (
                                            <button 
                                                type="button" 
                                                className="clear_color_btn"
                                                onClick={() => {
                                                    const nextCol = { ...config.elementColors };
                                                    delete nextCol[activeElement];
                                                    setConfig((prev) => ({ ...prev, elementColors: nextCol }));
                                                }}
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <span className="inspector_hint">Tip: You can also click and drag this item freely on the preview card!</span>
                            </div>
                        )}

                        {/* Typography & Text Colors Section */}
                        <div className="form_section_group">
                            <div className="section_header_with_toggle_all">
                                <div className="section_title_with_icon">
                                    <Palette size={16} className="section_icon" />
                                    <h3 className="sub_section_title">Typography & Text Colors</h3>
                                </div>
                                <span className="interactive_pill_badge">Custom Palette</span>
                            </div>

                            <div className="text_colors_customizer_box">
                                <div className="colors_grid">
                                    {/* Primary Student Name Color */}
                                    <div className="color_field_card">
                                        <span className="color_field_label">Cardholder Name</span>
                                        <div className="color_swatch_wrapper">
                                            <input 
                                                type="color" 
                                                value={config.textColors.primaryText}
                                                onChange={(e) => updateTextColor("primaryText", e.target.value)}
                                                className="native_color_picker"
                                            />
                                            <input 
                                                type="text" 
                                                value={config.textColors.primaryText}
                                                onChange={(e) => updateTextColor("primaryText", e.target.value)}
                                                className="hex_text_input"
                                            />
                                        </div>
                                    </div>

                                    {/* Field Labels Color */}
                                    <div className="color_field_card">
                                        <span className="color_field_label">Field Labels</span>
                                        <div className="color_swatch_wrapper">
                                            <input 
                                                type="color" 
                                                value={config.textColors.labelColor}
                                                onChange={(e) => updateTextColor("labelColor", e.target.value)}
                                                className="native_color_picker"
                                            />
                                            <input 
                                                type="text" 
                                                value={config.textColors.labelColor}
                                                onChange={(e) => updateTextColor("labelColor", e.target.value)}
                                                className="hex_text_input"
                                            />
                                        </div>
                                    </div>

                                    {/* Field Values Color */}
                                    <div className="color_field_card">
                                        <span className="color_field_label">Field Values</span>
                                        <div className="color_swatch_wrapper">
                                            <input 
                                                type="color" 
                                                value={config.textColors.valueColor}
                                                onChange={(e) => updateTextColor("valueColor", e.target.value)}
                                                className="native_color_picker"
                                            />
                                            <input 
                                                type="text" 
                                                value={config.textColors.valueColor}
                                                onChange={(e) => updateTextColor("valueColor", e.target.value)}
                                                className="hex_text_input"
                                            />
                                        </div>
                                    </div>

                                    {/* Header & Banner Text Color */}
                                    <div className="color_field_card">
                                        <span className="color_field_label">School Name / Banner</span>
                                        <div className="color_swatch_wrapper">
                                            <input 
                                                type="color" 
                                                value={config.textColors.headerTextColor}
                                                onChange={(e) => updateTextColor("headerTextColor", e.target.value)}
                                                className="native_color_picker"
                                            />
                                            <input 
                                                type="text" 
                                                value={config.textColors.headerTextColor}
                                                onChange={(e) => updateTextColor("headerTextColor", e.target.value)}
                                                className="hex_text_input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Color Theme Presets */}
                                <div className="color_themes_row">
                                    <span className="theme_lbl">Theme Palettes:</span>
                                    <button 
                                        type="button" 
                                        className="theme_chip"
                                        onClick={() => applyColorTheme("navy")}
                                    >
                                        <span className="theme_dot dot_navy"></span>
                                        Classic Navy
                                    </button>
                                    <button 
                                        type="button" 
                                        className="theme_chip"
                                        onClick={() => applyColorTheme("purple")}
                                    >
                                        <span className="theme_dot dot_purple"></span>
                                        Royal Purple
                                    </button>
                                    <button 
                                        type="button" 
                                        className="theme_chip"
                                        onClick={() => applyColorTheme("emerald")}
                                    >
                                        <span className="theme_dot dot_emerald"></span>
                                        Emerald Green
                                    </button>
                                    <button 
                                        type="button" 
                                        className="theme_chip"
                                        onClick={() => applyColorTheme("charcoal")}
                                    >
                                        <span className="theme_dot dot_charcoal"></span>
                                        Dark Charcoal
                                    </button>
                                    <button 
                                        type="button" 
                                        className="theme_chip"
                                        onClick={() => applyColorTheme("maroon")}
                                    >
                                        <span className="theme_dot dot_maroon"></span>
                                        Crimson Maroon
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Row 6: Layout Spacing (Margins) */}
                        <div className="form_section_group">
                            <h3 className="sub_section_title">Layout Spacing</h3>
                            <div className="spacing_inputs_grid">
                                <div className="input_field_box">
                                    <label className="field_label_text">Top</label>
                                    <div className="input_with_edit_icon">
                                        <input 
                                            type="number" 
                                            value={config.spacing.top}
                                            onChange={(e) => updateSpacing("top", Number(e.target.value) || 0)}
                                            step="0.5"
                                            className="styled_text_input"
                                        />
                                        <span className="unit_suffix">MM</span>
                                        <Edit2 size={15} className="edit_pencil_icon" />
                                    </div>
                                </div>
                                <div className="input_field_box">
                                    <label className="field_label_text">Bottom</label>
                                    <div className="input_with_edit_icon">
                                        <input 
                                            type="number" 
                                            value={config.spacing.bottom}
                                            onChange={(e) => updateSpacing("bottom", Number(e.target.value) || 0)}
                                            step="0.5"
                                            className="styled_text_input"
                                        />
                                        <span className="unit_suffix">MM</span>
                                        <Edit2 size={15} className="edit_pencil_icon" />
                                    </div>
                                </div>
                                <div className="input_field_box">
                                    <label className="field_label_text">Left</label>
                                    <div className="input_with_edit_icon">
                                        <input 
                                            type="number" 
                                            value={config.spacing.left}
                                            onChange={(e) => updateSpacing("left", Number(e.target.value) || 0)}
                                            step="0.5"
                                            className="styled_text_input"
                                        />
                                        <span className="unit_suffix">MM</span>
                                        <Edit2 size={15} className="edit_pencil_icon" />
                                    </div>
                                </div>
                                <div className="input_field_box">
                                    <label className="field_label_text">Right</label>
                                    <div className="input_with_edit_icon">
                                        <input 
                                            type="number" 
                                            value={config.spacing.right}
                                            onChange={(e) => updateSpacing("right", Number(e.target.value) || 0)}
                                            step="0.5"
                                            className="styled_text_input"
                                        />
                                        <span className="unit_suffix">MM</span>
                                        <Edit2 size={15} className="edit_pencil_icon" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 7: Logo & Signature Uploads */}
                        <div className="form_row logo_sig_row">
                            {/* Logo */}
                            <div className="input_field_box">
                                <div className="label_with_actions">
                                    <label className="field_label_text">Logo</label>
                                    {config.logo && (
                                        <button 
                                            type="button" 
                                            className="text_clear_btn"
                                            onClick={() => updateConfig("logo", null)}
                                        >
                                            <X size={12} /> Clear
                                        </button>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={logoInputRef} 
                                    accept="image/*" 
                                    className="hidden_file_input"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "logo");
                                    }}
                                />
                                <div 
                                    className={`dropzone_container small_zone ${isDraggingLogo ? "drag_active" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                                    onDragLeave={() => setIsDraggingLogo(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDraggingLogo(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) handleFileUpload(file, "logo");
                                    }}
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    {config.logo ? (
                                        <div className="dropzone_uploaded_preview mini">
                                            <img src={config.logo} alt="Logo" className="mini_thumb" />
                                            <span className="file_hint">Logo Set (Click to change)</span>
                                        </div>
                                    ) : (
                                        <div className="dropzone_content mini">
                                            <UploadCloud size={20} className="cloud_icon" />
                                            <p className="drop_primary_text">
                                                Drag and Drop File here <span className="link_text">Choose File</span>
                                            </p>
                                            <p className="drop_secondary_text">(JPG, JPEG, PNG)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Signature */}
                            <div className="input_field_box">
                                <div className="label_with_actions">
                                    <label className="field_label_text">Signature</label>
                                    {config.signature && (
                                        <button 
                                            type="button" 
                                            className="text_clear_btn"
                                            onClick={() => updateConfig("signature", null)}
                                        >
                                            <X size={12} /> Clear
                                        </button>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={sigInputRef} 
                                    accept="image/*" 
                                    className="hidden_file_input"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file, "signature");
                                    }}
                                />
                                <div 
                                    className={`dropzone_container small_zone ${isDraggingSig ? "drag_active" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDraggingSig(true); }}
                                    onDragLeave={() => setIsDraggingSig(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDraggingSig(false);
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) handleFileUpload(file, "signature");
                                    }}
                                    onClick={() => sigInputRef.current?.click()}
                                >
                                    {config.signature ? (
                                        <div className="dropzone_uploaded_preview mini">
                                            <img src={config.signature} alt="Signature" className="mini_thumb" />
                                            <span className="file_hint">Signature Set (Click to change)</span>
                                        </div>
                                    ) : (
                                        <div className="dropzone_content mini">
                                            <UploadCloud size={20} className="cloud_icon" />
                                            <p className="drop_primary_text">
                                                Drag and Drop File here <span className="link_text">Choose File</span>
                                            </p>
                                            <p className="drop_secondary_text">(JPG, JPEG, PNG)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 8: ID Card Fields Toggles */}
                        <div className="form_section_group">
                            <div className="section_header_with_toggle_all">
                                <h3 className="sub_section_title">ID Card Fields (Each Field Draggable Individually)</h3>
                                <div className="toggle_all_links">
                                    <button type="button" onClick={() => setAllFields(true)}>Select All</button>
                                    <span className="pipe_divider">•</span>
                                    <button type="button" onClick={() => setAllFields(false)}>Clear All</button>
                                </div>
                            </div>

                            <div className="fields_toggle_list">
                                <div className="toggle_row_item">
                                    <span className="toggle_label">Admission No</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.admissionNo}
                                        className={`ios_toggle_switch ${config.fields.admissionNo ? "on" : "off"}`}
                                        onClick={() => toggleField("admissionNo")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Name</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.name}
                                        className={`ios_toggle_switch ${config.fields.name ? "on" : "off"}`}
                                        onClick={() => toggleField("name")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Class</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.class}
                                        className={`ios_toggle_switch ${config.fields.class ? "on" : "off"}`}
                                        onClick={() => toggleField("class")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Father Name</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.fatherName}
                                        className={`ios_toggle_switch ${config.fields.fatherName ? "on" : "off"}`}
                                        onClick={() => toggleField("fatherName")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Mother Name</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.motherName}
                                        className={`ios_toggle_switch ${config.fields.motherName ? "on" : "off"}`}
                                        onClick={() => toggleField("motherName")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Address</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.address}
                                        className={`ios_toggle_switch ${config.fields.address ? "on" : "off"}`}
                                        onClick={() => toggleField("address")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Date of Birth</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.dob}
                                        className={`ios_toggle_switch ${config.fields.dob ? "on" : "off"}`}
                                        onClick={() => toggleField("dob")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Blood group</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.bloodGroup}
                                        className={`ios_toggle_switch ${config.fields.bloodGroup ? "on" : "off"}`}
                                        onClick={() => toggleField("bloodGroup")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">Phone number</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.phone}
                                        className={`ios_toggle_switch ${config.fields.phone ? "on" : "off"}`}
                                        onClick={() => toggleField("phone")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">ID. No</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.idNo}
                                        className={`ios_toggle_switch ${config.fields.idNo ? "on" : "off"}`}
                                        onClick={() => toggleField("idNo")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>

                                <div className="toggle_row_item">
                                    <span className="toggle_label">QR Code / Verification</span>
                                    <button 
                                        type="button"
                                        role="switch"
                                        aria-checked={config.fields.qrCode}
                                        className={`ios_toggle_switch ${config.fields.qrCode ? "on" : "off"}`}
                                        onClick={() => toggleField("qrCode")}
                                    >
                                        <span className="toggle_handle"></span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="designer_bottom_actions">
                            <SecondaryButton 
                                title="Reset" 
                                onClick={handleReset} 
                            />
                            <PrimaryButton 
                                title="Save ID Card" 
                                type="submit"
                                isLoading={isSaving}
                            />
                        </div>
                    </form>
                </div>

                {/* Right Column: User ID Card Live Preview */}
                <div className="id_card_preview_card">
                    <IDCardPreview 
                        config={config} 
                        onChangeConfig={setConfig}
                        selectedProfileId={selectedProfileId}
                        onSelectProfile={setSelectedProfileId}
                        activeElement={activeElement}
                        onSelectElement={setActiveElement}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreateIDCard;
