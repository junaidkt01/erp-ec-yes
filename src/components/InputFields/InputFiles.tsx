import { useRef, useState } from "react";
import "./inputField.scss";

interface InputFilesProps {
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    title?: string;
    name?: string;
    accept?: string;
    image?: string | null;
}

const InputFiles: React.FC<InputFilesProps> = ({
    onChange,
    title,
    name,
    accept,
    image,
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState("");

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
                    .replace("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "XLSX")
                    .replace("application/vnd.ms-excel", "XLS")
                    .toUpperCase()
            )
            .join(", ");
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setFileName(files[0].name);

        if (!onChange) return;

        const event = {
            target: {
                name,
                files,
            },
        } as React.ChangeEvent<HTMLInputElement>;

        onChange(event);
    };

    return (
        <div className="input-file-wrapper hvr_zm_in" >
            {title && <label>{title}</label>}

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
                    accept={accept}
                    onChange={(e) => handleFiles(e.target.files)}
                />

                {image ? (
                    <div className="content">
                        <div className="icon">
                            <img
                                src={image}
                                alt="Preview"
                                className="preview-image"
                            />
                        </div>

                        {fileName && (
                            <p className="file-name">{fileName}</p>
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

//     const handleClick = () => {
//         inputRef.current?.click();
//     };

//     const handleFiles = (files: FileList | null) => {
//         if (!files || !onChange) return;

//         const event = {
//             target: {
//                 name,
//                 files,
//             }
//         } as React.ChangeEvent<HTMLInputElement>;

//         onChange(event);
//     };

//     return (
//         <div className="input-file-wrapper">
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
//                             {/* your svg */}
//                             <img
//                                 src={image}
//                                 alt="Preview"
//                                 className="preview-image"
//                             />
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="content">
//                         <div className="icon">
//                             {/* your svg */}
//                         </div>

//                         <p className="title">
//                             Drag and Drop File here{" "}
//                             <span className="choose">Choose File</span>
//                         </p>

//                         <p className="sub">
//                             (PDF,DOC,DOCX,JPG,JPEG,PNG,TXT are allowed for upload)
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default InputFiles;