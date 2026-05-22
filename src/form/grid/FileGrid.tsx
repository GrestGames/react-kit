import "./FileGrid.css";
import {useState} from "react";
import {FileIcon} from "../other/FileIcon";
import {Button} from "../input/Button";
import {FileViewer} from "../../mini/FileViewer";

export interface Props {
    box: {
        width: number;
        height: number
    }
    showDeleteButton: boolean;
    data: ItemInfo[]
}

export interface ItemInfo {
    fileName: string;
    created?: string;
    fileUrl: string;
    iconUrl?: string;
    deleteAction: () => Promise<void>
    renameAction?: () => void
}

export function FileGrid({data, box, showDeleteButton}: Props) {
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    return <>
        <div className="fileGrid">
            {data.map((e, i) => <div key={i} className="fileBox" style={{width: box.width}}>

                {showDeleteButton && <div className="deleteLinkArea">
                    <Button intent="danger" onClick={async () => e.deleteAction()} className="deleteLink">X</Button>
                </div>}

                <span className="fileLink" style={{cursor: "pointer"}} onClick={() => setViewerIndex(i)}>
                    <FileIcon fileName={e.fileName} sample={e.iconUrl} width={box.width} height={box.height}/>
                </span><br/>

                <span className="fileNameRow" style={{width: box.width}}>
                    <span className="fileName gray" style={{cursor: "pointer"}} onClick={() => setViewerIndex(i)}>
                        {e.fileName}
                    </span>
                    {e.renameAction && <span className="renameLink gray" onClick={e.renameAction}>&#9998;</span>}
                </span>
                <br/>
                <span className="mini gray">{e.created}</span>

            </div>)}
        </div>
        {viewerIndex !== null && <FileViewer
            files={data}
            currentIndex={viewerIndex}
            onClose={() => setViewerIndex(null)}
            onIndexChange={setViewerIndex}
        />}
    </>;
}
