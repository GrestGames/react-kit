export function Sq({value, decimals, hide0}: { value: number, decimals?: number, hide0?: boolean }) {
    if (isNaN(Number(value)) || Math.round(value * 100) / 100 === 0 && hide0) {
        return <></>
    } else {
        return <>{Number(value).toFixed(decimals === undefined ? 2 : decimals).replace(/\d(?=(\d{3})+$)/g, '$& ') + "m²"}</>
    }
}