import {DateUtils} from "../../util/DateUtils";

export function DatePast({date}: { date: string }) {
    const now = DateUtils.dateNow();
    const className = now < date ? "green" : "red";
    return <span className={className}>{date === DateUtils.MAX_DATE ? "∞" : date}</span>
}