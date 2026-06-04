export class ArrayUtils {

    public static removeElement<T>(array: T[], element: T): T[] {
        const index = array.indexOf(element);
        if (index === -1) {
            return array;
        }
        array.splice(index, 1);
        return array;
    }

    public static addIfNotExist<T>(array: T[], element: T | undefined): void {
        const index = array.indexOf(element as T)
        if (element && index === -1) {
            array.push(element);
        } else if (!element && index !== -1) {
            array.splice(index, 1);
        }
    }

    public static arrayToHumanStr(array: string[]): string {
        let str = "";
        for (let i = 0; i < array.length; i++) {
            if (i > 0) {
                if (i == array.length - 1) {
                    str += " and ";
                } else {
                    str += ", ";
                }
            }
            str += array[i];
        }
        return str;
    }

    public static makeList(input: string [], prefix: [string, string] = ["", ""]): string {
        if (input.length > 1) {
            const last = input.pop();
            return (prefix[1] ? prefix[1] + ": " : "") + input.join(", ") + " or " + last;
        } else if (input.length > 0) {
            return (prefix[0] ? prefix[0] + " " : "") + input[0];
        } else {
            return ""
        }
    }
}
