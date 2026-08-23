export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const createCroppedImage = (
    imageSrc: string,
    crop: PixelCrop,
    outputWidth: number,
    outputHeight: number
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement("canvas");

            canvas.width = outputWidth;
            canvas.height = outputHeight;

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Could not create canvas context"));
                return;
            }

            ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0,
                outputWidth, outputHeight);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Could not create image blob"));
                    return;
                }

                const file = new File([blob], `cropped-${Date.now()}.jpg`,
                    { type: "image/jpeg" });
                resolve(file);
            },
                "image/jpeg",
                0.92
            );
        };

        image.onerror = () => {
            reject(new Error("Could not load image"));
        };

        image.src = imageSrc;
    });
};