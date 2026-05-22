import {useEffect, useState} from "react";
import {GGFile} from "@grest-ts/schema-file";
import {ApiErrors} from "../ApiError";
import {TipBox} from "../form/other/TipBox";

export interface Props {
    src: GGFile | (() => Promise<GGFile>)
    width?: string | number;
    height?: string | number;
}

export function FileIframe({src, width, height}: Props) {
    const [url, setUrl] = useState<string>(undefined);
    const [error, setError] = useState<string>(undefined);

    useEffect(() => {
        let blobUrl: string | undefined;
        let cancelled = false;

        const load = async () => {
            try {
                const file = typeof src === "function" ? await src() : src;
                const buffer = await file.buffer();
                if (cancelled) return;
                const blob = new Blob([new Uint8Array(buffer)], {type: file.mimeType});
                blobUrl = URL.createObjectURL(blob);
                setUrl(blobUrl);
            } catch (e: any) {
                if (cancelled) return;
                setError(ApiErrors.is(e) ? ApiErrors.getDisplayMessage(e) : "Failed to load file");
            }
        };

        load();

        return () => {
            cancelled = true;
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [src]);

    return <div style={{width: width || "100%", height: height || "100%"}}>
        {error && <TipBox intent="danger" iconLetter="!">{error}</TipBox>}
        {url && <iframe src={url} style={{width: "100%", height: "100%"}}></iframe>}
    </div>
}
