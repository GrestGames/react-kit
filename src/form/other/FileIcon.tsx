import "./FileIcon.css";

export function FileIcon({fileName, sample, width, height}: { fileName: string, sample?: string, width: number, height: number }) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (sample && (ext === "jpg" || ext === "png" || ext === "jpeg")) {
        return <img src={sample} width={width} height={height}/>
    } else {
        return <div className={"fileIcon fileIcon-" + ext} style={{width: width, height: height}}></div>
    }
}
