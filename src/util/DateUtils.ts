export type tDate = string & { __brand: "tDate" };
export type tYearMonth = string & { __brand: "tYearMonth" };

const month3 = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export class DateUtils {

    public static MAX_DATE = "9999-12-31";
    public static ZERO_DATE = "0000-00-00";

    /**
     * Returns in YYYY-MM-DD HH:MM:SS
     */
    public static dateTime(date: Date) {
        if (!date) {
            return '';
        }

        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        const month2 = (month < 10 ? "0" : "") + month;
        const day2 = (day < 10 ? "0" : "") + day;
        const hour2 = (hour < 10 ? "0" : "") + hour;
        const minute2 = (minute < 10 ? "0" : "") + minute;
        const second2 = (second < 10 ? "0" : "") + second;

        return year + "-" + month2 + "-" + day2 + " " + hour2 + ":" + minute2 + ":" + second2;

    }

    public static daysBetween(date1: string, date2: string) {
        return Math.round((new Date(date2).getTime() - new Date(date1).getTime()) / (24 * 60 * 60 * 1000));
    }

    /**
     * Returns now in YYYY-MM-DD format
     */
    public static dateNow(): tDate {
        return this.date(new Date()) as tDate;
    }

    /**
     * Returns YYYY-MM-DD format
     */
    public static date(date: Date): tDate {
        if (!date) {
            return undefined;
        }

        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        const month2 = (month < 10 ? "0" : "") + month;
        const day2 = (day < 10 ? "0" : "") + day;

        return year + "-" + month2 + "-" + day2 as tDate

    }

    /**
     * Returns YYYY-MM format
     */
    public static yearMonth(date: Date): string {
        if (!date) {
            return undefined;
        }

        let year = date.getFullYear();
        let month = date.getMonth() + 1;

        const month2 = (month < 10 ? "0" : "") + month;

        return year + "-" + month2

    }

    public static prevMonthLastDay(): tDate {
        const currentDate = new Date();
        currentDate.setDate(1);
        currentDate.setDate(currentDate.getDate() - 1);
        return this.date(currentDate);
    }

    public static getPrevYearMonth(): tYearMonth {
        const d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth();
        if (month === 0) {
            year -= 1;
            month = 12;
        }
        return year + "-" + (month < 10 ? "0" : "") + month as tYearMonth
    }

    public static getCurrentYearMonth(): tYearMonth {
        const d = new Date();
        const month = d.getMonth() + 1;
        return d.getFullYear() + "-" + (month < 10 ? "0" : "") + month as tYearMonth;
    }

    public static getNextYearMonth(): tYearMonth {
        const d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth() + 2;
        if (month === 12) {
            year += 1;
            month = 1;
        }
        return year + "-" + (month < 10 ? "0" : "") + month as tYearMonth
    }

    public static yearMonthToPeriod(yearMonth: tYearMonth): { start: tDate, end: tDate } {
        const [year, month] = yearMonth.split("-").map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        return {
            start: this.date(start),
            end: this.date(end)
        }
    }

    /** Converts a UTC datetime string (e.g. "2026-02-21 22:37:57") to a local date string */
    public static utcToLocalDate(utcDateTime: string): tDate {
        const d = new Date(utcDateTime.replace(" ", "T") + "Z");
        return this.date(d);
    }

    public static getMonth3(month: number) {
        return month3[month];
    }

}