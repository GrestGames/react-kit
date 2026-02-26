import "./FileViewer.css";
import {useEffect, useCallback, useState} from "react";
import {createPortal} from "react-dom";
import {FileIcon} from "../form/other/FileIcon";

export interface FileViewerFile {
    fileUrl: string;
    fileName: string;
}

interface Props {
    files: FileViewerFile[];
    currentIndex: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

const imageExts = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const pdfExts = new Set(["pdf"]);

function getExt(fileName: string): string {
    const dot = fileName.lastIndexOf(".");
    return dot >= 0 ? fileName.substring(dot + 1).toLowerCase() : "";
}

export function FileViewer({files, currentIndex, onClose, onIndexChange}: Props) {
    const file = files[currentIndex];
    const hasNav = files.length > 1;
    const [loaded, setLoaded] = useState(false);

    const ext = file ? getExt(file.fileName) : "";
    const isImage = imageExts.has(ext);
    const isPdf = pdfExts.has(ext);

    // Reset loaded state when switching files; non-images are "loaded" immediately
    useEffect(() => {
        setLoaded(!isImage);
    }, [currentIndex, isImage]);

    const goPrev = useCallback(() => {
        onIndexChange((currentIndex - 1 + files.length) % files.length);
    }, [currentIndex, files.length, onIndexChange]);

    const goNext = useCallback(() => {
        onIndexChange((currentIndex + 1) % files.length);
    }, [currentIndex, files.length, onIndexChange]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowLeft" && hasNav) goPrev();
            else if (e.key === "ArrowRight" && hasNav) goNext();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose, hasNav, goPrev, goNext]);

    if (!file) return null;

    const readyCls = loaded ? " fileViewerReady" : "";

    let content: React.ReactNode;
    if (isImage) {
        content = <img src={file.fileUrl} alt={file.fileName} onClick={e => e.stopPropagation()} onLoad={() => setLoaded(true)}/>;
    } else if (isPdf) {
        content = <iframe src={file.fileUrl} title={file.fileName} onClick={e => e.stopPropagation()}/>;
    } else {
        content = <div className="fileViewerOther" onClick={e => e.stopPropagation()}>
            <FileIcon fileName={file.fileName} width={80} height={80}/>
            <div className="fileViewerOtherName">{file.fileName}</div>
            <a href={file.fileUrl} download>Download</a>
        </div>;
    }

    return createPortal(
        <div className={"fileViewerOverlay" + readyCls} onClick={onClose}>
            <span className="fileViewerClose" onClick={onClose}>&times;</span>
            {hasNav && <span className="fileViewerArrow fileViewerArrowLeft" onClick={e => { e.stopPropagation(); goPrev(); }}>&lsaquo;</span>}
            <div className="fileViewerContent">
                {content}
            </div>
            {hasNav && <span className="fileViewerArrow fileViewerArrowRight" onClick={e => { e.stopPropagation(); goNext(); }}>&rsaquo;</span>}
            <div className="fileViewerFileName">{file.fileName}</div>
        </div>,
        document.body
    );
}
