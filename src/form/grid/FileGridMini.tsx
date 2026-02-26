import "./FileGridMini.css";
import {useRef, useState, useEffect} from "react";
import {FileIcon} from "../other/FileIcon";
import {FileViewer} from "../../mini/FileViewer";

export interface FileGridMiniItem {
    fileName: string;
    fileUrl: string;
    iconUrl?: string;
    deleteAction?: () => Promise<void>;
}

interface Props {
    size?: number;
    data: FileGridMiniItem[];
    onAddFile?: (files: File[]) => void;
    addFileLoading?: boolean;
    alignRight?: boolean;
}

export function FileGridMini({size = 80, data, onAddFile, addFileLoading, alignRight}: Props) {
    const addFileInput = useRef<HTMLInputElement>(null);
    const [windowDrag, setWindowDrag] = useState(false);
    const [overDrop, setOverDrop] = useState(false);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const dragCounter = useRef(0);
    const dropCounter = useRef(0);

    useEffect(() => {
        if (!onAddFile) return () => {};
        const enter = (e: DragEvent) => { if (e.dataTransfer?.types?.includes("Files")) { dragCounter.current++; setWindowDrag(true); } };
        const leave = () => { dragCounter.current--; if (dragCounter.current <= 0) { dragCounter.current = 0; setWindowDrag(false); } };
        const drop = () => { dragCounter.current = 0; setWindowDrag(false); };
        window.addEventListener("dragenter", enter);
        window.addEventListener("dragleave", leave);
        window.addEventListener("drop", drop);
        return () => { window.removeEventListener("dragenter", enter); window.removeEventListener("dragleave", leave); window.removeEventListener("drop", drop); };
    }, [!!onAddFile]);

    const addCls = "fgmBox fgmBoxAdd" + (overDrop ? " fgmDropOver" : windowDrag ? " fgmDropHint" : "");

    return <>
        <div className={"fileGridMini" + (alignRight ? " fileGridMiniRight" : "")} style={{"--fgm-size": size + "px"} as React.CSSProperties}>
            {data.map((e, i) => <div key={i} className="fgmBox" title={e.fileName}>
                <span className="fgmLink" style={{cursor: "pointer"}} onClick={() => setViewerIndex(i)}>
                    <FileIcon fileName={e.fileName} sample={e.iconUrl} width={size} height={size}/>
                </span>
                {e.deleteAction && <span className="fgmDeleteBtn" onClick={async (ev) => { ev.stopPropagation(); await e.deleteAction!(); }}>&times;</span>}
            </div>)}
            {onAddFile && <div className={addCls}
                onClick={() => !addFileLoading && addFileInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => { dropCounter.current++; setOverDrop(true); }}
                onDragLeave={() => { dropCounter.current--; if (dropCounter.current <= 0) { dropCounter.current = 0; setOverDrop(false); } }}
                onDrop={(e) => { e.preventDefault(); dropCounter.current = 0; setOverDrop(false); setWindowDrag(false); if (!addFileLoading) onAddFile(Array.from(e.dataTransfer.files)); }}>
                {addFileLoading ? <div className="loader"></div> : "+"}
                <input ref={addFileInput} type="file" multiple style={{display: "none"}}
                    onChange={() => { const f = addFileInput.current; if (f?.files?.length) { onAddFile(Array.from(f.files)); f.value = ""; } }}/>
            </div>}
        </div>
        {viewerIndex !== null && <FileViewer
            files={data}
            currentIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onIndexChange={setViewerIndex}
        />}
    </>;
}
