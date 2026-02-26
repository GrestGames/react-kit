export class StringUtils {

    public static lcFirst(str: string) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    };

    public static ucFirst(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

}
