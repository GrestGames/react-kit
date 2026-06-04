import {GGFile} from "@grest-ts/schema-file";

export class ImageUtil {

    public static isImageFile(file: GGFile): boolean {
        const ext = file.name.split(".").pop()?.toLowerCase();
        return ext === "jpg" || ext === "png" || ext === "jpeg";
    }

    public static async createIcon(file: GGFile, width: number, height: number): Promise<GGFile | undefined> {

        if (!this.isImageFile(file)) {
            return undefined;
        }

        const buffer = await file.clone().buffer();
        const blob = new Blob([buffer as BlobPart], {type: file.mimeType});
        const dataUrl = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                URL.revokeObjectURL(dataUrl);
                const elem = document.createElement('canvas');
                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get 2d canvas context"));
                    return;
                }

                const scaleFactor = Math.max(width / img.width, height / img.height);

                const scaledWidth = img.width * scaleFactor;
                const scaledHeight = img.height * scaleFactor;

                const offsetX = (width - scaledWidth) / 2;
                const offsetY = (height - scaledHeight) / 2;

                ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
                ctx.canvas.toBlob(async (resultBlob) => {
                    if (!resultBlob) {
                        reject(new Error("Could not create blob from canvas"));
                        return;
                    }
                    const resultBuffer = new Uint8Array(await resultBlob.arrayBuffer());
                    resolve(GGFile.fromBuffer(resultBuffer, file.name, 'image/png'));
                }, 'image/png', 1);
            }
            img.onerror = error => {
                console.error(error);
                reject(error);
            };
        })
    }
}
