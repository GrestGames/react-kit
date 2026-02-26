import {DependencyList, useEffect, useRef, useState} from "react";
import "./AutoComplete.css";
import {AsyncState, useAsyncState} from "../../helpers/useAsyncState";
import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import {AddToBody} from "../../helpers/AddToBody";
import {DropDownPos, useDropDownPositioning} from "../../mini/useDropDownPositioning";
import {isPromise} from "../../util/isPromise";

import {ValueType} from "./Select";


export type AutoCompleteProps<K> = AnyInputElement<K> & {
    addEmpty?: boolean;
    options?: ValueType<K>[] | (() => ValueType<K>[]) | (() => Promise<ValueType<K>[]>)
    dependencies?: DependencyList
}


export function AutoComplete<K>(props: AutoCompleteProps<K>) {

    const [options, setOptions, setOptionsState] = useAsyncState<ValueType<K>[]>(Array.isArray(props.options) ? props.options : [], {disableErrorAutoHandling: true});
    const [searchString, setSearchString] = useState("")
    const [matches, setMatches] = useState<ValueType<K>[]>([]);

    const [isFocused, setIsFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null)
    const dropDownPos = useDropDownPositioning(inputRef);
    const data = useInputData(props);

    useEffect(() => {
        setOptions(async () => {
            if (typeof props.options === "function") {
                const options = props.options();
                const res = isPromise(options) ? await options : options;
                if (!props.addEmpty && res.length > 0 && !data.value) {
                    data.onChange(res[0].id as any)
                }
                return res;
            } else {
                return props.options
            }
        })
    }, props.dependencies || [])


    useEffect(() => {
        const match = options?.find((e) => String(e.id) === String(data.value));
        setSearchString(match?.name || "");
    }, [options, data.value])

    useEffect(() => {
        const res = searchOptions(options || [], searchString);
        if (props.addEmpty && !searchString) {
            res.unshift({id: undefined, name: ""})
        }
        setMatches(res);
    }, [options, searchString])

    useEffect(() => {
        if (isFocused && inputRef.current) {
            const el = inputRef.current;
            const observer = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) {
                    el.blur();
                }
            }, {root: null, rootMargin: '0px', threshold: 1.0});
            observer.observe(el);
            return () => observer.unobserve(el);
        }
        return undefined;
    }, [isFocused, inputRef.current]);

    const inlineClass = props.inlineEdit ? " inlineEditSelect" + (!data.value ? " inlineEditEmpty" : "") : "";

    return <>
        <div className="formItem">
            {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
            {(setOptionsState.state === AsyncState.LOADING || setOptionsState.state === AsyncState.INIT) &&
                <input type="search" value="Loading..." disabled={true} style={props.style} className={props.className + inlineClass}/>}
            {setOptionsState.state === AsyncState.ERROR && <input type="search" value="Failed to load options!" disabled={true} style={props.style} className={"error " + props.className + inlineClass}/>}
            {setOptionsState.state === AsyncState.OK && <>
                <input type="search" ref={inputRef}
                       autoComplete="off"
                       style={props.style}
                       name={data.name}
                       className={props.className + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "") + inlineClass}
                       readOnly={props.readOnly || data.readOnly}
                       disabled={props.disabled}
                       value={searchString}
                       onFocus={() => {
                           if (!props.readOnly && !data.readOnly) {
                               setIsFocused(true)
                           }
                       }}
                       onBlur={() => {
                           if (!props.readOnly && !data.readOnly) {
                               setIsFocused(false)
                           }
                       }}
                       onChange={(e) => {
                           if (!props.readOnly && !data.readOnly) {
                               setSearchString(e.target.value)
                               data.onChange?.(undefined)
                           }
                       }}/>
                {dropDownPos && <AutoCompleteOptionsDropDown
                    isFocused={isFocused}
                    options={matches}
                    dropDownPos={dropDownPos}
                    onSelect={(id, name) => {
                        setSearchString(name)
                        setIsFocused(false);
                        inputRef.current?.blur();
                        data.onChange?.(id)
                    }}/>}
            </>}
        </div>
    </>
}

function AutoCompleteOptionsDropDown<K>({options, dropDownPos, isFocused, onSelect}: {
    options: ValueType<K>[],
    dropDownPos: DropDownPos,
    isFocused: boolean,
    onSelect: (id: K, name: string) => void
}) {

    const [isMouseOverOptions, setIsMouseOverOptions] = useState(false);
    const [mousePos, setMousePos] = useState(0)
    const [isOpen, setIsOpen] = useState(false);
    const [top, setTop] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsOpen(isFocused || isMouseOverOptions)
    }, [isFocused, isMouseOverOptions])

    useEffect(() => {
        setMousePos(0);
        const keyUp = (e: KeyboardEvent) => {
            if (isOpen) {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    setMousePos((v) => {
                        let pos = v;
                        if (e.key === "ArrowUp") {
                            pos -= 1
                        } else if (e.key === "ArrowDown") {
                            pos += 1;
                        }
                        return Math.min(options.length - 1, Math.max(0, pos));
                    });
                } else if (e.key === "Enter") {
                    setMousePos((mousePos) => {
                        const item = options[mousePos];
                        if (item) {
                            selectItem(item.id, item.name);
                        }
                        e.preventDefault();
                        return 0;
                    })
                }
            }
        }
        const keyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === "Enter") {
                e.preventDefault();
            }
        }
        window.addEventListener("keyup", keyUp)
        window.addEventListener("keydown", keyDown)
        return () => {
            window.removeEventListener("keyup", keyUp);
            window.removeEventListener("keydown", keyDown);
        }
    }, [options, isOpen])

    useEffect(() => {
        if (isFocused) {
            const t = setTimeout(() => {
                setTop(dropDownPos.getTop(ref.current.offsetHeight))
            }, 0)
            return () => clearTimeout(t);
        } else {
            return undefined;
        }
    }, [isFocused, ref.current, dropDownPos, options])

    const selectItem = (id: K, name: string) => {
        onSelect(id, name)
        setIsOpen(false);
        setIsMouseOverOptions(false);
    }

    return isOpen && <AddToBody id="autoCompleteDropDown">
        <div className="autocompleteSearch" ref={ref}
             style={{visibility: top === undefined ? "hidden" : "visible", top: top, left: dropDownPos.left}}
             onMouseEnter={() => setIsMouseOverOptions(true)}
             onMouseLeave={() => setIsMouseOverOptions(false)}>
            <div style={{maxHeight: dropDownPos.maxHeight - 2}}>
                {options.length === 0 && <div>No matches</div>}
                {options.map((e, index) => {
                    return <div key={e.id === undefined ? "____" : String(e.id)}
                                className={index === mousePos ? "selected" : ""}
                                onMouseEnter={() => setMousePos(index)}
                                onClick={() => selectItem(e.id, e.name)}>
                        {e.name}
                    </div>
                })}
            </div>
        </div>
    </AddToBody>
}

function searchOptions<K>(values: ValueType<K>[], searchString: string) {
    const searched: ValueType<K>[] = [];
    searchString = searchString.toLowerCase();
    for (let i = 0; i < values.length; i++) {
        if (!values[i].name) {
            if (!searchString) {
                searched.push({id: values[i].id, name: "id: " + values[i].id + " (no name)"});
            }
        } else if (values[i].name.toLowerCase().indexOf(searchString) !== -1) {
            searched.push(values[i]);
        }
    }
    return searched;
}