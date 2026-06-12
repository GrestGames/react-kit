import {DependencyList, useEffect, useRef, useState} from "react";
import "./AutoComplete.css";
import {AsyncState, useAsyncState} from "../../helpers/useAsyncState";
import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import {isPromise} from "../../util/isPromise";
import {autoUpdate, flip, FloatingPortal, offset, size, useFloating, useMergeRefs} from "@floating-ui/react";

import {ValueType} from "./Select";


export type AutoCompleteProps<K> = AnyInputElement<K> & {
    addEmpty?: boolean;
    /** Typed text commits as the value (K must be string) — options become
     *  suggestions rather than the only valid inputs. */
    allowCustom?: boolean;
    options?: ValueType<K>[] | (() => ValueType<K>[]) | (() => Promise<ValueType<K>[]>)
    dependencies?: DependencyList
}


export function AutoComplete<K>(props: AutoCompleteProps<K>) {

    const [options, setOptions, setOptionsState] = useAsyncState<ValueType<K>[]>(Array.isArray(props.options) ? props.options : [], {disableErrorAutoHandling: true});
    const [searchString, setSearchString] = useState("")
    const [matches, setMatches] = useState<ValueType<K>[]>([]);
    // The displayed text only narrows the dropdown after the user TYPES —
    // opening with a selected value shows every option (otherwise the list
    // collapses to the one already-selected entry); selecting resets.
    const [isFiltering, setIsFiltering] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [isMouseOver, setIsMouseOver] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null)
    const data = useInputData(props);

    const isOpen = isFocused || isMouseOver;

    const {refs, floatingStyles} = useFloating<HTMLInputElement>({
        open: isOpen,
        placement: "bottom-start",
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(2),
            flip({padding: 8}),
            size({
                padding: 8,
                apply({rects, elements, availableHeight}) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                        maxHeight: `${Math.max(80, Math.min(availableHeight, 320))}px`,
                    });
                },
            }),
        ],
    });
    const setInputRef = useMergeRefs([inputRef, refs.setReference]);

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
                return props.options || []
            }
        })
    }, props.dependencies || [])


    useEffect(() => {
        // Don't clobber the text mid-typing; blur/select re-syncs it below.
        if (isFocused && isFiltering) return;
        const match = options?.find((e) => String(e.id) === String(data.value));
        setSearchString(match?.name || (props.allowCustom && data.value !== undefined ? String(data.value) : ""));
    }, [options, data.value, isFocused, isFiltering])

    useEffect(() => {
        const filter = isFiltering ? searchString : "";
        const res = searchOptions(options || [], filter);
        if (props.addEmpty && !filter) {
            res.unshift({id: undefined as K, name: ""})
        }
        setMatches(res);
    }, [options, searchString, isFiltering])

    useEffect(() => {
        setActiveIndex(0);
    }, [matches, isOpen])

    const select = (id: K, name: string) => {
        setSearchString(name)
        setIsFiltering(false);
        setIsFocused(false);
        setIsMouseOver(false);
        inputRef.current?.blur();
        data.onChange?.(id)
    }

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(matches.length - 1, i + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
            else if (e.key === "Enter") { e.preventDefault(); const m = matches[activeIndex]; if (m) select(m.id, m.name); }
            else if (e.key === "Escape") { inputRef.current?.blur(); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, matches, activeIndex])

    const inlineClass = props.inlineEdit ? " inlineEditSelect" + (!data.value ? " inlineEditEmpty" : "") : "";

    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        {(setOptionsState.state === AsyncState.LOADING || setOptionsState.state === AsyncState.INIT) &&
            <input type="search" value="Loading..." disabled={true} style={props.style} className={"rkInput " + props.className + inlineClass}/>}
        {setOptionsState.state === AsyncState.ERROR && <input type="search" value="Failed to load options!" disabled={true} style={props.style} className={"rkInput error " + props.className + inlineClass}/>}
        {setOptionsState.state === AsyncState.OK && <>
            <input type="search" ref={setInputRef}
                   autoComplete="off"
                   style={props.style}
                   name={data.name}
                   className={"rkInput " + props.className + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "") + inlineClass}
                   readOnly={props.readOnly || data.readOnly}
                   disabled={props.disabled}
                   value={searchString}
                   onFocus={(e) => {
                       if (!props.readOnly && !data.readOnly) {
                           setIsFocused(true);
                           setIsFiltering(false);
                           // Select-all so typing replaces the current value
                           // instead of appending to it.
                           e.target.select();
                       }
                   }}
                   onBlur={() => { if (!props.readOnly && !data.readOnly) setIsFocused(false) }}
                   onChange={(e) => {
                       if (!props.readOnly && !data.readOnly) {
                           setSearchString(e.target.value)
                           setIsFiltering(true)
                           data.onChange?.(props.allowCustom ? (e.target.value as K) : (undefined as K))
                       }
                   }}/>
            {isOpen && <FloatingPortal>
                <div ref={refs.setFloating} className="autocompleteSearch"
                     style={{...floatingStyles, zIndex: "var(--rk-z-menu)"}}
                     onMouseEnter={() => setIsMouseOver(true)}
                     onMouseLeave={() => setIsMouseOver(false)}>
                    {matches.length === 0 && <div className="autocompleteEmpty">No matches</div>}
                    {matches.map((e, index) =>
                        <div key={e.id === undefined ? "____" : String(e.id)}
                             className={index === activeIndex ? "selected" : ""}
                             onMouseEnter={() => setActiveIndex(index)}
                             onClick={() => select(e.id, e.name)}>
                            {e.name}
                        </div>)}
                </div>
            </FloatingPortal>}
        </>}
    </div>
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
