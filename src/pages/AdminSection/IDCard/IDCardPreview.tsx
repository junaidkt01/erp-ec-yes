import React, { useState, useRef } from "react";
import { 
    Eye, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Printer, 
    X, 
    Check, 
    Download,
    Layers,
    UserCheck,
    Move,
    Maximize2,
    CornerUpLeft
} from "lucide-react";
import type { IDCardConfig, SampleProfile, ElementPosition } from "./types";
import { SAMPLE_PROFILES } from "./types";
import DynamicQRCode from "../../../components/DynamicQRCode/DynamicQRCode";

export type SelectableElementId = 
    | "photo" 
    | "name" 
    | "fatherName" 
    | "motherName" 
    | "class" 
    | "address" 
    | "phone" 
    | "idNo" 
    | "admissionNo" 
    | "dob" 
    | "bloodGroup" 
    | "qrCode" 
    | "logo" 
    | "signature";

interface IDCardPreviewProps {
    config: IDCardConfig;
    onChangeConfig?: (newConfig: IDCardConfig) => void;
    selectedProfileId?: string;
    onSelectProfile?: (id: string) => void;
    activeElement?: SelectableElementId | null;
    onSelectElement?: (elementId: SelectableElementId | null) => void;
}

export const IDCardPreview: React.FC<IDCardPreviewProps> = ({
    config,
    onChangeConfig,
    selectedProfileId = "1",
    onSelectProfile,
    activeElement: externalActiveElement,
    onSelectElement: externalOnSelectElement,
}) => {
    const [internalActiveElement, setInternalActiveElement] = useState<SelectableElementId | null>("photo");
    const selectedElement = externalActiveElement !== undefined ? externalActiveElement : internalActiveElement;
    
    const setSelectedElement = (el: SelectableElementId | null) => {
        if (externalOnSelectElement) {
            externalOnSelectElement(el);
        } else {
            setInternalActiveElement(el);
        }
    };

    const [activeSide, setActiveSide] = useState<"front" | "back">("front");
    const [zoom, setZoom] = useState<number>(1);
    const [showHolePunch, setShowHolePunch] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSnapGrid, setIsSnapGrid] = useState<boolean>(false);

    // Active drag / resize state
    const [dragMode, setDragMode] = useState<"move" | "resize" | "radius" | null>(null);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [radiusCorner, setRadiusCorner] = useState<"topLeft" | "topRight" | "bottomRight" | "bottomLeft" | null>(null);

    const dragStartRef = useRef<{
        startX: number;
        startY: number;
        origPos: ElementPosition;
        origWidth: number;
        origHeight: number;
        origRadius: number;
    }>({
        startX: 0,
        startY: 0,
        origPos: { x: 0, y: 0 },
        origWidth: 21,
        origHeight: 21,
        origRadius: 50,
    });

    const cardRef = useRef<HTMLDivElement>(null);

    const activeProfile: SampleProfile = 
        SAMPLE_PROFILES.find((p) => p.id === selectedProfileId) || SAMPLE_PROFILES[0];

    const isPortrait = config.layout === "portrait";
    const cardWidthPx = isPortrait ? 280 : 420;
    const cardHeightPx = isPortrait ? 438 : 280;

    // Helper to get element position
    const getPos = (id: SelectableElementId): ElementPosition => {
        return config.elementPositions?.[id] || { x: 0, y: 0 };
    };

    // Helper to update single element position
    const updateElementPos = (id: SelectableElementId, pos: ElementPosition) => {
        if (!onChangeConfig) return;
        onChangeConfig({
            ...config,
            elementPositions: {
                ...config.elementPositions,
                [id]: pos,
            },
        });
    };

    // Reset element positions
    const handleResetPositions = () => {
        if (!onChangeConfig) return;
        onChangeConfig({
            ...config,
            elementPositions: {},
            userPhotoWidth: 21,
            userPhotoHeight: 21,
            photoRadius: {
                topLeft: config.photoStyle === "round" ? 50 : 8,
                topRight: config.photoStyle === "round" ? 50 : 8,
                bottomRight: config.photoStyle === "round" ? 50 : 8,
                bottomLeft: config.photoStyle === "round" ? 50 : 8,
                isLinked: true,
            },
        });
    };

    // Pointer event handlers for moving elements
    const handlePointerDownMove = (e: React.PointerEvent, id: SelectableElementId) => {
        e.stopPropagation();
        setSelectedElement(id);
        setDragMode("move");

        const curPos = getPos(id);
        dragStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origPos: { ...curPos },
            origWidth: config.userPhotoWidth,
            origHeight: config.userPhotoHeight,
            origRadius: config.photoRadius.topLeft,
        };

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    // Pointer event handlers for resizing photo
    const handlePointerDownResize = (e: React.PointerEvent, handle: string) => {
        e.stopPropagation();
        setDragMode("resize");
        setResizeHandle(handle);

        dragStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origPos: getPos("photo"),
            origWidth: config.userPhotoWidth,
            origHeight: config.userPhotoHeight,
            origRadius: config.photoRadius.topLeft,
        };

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    // Pointer event handlers for dragging corner radius
    const handlePointerDownRadius = (
        e: React.PointerEvent, 
        corner: "topLeft" | "topRight" | "bottomRight" | "bottomLeft"
    ) => {
        e.stopPropagation();
        setDragMode("radius");
        setRadiusCorner(corner);

        dragStartRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            origPos: getPos("photo"),
            origWidth: config.userPhotoWidth,
            origHeight: config.userPhotoHeight,
            origRadius: config.photoRadius[corner],
        };

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragMode || !onChangeConfig) return;

        const deltaX = (e.clientX - dragStartRef.current.startX) / zoom;
        const deltaY = (e.clientY - dragStartRef.current.startY) / zoom;

        if (dragMode === "move" && selectedElement) {
            let nextX = dragStartRef.current.origPos.x + deltaX;
            let nextY = dragStartRef.current.origPos.y + deltaY;

            if (isSnapGrid) {
                nextX = Math.round(nextX / 5) * 5;
                nextY = Math.round(nextY / 5) * 5;
            }

            updateElementPos(selectedElement, {
                x: Math.round(nextX),
                y: Math.round(nextY),
            });
        } else if (dragMode === "resize") {
            // 1mm ~ 3.8px
            const pxPerMm = 3.8;
            let newWidth = dragStartRef.current.origWidth;
            let newHeight = dragStartRef.current.origHeight;

            if (resizeHandle?.includes("e")) {
                newWidth = Math.max(12, Math.min(65, dragStartRef.current.origWidth + deltaX / pxPerMm));
            }
            if (resizeHandle?.includes("w")) {
                newWidth = Math.max(12, Math.min(65, dragStartRef.current.origWidth - deltaX / pxPerMm));
            }
            if (resizeHandle?.includes("s")) {
                newHeight = Math.max(12, Math.min(65, dragStartRef.current.origHeight + deltaY / pxPerMm));
            }
            if (resizeHandle?.includes("n")) {
                newHeight = Math.max(12, Math.min(65, dragStartRef.current.origHeight - deltaY / pxPerMm));
            }

            onChangeConfig({
                ...config,
                userPhotoWidth: Number(newWidth.toFixed(1)),
                userPhotoHeight: Number(newHeight.toFixed(1)),
            });
        } else if (dragMode === "radius" && radiusCorner) {
            // Dragging inward increases radius; outward flattens radius
            let radiusDelta = (deltaX + deltaY) / 1.5;
            if (radiusCorner === "topRight" || radiusCorner === "bottomLeft") {
                radiusDelta = (deltaY - deltaX) / 1.5;
            }

            const rawRadius = Math.max(0, Math.min(50, dragStartRef.current.origRadius + radiusDelta));
            const newRadVal = Math.round(rawRadius);

            if (config.photoRadius.isLinked) {
                onChangeConfig({
                    ...config,
                    photoStyle: "custom",
                    photoRadius: {
                        ...config.photoRadius,
                        topLeft: newRadVal,
                        topRight: newRadVal,
                        bottomRight: newRadVal,
                        bottomLeft: newRadVal,
                    },
                });
            } else {
                onChangeConfig({
                    ...config,
                    photoStyle: "custom",
                    photoRadius: {
                        ...config.photoRadius,
                        [radiusCorner]: newRadVal,
                    },
                });
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (dragMode) {
            setDragMode(null);
            setResizeHandle(null);
            setRadiusCorner(null);
            try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
                // Ignore capture release error
            }
        }
    };

    // Calculate Photo Border Radius string
    const getPhotoBorderRadius = () => {
        const { topLeft, topRight, bottomRight, bottomLeft } = config.photoRadius;
        // Use percentage if 50 or above, otherwise pixels
        const tl = topLeft >= 50 ? "50%" : `${topLeft * 1.5}px`;
        const tr = topRight >= 50 ? "50%" : `${topRight * 1.5}px`;
        const br = bottomRight >= 50 ? "50%" : `${bottomRight * 1.5}px`;
        const bl = bottomLeft >= 50 ? "50%" : `${bottomLeft * 1.5}px`;
        return `${tl} ${tr} ${br} ${bl}`;
    };

    const handlePrint = () => {
        window.print();
    };

    // Clear selection on background click
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === cardRef.current) {
            setSelectedElement(null);
        }
    };

    // Render Draggable Element Wrapper
    const renderDraggableItem = (
        id: SelectableElementId, 
        children: React.ReactNode, 
        className: string = "",
        style: React.CSSProperties = {}
    ) => {
        const pos = getPos(id);
        const isSelected = selectedElement === id;

        return (
            <div 
                className={`draggable_canvas_item ${className} ${isSelected ? "is_selected" : ""}`}
                style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    cursor: dragMode ? "grabbing" : "grab",
                    ...style,
                }}
                onPointerDown={(e) => handlePointerDownMove(e, id)}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(id);
                }}
            >
                {children}

                {/* Selection Bounding Box & Drag Indicator */}
                {isSelected && (
                    <div className="canvas_selection_outline">
                        <span className="element_tag_badge">
                            <Move size={10} />
                            {id}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // Render Photo Element with Resize & Corner Radius Handles
    const renderDraggablePhoto = () => {
        const pos = getPos("photo");
        const isSelected = selectedElement === "photo";
        const borderRadiusStr = getPhotoBorderRadius();
        const photoWidthPx = Math.max(config.userPhotoWidth * 3.8, 60);
        const photoHeightPx = Math.max(config.userPhotoHeight * 3.8, 60);

        return (
            <div 
                className={`card_photo_wrapper ${isSelected ? "is_selected" : ""}`}
                style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement("photo");
                }}
            >
                <div 
                    className="user_photo_frame user_photo_interactive"
                    style={{
                        width: `${photoWidthPx}px`,
                        height: `${photoHeightPx}px`,
                        borderRadius: borderRadiusStr,
                    }}
                    onPointerDown={(e) => handlePointerDownMove(e, "photo")}
                >
                    <img 
                        src={activeProfile.photoUrl} 
                        alt={activeProfile.name} 
                        className="user_photo_img"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/student.png";
                        }}
                    />
                </div>

                {/* Handles when Photo is Selected */}
                {isSelected && (
                    <div 
                        className="photo_interactive_bounding_box"
                        style={{
                            width: `${photoWidthPx + 6}px`,
                            height: `${photoHeightPx + 6}px`,
                            borderRadius: borderRadiusStr,
                        }}
                    >
                        {/* 4 Corner Resize Handles */}
                        <div 
                            className="resize_handle handle_nw" 
                            title="Resize Top-Left"
                            onPointerDown={(e) => handlePointerDownResize(e, "nw")} 
                        />
                        <div 
                            className="resize_handle handle_ne" 
                            title="Resize Top-Right"
                            onPointerDown={(e) => handlePointerDownResize(e, "ne")} 
                        />
                        <div 
                            className="resize_handle handle_se" 
                            title="Resize Bottom-Right"
                            onPointerDown={(e) => handlePointerDownResize(e, "se")} 
                        />
                        <div 
                            className="resize_handle handle_sw" 
                            title="Resize Bottom-Left"
                            onPointerDown={(e) => handlePointerDownResize(e, "sw")} 
                        />

                        {/* 4 Corner Radius Dragger Dots (Inside each corner) */}
                        <div 
                            className="radius_dragger_dot dot_tl"
                            title={`Drag to adjust Top-Left Radius (${config.photoRadius.topLeft})`}
                            onPointerDown={(e) => handlePointerDownRadius(e, "topLeft")}
                        />
                        <div 
                            className="radius_dragger_dot dot_tr"
                            title={`Drag to adjust Top-Right Radius (${config.photoRadius.topRight})`}
                            onPointerDown={(e) => handlePointerDownRadius(e, "topRight")}
                        />
                        <div 
                            className="radius_dragger_dot dot_br"
                            title={`Drag to adjust Bottom-Right Radius (${config.photoRadius.bottomRight})`}
                            onPointerDown={(e) => handlePointerDownRadius(e, "bottomRight")}
                        />
                        <div 
                            className="radius_dragger_dot dot_bl"
                            title={`Drag to adjust Bottom-Left Radius (${config.photoRadius.bottomLeft})`}
                            onPointerDown={(e) => handlePointerDownRadius(e, "bottomLeft")}
                        />

                        {/* Floating Dimension and Radius Pill Tooltip */}
                        <div className="photo_hud_tooltip">
                            <span>{config.userPhotoWidth}mm × {config.userPhotoHeight}mm</span>
                            <span className="hud_divider">•</span>
                            <span>R: {config.photoRadius.topLeft}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderFrontCard = () => (
        <div 
            ref={cardRef}
            className={`id_card_mockup ${isPortrait ? "portrait" : "landscape"} ${config.bgImage ? "has_custom_bg" : ""}`}
            style={{
                width: `${cardWidthPx}px`,
                height: `${cardHeightPx}px`,
                paddingTop: `${Math.max(config.spacing.top * 2.5, 4)}px`,
                paddingBottom: `${Math.max(config.spacing.bottom * 2.5, 4)}px`,
                paddingLeft: `${Math.max(config.spacing.left * 2.5, 6)}px`,
                paddingRight: `${Math.max(config.spacing.right * 2.5, 6)}px`,
                backgroundImage: config.bgImage ? `url(${config.bgImage})` : undefined,
            }}
            onClick={handleCanvasClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Lanyard Hole Punch slot simulation */}
            {showHolePunch && (
                <div className="id_hole_punch" title="Lanyard Slot">
                    <span className="punch_slot"></span>
                </div>
            )}

            {/* User Photo with Resize and Corner Radius draggers */}
            {renderDraggablePhoto()}

            {/* Student / User Name */}
            {config.fields.name && (
                renderDraggableItem("name", (
                    <div className="user_name_section">
                        <h3 
                            className="user_display_name"
                            style={{ color: config.elementColors?.["name"] || config.textColors?.primaryText || "#12255d" }}
                        >
                            {activeProfile.name}
                        </h3>
                    </div>
                ), "name_drag_wrapper")
            )}

            {/* Dynamic Card Details Fields - Each field is draggable individually! */}
            <div className="card_details_grid">
                {config.fields.fatherName && (
                    renderDraggableItem("fatherName", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Parentage</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value" style={{ color: config.elementColors?.["fatherName"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.fatherName}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.motherName && (
                    renderDraggableItem("motherName", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Mother Name</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value" style={{ color: config.elementColors?.["motherName"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.motherName}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.address && (
                    renderDraggableItem("address", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Address</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value" style={{ color: config.elementColors?.["address"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.address}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.class && (
                    renderDraggableItem("class", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Class & Sec</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value" style={{ color: config.elementColors?.["class"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.className} {activeProfile.section}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.phone && (
                    renderDraggableItem("phone", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Phone number</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value" style={{ color: config.elementColors?.["phone"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.phone}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.idNo && (
                    renderDraggableItem("idNo", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>ID. No.</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value font_mono" style={{ color: config.elementColors?.["idNo"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.idNo}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.admissionNo && (
                    renderDraggableItem("admissionNo", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Admission No</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value" style={{ color: config.elementColors?.["admissionNo"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.admissionNo}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.dob && (
                    renderDraggableItem("dob", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Date of Birth</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value" style={{ color: config.elementColors?.["dob"] || config.textColors?.valueColor || "#1f2937" }}>{activeProfile.dob}</span>
                        </div>
                    ), "field_drag_row")
                )}

                {config.fields.bloodGroup && (
                    renderDraggableItem("bloodGroup", (
                        <div className="detail_row">
                            <span className="field_label" style={{ color: config.textColors?.labelColor || "#2b3658" }}>Blood Group</span>
                            <span className="field_colon" style={{ color: config.textColors?.labelColor || "#2b3658" }}>:</span>
                            <span className="field_value blood_badge" style={{ color: config.elementColors?.["bloodGroup"] || "#dc2626" }}>{activeProfile.bloodGroup}</span>
                        </div>
                    ), "field_drag_row")
                )}
            </div>

            {/* QR Code if enabled */}
            {config.fields.qrCode && (
                renderDraggableItem("qrCode", (
                    <div className="card_qr_section">
                        <DynamicQRCode value={`ID:${activeProfile.idNo}|ADM:${activeProfile.admissionNo}`} size={44} />
                    </div>
                ), "qr_drag_wrapper")
            )}

            {/* Signature Area */}
            {config.fields.signature && (
                renderDraggableItem("signature", (
                    <div className="card_signature_area">
                        {config.signature ? (
                            <img src={config.signature} alt="Sign" className="signature_img" />
                        ) : (
                            <div className="signature_placeholder">
                                <span className="sig_ink" style={{ color: config.textColors?.primaryText || "#12255d" }}>Principal</span>
                            </div>
                        )}
                        <span className="signature_title" style={{ color: config.textColors?.labelColor || "#4b5563" }}>Principal Signature</span>
                    </div>
                ), "sig_drag_wrapper")
            )}

            {/* Card Footer Banner */}
            {/* <div className="card_footer_banner">
                <div className="footer_navy_strip">
                    <p className="school_primary_name" style={{ color: config.textColors?.headerTextColor || "#ffffff" }}>{config.schoolName}</p>
                    <p className="school_sub_address" style={{ color: config.textColors?.headerTextColor ? `${config.textColors.headerTextColor}dd` : "rgba(255, 255, 255, 0.85)" }}>{config.schoolSubtitle}</p>
                </div>
                <div className="footer_gold_strip"></div>
            </div> */}
        </div>
    );

    const renderBackCard = () => (
        <div 
            className={`id_card_mockup card_back ${isPortrait ? "portrait" : "landscape"}`}
            style={{
                width: `${cardWidthPx}px`,
                height: `${cardHeightPx}px`,
            }}
        >
            {showHolePunch && (
                <div className="id_hole_punch">
                    <span className="punch_slot"></span>
                </div>
            )}

            <div className="back_header">
                <h4 className="back_institution_title">{config.schoolName}</h4>
                <p className="back_card_terms">TERMS & INSTRUCTIONS</p>
            </div>

            <div className="back_content_rules">
                <ol>
                    <li>This card is non-transferable and must be carried at all times within school premises.</li>
                    <li>Loss of this card must be immediately reported to the school administrative office.</li>
                    <li>If found, please return to the school address or call 01954-222345.</li>
                    <li>Valid for the academic session: <strong>{activeProfile.academicYear}</strong>.</li>
                </ol>
            </div>

            <div className="back_contacts_block">
                <div className="contact_item">
                    <span className="c_lbl">Emergency Contact:</span>
                    <span className="c_val">{activeProfile.emergencyContact}</span>
                </div>
                <div className="contact_item">
                    <span className="c_lbl">Address:</span>
                    <span className="c_val">{config.schoolSubtitle}</span>
                </div>
            </div>

            <div className="back_qr_center">
                <DynamicQRCode value={`YES-VERIFY:${activeProfile.idNo}|${activeProfile.name}`} size={56} />
                <span className="qr_scan_txt">Scan to Verify Credential</span>
            </div>

            <div className="card_footer_banner">
                <div className="footer_navy_strip back_strip">
                    <p className="school_primary_name">FOUNDATION FOR EXCELLENCE IN EDUCATION</p>
                </div>
                <div className="footer_gold_strip"></div>
            </div>
        </div>
    );

    return (
        <div className="id_card_preview_panel">
            {/* Panel Header */}
            <div className="preview_panel_header">
                <div className="panel_title_wrap">
                    <h3 className="panel_title">User ID Card</h3>
                    {/* <span className="live_badge">
                        <span className="pulse_dot"></span>
                        Interactive Designer
                    </span> */}
                </div>

                <div className="preview_header_actions">
                    <button 
                        type="button" 
                        className="preview_modal_btn"
                        onClick={() => setIsModalOpen(true)}
                        title="Open Fullscreen Preview & Print Dialog"
                    >
                        <Eye size={16} />
                        <span>Preview</span>
                    </button>
                </div>
            </div>

            {/* Preview Toolbar */}
            <div className="preview_toolbar">
                <div className="side_switch_tabs">
                    <button 
                        type="button"
                        className={`side_tab ${activeSide === "front" ? "active" : ""}`}
                        onClick={() => setActiveSide("front")}
                    >
                        Front Side
                    </button>
                    <button 
                        type="button"
                        className={`side_tab ${activeSide === "back" ? "active" : ""}`}
                        onClick={() => setActiveSide("back")}
                    >
                        Back Side
                    </button>
                </div>

                <div className="toolbar_right_controls">
                    {/* Snap to Grid */}
                    <button
                        type="button"
                        className={`toolbar_toggle_icon_btn ${isSnapGrid ? "active" : ""}`}
                        onClick={() => setIsSnapGrid(!isSnapGrid)}
                        title="Toggle Snap to Grid (5px)"
                    >
                        <Maximize2 size={13} />
                        <span>Snap</span>
                    </button>

                    {/* Reset Positions */}
                    <button
                        type="button"
                        className="toolbar_toggle_icon_btn"
                        onClick={handleResetPositions}
                        title="Reset all element positions & photo size to default"
                    >
                        <CornerUpLeft size={13} />
                        <span>Reset Layout</span>
                    </button>

                    {/* Sample Person Switcher */}
                    <div className="sample_profile_select_wrap">
                        <UserCheck size={14} className="user_icon" />
                        <select 
                            value={activeProfile.id}
                            onChange={(e) => onSelectProfile && onSelectProfile(e.target.value)}
                            className="sample_select"
                            title="Switch sample cardholder to test data formatting"
                        >
                            {SAMPLE_PROFILES.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Zoom Buttons */}
                    <div className="zoom_buttons_group">
                        <button 
                            type="button" 
                            className="zoom_btn"
                            onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
                            title="Zoom Out"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="zoom_level">{Math.round(zoom * 100)}%</span>
                        <button 
                            type="button" 
                            className="zoom_btn"
                            onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                            title="Zoom In"
                        >
                            <ZoomIn size={14} />
                        </button>
                        <button 
                            type="button" 
                            className="zoom_btn"
                            onClick={() => setZoom(1)}
                            title="Reset Zoom"
                        >
                            <RotateCcw size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Drag & Customization Guide Banner */}
            <div className="canvas_interaction_hint">
                <span className="hint_tag">Interactive:</span>
                <span>Click & drag any field to move it. Select the photo to drag-resize or pull corner dots for radius.</span>
            </div>

            {/* The Live Interactive Canvas */}
            <div className="preview_canvas_area">
                <div 
                    className="card_zoom_container"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                >
                    {activeSide === "front" ? renderFrontCard() : renderBackCard()}
                </div>
            </div>

            {/* Quick Card Specs Summary Footer */}
            <div className="preview_specs_footer">
                <div className="spec_pill">
                    <Layers size={13} />
                    <span>{config.pageWidth} × {config.pageHeight} MM</span>
                </div>
                <div className="spec_pill">
                    <span>Photo: <strong>{config.userPhotoWidth}×{config.userPhotoHeight}mm</strong></span>
                </div>
                <div className="spec_pill">
                    <span>Radius: <strong>TL:{config.photoRadius.topLeft} TR:{config.photoRadius.topRight} BR:{config.photoRadius.bottomRight} BL:{config.photoRadius.bottomLeft}</strong></span>
                </div>
                <button 
                    type="button" 
                    className={`hole_toggle_pill ${showHolePunch ? "active" : ""}`}
                    onClick={() => setShowHolePunch(!showHolePunch)}
                    title="Toggle Lanyard slot punch"
                >
                    Slot Punch: {showHolePunch ? "ON" : "OFF"}
                </button>
            </div>

            {/* Fullscreen & Print Preview Modal */}
            {isModalOpen && (
                <div className="id_card_modal_backdrop" onClick={() => setIsModalOpen(false)}>
                    <div className="id_card_modal_content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal_header">
                            <div>
                                <h3 className="modal_title">ID Card Print & Quality Preview</h3>
                                <p className="modal_subtitle">{config.title} • {activeProfile.name} • {config.pageWidth}mm × {config.pageHeight}mm</p>
                            </div>
                            <div className="modal_actions">
                                <button type="button" className="btn_modal_print" onClick={handlePrint}>
                                    <Printer size={16} />
                                    <span>Print Sample</span>
                                </button>
                                <button type="button" className="btn_modal_download" onClick={handlePrint}>
                                    <Download size={16} />
                                    <span>Download PDF</span>
                                </button>
                                <button type="button" className="btn_modal_close" onClick={() => setIsModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="modal_cards_display">
                            <div className="modal_card_col">
                                <span className="col_label">Front Side (Custom Layout)</span>
                                <div className="modal_card_wrap">
                                    {renderFrontCard()}
                                </div>
                            </div>
                            <div className="modal_card_col">
                                <span className="col_label">Back Side (Terms & QR)</span>
                                <div className="modal_card_wrap">
                                    {renderBackCard()}
                                </div>
                            </div>
                        </div>

                        <div className="modal_footer_hint">
                            <p>
                                <Check size={14} className="inline_check" /> Position & dimensions preserved accurately for high-density 300 DPI PVC production.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IDCardPreview;
