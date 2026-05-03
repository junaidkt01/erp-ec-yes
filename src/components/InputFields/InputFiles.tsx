// import React, { useRef, useState } from "react";
// import "./inputField.scss";

// interface InputFilesProps {
//     onChange?: (file: File | null) => void;
//     title?: string;
//     name?: string;
//     maxSizeMB?: number;
// }

// const ACCEPTED_TYPES = [
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "application/vnd.ms-excel",
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     "image/jpeg",
//     "image/png",
//     "text/plain",
// ];

// const InputFiles: React.FC<InputFilesProps> = ({
//     onChange,
//     title,
//     maxSizeMB = 5,
// }) => {
//     const inputRef = useRef<HTMLInputElement | null>(null);

//     const [isDragging, setIsDragging] = useState(false);
//     const [file, setFile] = useState<File | null>(null);
//     const [preview, setPreview] = useState<string | null>(null);

//     const MAX_SIZE = maxSizeMB * 1024 * 1024;

//     const handleClick = () => {
//         inputRef.current?.click();
//     };

//     const validateFile = (file: File | null) => {
//         if (!file) return null;

//         if (!ACCEPTED_TYPES.includes(file.type)) return null;
//         if (file.size > MAX_SIZE) return null;

//         return file;
//     };

//     const handleFile = (fileList: FileList | null) => {
//         if (!fileList || fileList.length === 0) return;

//         const selected = validateFile(fileList[0]); // always first

//         if (!selected) return;

//         // cleanup old preview
//         if (preview) {
//             URL.revokeObjectURL(preview);
//         }

//         setFile(selected);

//         if (selected.type.startsWith("image/")) {
//             const url = URL.createObjectURL(selected);
//             setPreview(url);
//         } else {
//             setPreview(null);
//         }

//         onChange?.(selected);

//         // allow same file re-select
//         if (inputRef.current) inputRef.current.value = "";
//     };

//     const removeFile = () => {
//         if (preview) {
//             URL.revokeObjectURL(preview);
//         }

//         setFile(null);
//         setPreview(null);
//         onChange?.(null);
//     };

//     return (
//         <div className="input-file-wrapper">
//             {title && <label>{title}</label>}

//             <div
//                 className={`input-file ${isDragging ? "dragging" : ""} ${file ? "has-files" : ""
//                     }`}
//                 onClick={handleClick}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                     if (e.key === "Enter" || e.key === " ") handleClick();
//                 }}
//                 onDragOver={(e) => {
//                     e.preventDefault();
//                     setIsDragging(true);
//                 }}
//                 onDragLeave={(e) => {
//                     if (!e.currentTarget.contains(e.relatedTarget as Node)) {
//                         setIsDragging(false);
//                     }
//                 }}
//                 onDrop={(e) => {
//                     e.preventDefault();
//                     setIsDragging(false);
//                     handleFile(e.dataTransfer.files);
//                 }}
//             >
//                 <input
//                     ref={inputRef}
//                     type="file"
//                     hidden
//                     accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
//                     onChange={(e) => handleFile(e.target.files)}
//                 />

//                 <div className="content">
//                     <p className="title">
//                         Drag & Drop file or{" "}
//                         <span
//                             className="choose"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleClick();
//                             }}
//                         >
//                             Browse
//                         </span>
//                     </p>

//                     <p className="sub">
//                         Max size: {maxSizeMB}MB | PDF, DOC, DOCX, JPG, PNG, TXT, XLS, XLSX
//                     </p>
//                 </div>

//                 {/* Preview */}
//                 {file && (
//                     <div className="preview-list">
//                         <div className="preview-item">
//                             {preview ? (
//                                 <img src={preview} alt={file.name} />
//                             ) : (
//                                 <div className="file-box">
//                                     <span>{file.name}</span>
//                                 </div>
//                             )}

//                             <button
//                                 className="remove-btn"
//                                 onClick={(e) => {
//                                     e.stopPropagation();
//                                     removeFile();
//                                 }}
//                             >
//                                 ✕
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default InputFiles;

///////////////////////////////////////////////////////////////////
import React, { useRef, useState } from "react";
import "./inputField.scss";

interface InputFilesProps {
    // onChange?: (files: FileList | null) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    title?: string;
    name?: string;
}

const InputFiles: React.FC<InputFilesProps> = ({ onChange, title, name }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || !onChange) return;

        const event = {
            target: {
                name,
                files,
            },
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onChange(event);
    };

    return (
        <div className="input-file-wrapper" >
            {title && <label htmlFor="">{title}</label>}
            <div
                className={`input-file ${isDragging ? "dragging" : ""}`}
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
                    onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="content">
                    <div className="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                                stroke="#5B61FF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M14 2V8H20"
                                stroke="#5B61FF"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <p className="title">
                        Drag and Drop File here{" "}
                        <span className="choose">Choose File</span>
                    </p>

                    <p className="sub">
                        (PDF,DOC,DOCX,JPG,JPEG,PNG,TXT are allowed for upload)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InputFiles;
