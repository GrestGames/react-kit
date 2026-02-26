import {GGFile} from "@grest-ts/schema-file";

export async function download(file: GGFile) {
    if (file) {
        const buffer = await file.buffer();
        const blob = new Blob([new Uint8Array(buffer)], {type: file.mimeType});
        const url = URL.createObjectURL(blob);
        const element = document.createElement("a");
        element.href = url;
        element.download = decodeURIComponent(file.name);
        element.target = "_blank";
        document.body.append(element);
        element.click();
        element.remove();
        URL.revokeObjectURL(url);
    } else {
        console.error("Can't download non existing input", file)
    }
}
