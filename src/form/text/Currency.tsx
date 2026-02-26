export function Currency({value, className, hide0, signAlways, decimals}: { value: number, className?: string, signAlways?: boolean, hide0?: boolean, decimals?: number }) {
    if (isNaN(Number(value)) || Math.round(value * 100) / 100 === 0 && hide0) {
        return <></>
    } else {
        const [main, com] = Number(Math.abs(value)).toFixed(decimals === undefined ? 2 : decimals).split(".");
        let part = "";
        let spaces = 0;
        for (let i = main.length - 1; i >= 0; i--) {
            part += main[i];
            if ((part.length - spaces) % 3 === 0) {
                part += " ";
                spaces++
            }
        }
        part = part.split("").reverse().join("").trim();
        return <span className={className} style={{"whiteSpace": "nowrap"}}>{(value > 0 && signAlways ? "+" : "") + (value < 0 ? "-" : "") + part + (com ? "." + com : "") + "€"}</span>
    }
}

export function CurrencyPosNeg({value, hide0, signAlways}: { value: number, hide0?: boolean, signAlways?: boolean }) {
    const className = value >= 0 ? "green" : "red"
    return <Currency value={value} className={className} hide0={hide0} signAlways={signAlways}/>
}