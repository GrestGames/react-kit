import {DependencyList, useEffect, useState} from "react";
import "./AutoComplete.css";
import {AsyncState, useAsyncState} from "../../helpers/useAsyncState";
import {AnyInputElement, useInputData} from "./StandardFormElementProps";
import {isPromise} from "../../util/isPromise";
import {autoUpdate, flip, FloatingPortal, offset, size, useFloating} from "@floating-ui/react";

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


    const valueName = (() => {
        const match = options?.find((e) => String(e.id) === String(data.value));
        return match?.name || (props.allowCustom && data.value !== undefined ? String(data.value) : "");
    })();

    useEffect(() => {
        // While focused the text is local (cleared on focus, then whatever the
        // user types); blur re-syncs it to the committed value.
        if (isFocused) return;
        setSearchString(valueName);
    }, [options, data.value, isFocused])

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
        refs.domReference.current?.blur();
        data.onChange?.(id)
    }

    useEffect(() => {
        if (!isOpen) return undefined;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(matches.length - 1, i + 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
            else if (e.key === "Enter") { e.preventDefault(); const m = matches[activeIndex]; if (m) select(m.id, m.name); }
            // type=text on purpose: type=search natively clears on Escape,
            // which would commit "" under allowCustom. Escape closes ONLY the
            // dropdown — stopPropagation keeps it from also closing a parent
            // popup (capture registration below runs this handler first).
            else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); refs.domReference.current?.blur(); }
        };
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [isOpen, matches, activeIndex])

    const inlineClass = props.inlineEdit ? " inlineEditSelect" + (!data.value ? " inlineEditEmpty" : "") : "";

    return <div className="formItem">
        {data.validationError ? <div className="validationErrorMsg">{data.validationError.msg}</div> : ""}
        {(setOptionsState.state === AsyncState.LOADING || setOptionsState.state === AsyncState.INIT) &&
            <input type="text" value="Loading..." disabled={true} style={props.style} className={"rkInput " + props.className + inlineClass}/>}
        {setOptionsState.state === AsyncState.ERROR && <input type="text" value="Failed to load options!" disabled={true} style={props.style} className={"rkInput error " + props.className + inlineClass}/>}
        {setOptionsState.state === AsyncState.OK && <>
            <input type="text" ref={refs.setReference}
                   autoComplete="off"
                   style={props.style}
                   name={data.name}
                   className={"rkInput " + props.className + " " + (data.isChanged ? "changed" : "") + " " + (data.validationError ? "error" : "") + inlineClass}
                   readOnly={props.readOnly || data.readOnly}
                   disabled={props.disabled}
                   value={searchString}
                   placeholder={isFocused && !searchString ? valueName : undefined}
                   onFocus={() => {
                       if (!props.readOnly && !data.readOnly) {
                           setIsFocused(true);
                           setIsFiltering(false);
                           // Clear the text so typing starts a fresh filter —
                           // the committed value stays (and shows as the
                           // placeholder below); blur re-syncs the display.
                           setSearchString("");
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
                             onMouseDown={(ev) => { ev.preventDefault(); select(e.id, e.name); }}>
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
