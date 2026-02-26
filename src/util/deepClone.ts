export function deepClone(obj: any) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        const arrCopy: any[] = [];
        obj.forEach((val, i) => {
            arrCopy[i] = deepClone(val);
        });
        return arrCopy;
    }

    if (obj instanceof Object) {
        const objCopy: any = {};
        Object.keys(obj).forEach(key => {
            objCopy[key] = deepClone(obj[key]);
        });
        return objCopy;
    }

    throw new Error('Unable to copy object! Its type is not supported.');
}