import React, { useRef, useState } from "react";
import "./inputField.scss";

interface InputFilesProps {
    onChange?: (files: FileList | null) => void;
    title?: string;
}

const InputFiles: React.FC<InputFilesProps> = ({ onChange, title }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFiles = (files: FileList | null) => {
        if (onChange) onChange(files);
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
