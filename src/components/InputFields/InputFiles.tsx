import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { createCroppedImage } from "./CropImage";
import "./inputField.scss";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";

interface CropSize {
    width: number;
    height: number;
}

interface InputFilesProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    title?: string;
    name?: string;
    accept?: string;
    image?: string | null;

    // New
    cropSize?: CropSize;
}

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

const InputFiles: React.FC<InputFilesProps> = ({
    onChange,
    title,
    name,
    accept,
    image,
    cropSize,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState("");

    // Cropper
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState<PixelCrop | null>(null);

    const [isCropping, setIsCropping] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    /**
     * When an existing image is supplied from backend,
     * show it as preview.
     */
    useEffect(() => {
        if (!image) {
            setFileName("");
        }
    }, [image]);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const getAcceptedFilesText = () => {
        if (!accept) return "All file types are allowed";

        return accept
            .split(",")
            .map((item) =>
                item
                    .trim()
                    .replace(".", "")
                    .replace(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "XLSX"
                    )
                    .replace(
                        "application/vnd.ms-excel",
                        "XLS"
                    )
                    .toUpperCase()
            )
            .join(", ");
    };

    /**
     * Create event compatible with your existing onChange.
     */
    const emitFile = (file: File) => {
        if (!onChange) return;

        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);

        const event = {
            target: {
                name,
                files: dataTransfer.files,
            },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(event);
    };

    /**
     * User selected/dropped an image.
     */
    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];

        setFileName(file.name);

        /**
         * If cropSize is not provided,
         * behave exactly like a normal file input.
         */
        if (!cropSize) {
            emitFile(file);
            return;
        }

        /**
         * Create temporary URL for cropper.
         */
        const objectUrl = URL.createObjectURL(file);

        setCropImage(objectUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setIsCropping(true);

        // Don't revoke here because cropper still needs it.
    };

    /**
     * Cropper finished calculating crop area.
     */
    const handleCropComplete = (
        _croppedArea: unknown,
        croppedAreaPixels: PixelCrop
    ) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    /**
     * User clicked Crop/Apply.
     */
    const handleCropConfirm = async () => {
        if (!cropImage || !croppedAreaPixels || !cropSize) {
            return;
        }

        try {
            setIsProcessing(true);

            const croppedFile = await createCroppedImage(
                cropImage,
                croppedAreaPixels,
                cropSize.width,
                cropSize.height
            );

            setFileName(croppedFile.name);

            // Send cropped file to parent
            emitFile(croppedFile);

            // Close cropper
            setIsCropping(false);

            URL.revokeObjectURL(cropImage);
            setCropImage(null);
        } catch (error) {
            console.error("Image crop failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Cancel crop.
     */
    const handleCropCancel = () => {
        if (cropImage) {
            URL.revokeObjectURL(cropImage);
        }

        setCropImage(null);
        setIsCropping(false);
        setCroppedAreaPixels(null);

        // Allow selecting same file again
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    return (
        <>
            <div className="input-file-wrapper hvr_zm_in">
                {title && <label>{title}</label>}

                <div
                    className={`input-file ${isDragging ? "dragging" : ""
                        }`}
                    onClick={handleClick}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);

                        handleFiles(e.dataTransfer.files);
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        hidden
                        multiple
                        accept={accept}
                        onChange={(e) => {
                            handleFiles(e.target.files);
                        }}
                    />

                    {image ? (
                        <div className="content">
                            <div className="icon">
                                <img
                                    width={cropSize?.width}
                                    height={cropSize?.height}
                                    src={image}
                                    alt="Preview"
                                    className="preview-image"
                                />
                            </div>

                            {fileName && (
                                <p className="file-name">
                                    {fileName}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="content">
                            <div className="icon">
                                {/* your svg */}
                            </div>

                            <p className="title">
                                {fileName ? (
                                    <span className="selected-file">
                                        {fileName}
                                    </span>
                                ) : (
                                    <>
                                        Drag and Drop File here{" "}
                                        <span className="choose">
                                            Choose File
                                        </span>
                                    </>
                                )}
                            </p>

                            <p className="sub">
                                Allowed: {getAcceptedFilesText()}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ================= CROP MODAL ================= */}

            {isCropping && cropImage && cropSize && (
                <div className="image-crop-overlay">
                    <div className="image-crop-modal">
                        <div className="crop-header">
                            <div>
                                <h3>Crop Image</h3>

                                <span>
                                    {cropSize.width} ×{" "}
                                    {cropSize.height}px
                                </span>
                            </div>

                            <button
                                type="button"
                                className="crop-close"
                                onClick={handleCropCancel}
                            >
                                ×
                            </button>
                        </div>

                        <div className="crop-container">
                            <Cropper
                                image={cropImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={
                                    cropSize.width /
                                    cropSize.height
                                }
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={
                                    handleCropComplete
                                }
                                cropShape="rect"
                                showGrid={true}
                                objectFit="contain"
                            />
                        </div>

                        <div className="crop-controls">
                            <label>
                                Zoom
                            </label>

                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) =>
                                    setZoom(
                                        Number(e.target.value)
                                    )
                                }
                            />

                            <span>
                                {zoom.toFixed(1)}x
                            </span>
                        </div>

                        <div className="crop-actions">
                            {/* <button
                                type="button"
                                className="crop-cancel"
                                onClick={handleCropCancel}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button> */}
                            <SecondaryButton onClick={handleCropCancel} disable={isProcessing} title="Cancel" />

                            {/* <button type="button" className="crop-confirm" onClick={handleCropConfirm}
                                disabled={isProcessing || !croppedAreaPixels} >
                                {isProcessing ? "Processing..." : "Crop & Continue"}
                            </button> */}

                            <PrimaryButton onClick={handleCropConfirm} disabled={isProcessing || !croppedAreaPixels} title={isProcessing ? "Processing..." : "Crop & Continue"} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InputFiles;

// import { useRef, useState } from "react";
// import "./inputField.scss";

// interface InputFilesProps {
//     onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     title?: string;
//     name?: string;
//     accept?: string;
//     image?: string | null;
// }

// const InputFiles: React.FC<InputFilesProps> = ({
//     onChange,
//     title,
//     name,
//     accept,
//     image,
// }) => {
//     const inputRef = useRef<HTMLInputElement | null>(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [fileName, setFileName] = useState("");

//     const handleClick = () => {
//         inputRef.current?.click();
//     };

//     const getAcceptedFilesText = () => {
//         if (!accept) return "All file types are allowed";

//         return accept
//             .split(",")
//             .map((item) =>
//                 item
//                     .trim()
//                     .replace(".", "")
//                     .replace("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "XLSX")
//                     .replace("application/vnd.ms-excel", "XLS")
//                     .toUpperCase()
//             )
//             .join(", ");
//     };

//     const handleFiles = (files: FileList | null) => {
//         if (!files || files.length === 0) return;

//         setFileName(files[0].name);

//         if (!onChange) return;

//         const event = {
//             target: {
//                 name,
//                 files,
//             },
//         } as React.ChangeEvent<HTMLInputElement>;

//         onChange(event);
//     };

//     return (
//         <div className="input-file-wrapper hvr_zm_in" >
//             {title && <label>{title}</label>}

//             <div
//                 className={`input-file ${isDragging ? "dragging" : ""}`}
//                 onClick={handleClick}
//                 onDragOver={(e) => {
//                     e.preventDefault();
//                     setIsDragging(true);
//                 }}
//                 onDragLeave={() => setIsDragging(false)}
//                 onDrop={(e) => {
//                     e.preventDefault();
//                     setIsDragging(false);
//                     handleFiles(e.dataTransfer.files);
//                 }}
//             >
//                 <input
//                     ref={inputRef}
//                     type="file"
//                     hidden
//                     multiple
//                     accept={accept}
//                     onChange={(e) => handleFiles(e.target.files)}
//                 />

//                 {image ? (
//                     <div className="content">
//                         <div className="icon">
//                             <img
//                                 src={image}
//                                 alt="Preview"
//                                 className="preview-image"
//                             />
//                         </div>

//                         {fileName && (
//                             <p className="file-name">{fileName}</p>
//                         )}
//                     </div>
//                 ) : (
//                     <div className="content">
//                         <div className="icon">
//                             {/* your svg */}
//                         </div>

//                         <p className="title">
//                             {fileName ? (
//                                 <span className="selected-file">
//                                     {fileName}
//                                 </span>
//                             ) : (
//                                 <>
//                                     Drag and Drop File here{" "}
//                                     <span className="choose">
//                                         Choose File
//                                     </span>
//                                 </>
//                             )}
//                         </p>

//                         <p className="sub">
//                             Allowed: {getAcceptedFilesText()}
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default InputFiles;