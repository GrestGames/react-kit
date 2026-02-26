export function FileSize({value}: { value: number }) {
    if (isNaN(Number(value))) {
        return <></>
    } else {
        let useVal;
        if (value < 1024) {
            useVal = Math.round(value) + "B";
        } else if (value < 1024 * 1024) {
            useVal = Math.round(value / 1024) + "KB";
        } else if (value < 1024 * 1024 * 1024) {
            useVal = Math.round(value / (1024 * 1024)) + "MB";
        } else if (value < 1024 * 1024 * 1024 * 1024) {
            useVal = Math.round(value / (1024 * 1024 * 1024)) + "GB";
        } else if (value < 1024 * 1024 * 1024 * 1024 * 1024) {
            useVal = Math.round(value / (1024 * 1024 * 1024 * 1024)) + "TB";
        } else {
            useVal = value + "B";
        }
        return <>{useVal}</>
    }
}