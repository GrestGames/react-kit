import React, {useEffect, useState} from "react";

/**
 * Calculates position of a dropdown based on screen size, location of the element and so on.
 */
export function useDropDownPositioning(inputRef: React.MutableRefObject<HTMLElement>, intervalMs = 10) {
    const [dropDownPos, setDropDownPos] = useState<DropDownPos>(undefined)
    const maxHeight = 300;
    useEffect(() => {
        const updatePos = () => {
            if (inputRef.current) {
                const contentRect = inputRef.current.getBoundingClientRect();
                const maxHeightDown = window.innerHeight - contentRect.top - contentRect.height;
                let newPos: DropDownPos = undefined
                if (maxHeightDown > contentRect.top) {
                    const top = contentRect.top + contentRect.height;
                    newPos = {
                        location: "bottom",
                        left: contentRect.left,
                        top: top,
                        maxHeight: Math.min(maxHeight, maxHeightDown),
                        getTop: (elementHeight: number) => top
                    }
                } else {
                    const top = contentRect.top
                    const maxHeight2 = Math.min(maxHeight, contentRect.top);
                    newPos = {
                        location: "top",
                        left: contentRect.left,
                        top: top,
                        maxHeight: maxHeight2,
                        getTop: (elementHeight: number) => top - Math.min(maxHeight2, elementHeight)
                    }
                }
                setDropDownPos((current) => {
                    if (current && current.left === newPos.left && current.top === newPos.top && current.maxHeight === newPos.maxHeight) {
                        return current;
                    } else {
                        return newPos;
                    }
                })
            }
        }

        updatePos();

        const s = setInterval(() => updatePos(), intervalMs)
        return () => clearInterval(s)

    }, [inputRef.current]);
    return dropDownPos
}

export interface DropDownPos {
    location: "top" | "bottom"
    top: number,
    left: number,
    maxHeight: number,
    getTop: (elementHeight: number) => number
}