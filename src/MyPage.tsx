import {PropsWithChildren, useEffect} from "react";

export function MyPage({children}: PropsWithChildren<{}>) {
    return <div className="page">{children}</div>
}

export function useDisableMainPage() {
    return useEffect(() => {
        disableMainArea();
        return () => {
            enableMainArea();
        }
    })
}

let noOfDisables = 0;
let lastScrollPos: number;

export function disableMainArea() {
    noOfDisables++;
    lastScrollPos = window.scrollY;
    window.scroll({top: 0})
    const page = document.getElementsByClassName("main") as HTMLCollectionOf<HTMLDivElement>
    document.body.style.overflow = "hidden";
    document.body.style.height = window.innerHeight + "px";
    for (let i = 0; i < page.length; i++) {
        page[i].style.position = "relative";
        page[i].style.top = (-lastScrollPos) + "px";
    }
}

export function enableMainArea() {
    noOfDisables--;
    if (noOfDisables <= 0) {
        noOfDisables = 0;
        const page = document.getElementsByClassName("main") as HTMLCollectionOf<HTMLDivElement>
        document.body.style.overflow = "";
        document.body.style.height = "";
        for (let i = 0; i < page.length; i++) {
            page[i].style.position = "";
            page[i].style.top = "";
        }
        window.scroll({top: lastScrollPos})
    }
}