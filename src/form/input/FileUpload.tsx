import "./FileUpload.css"
import {useRef} from "react";
import {AnyInputElement, AnyInputElementWithValue, useInputData} from "./StandardFormElementProps";
import {GGFile} from "@grest-ts/schema-file";

export function FileUpload(props: AnyInputElement<GGFile>) {
    const data = useInputData<GGFile>(props);

    return _FilesUpload({
        ...props,
        multiple: false,
        value: data.value ? [data.value] : [],
        validationError: {msg: data.validationError?.msg, errors: [data.validationError]},
        onChange: (files) => {
            data.onChange(files[0]);
        },
    })
}

export function FileMultiUpload(props: AnyInputElement<GGFile[]>) {
    const data = useInputData<GGFile[]>(props);
    return _FilesUpload({
        ...props,
        multiple: true,
        value: data.value,
        validationError: data.validationError,
        onChange: data.onChange
    })
}

function _FilesUpload(props: AnyInputElementWithValue<GGFile[]> & { multiple?: boolean }) {
    const fileInput = useRef<HTMLInputElement>(null);

    const addNewFiles = async (filesData: FileList) => {
        const newEntries: GGFile[] = [];
        for (let i = 0; i < filesData.length; i++) {
            newEntries.push(GGFile.fromBrowserFile(filesData[i]));
        }
        if (props.multiple) {
            props.onChange([...(props.value || []), ...newEntries] as any);
        } else {
            props.onChange([newEntries[newEntries.length - 1]]);
        }
    }

    const removeFile = (no: number) => {
        const copy = props.value ? [...props.value] : [];
        copy.splice(no, 1)
        props.onChange(copy);
    }

    const dropMessageClass = "dropMessage " + (props.multiple ? "dropMessageMultiple" : "");
    const disabled = props.disabled || props.readOnly || props.readOnly;
    return <>
        {props.validationError?.msg && <div className="validationErrorMsg">{props.validationError.msg}</div>}
        <div className={"fileUploadDropZone " + (disabled && "disabled") + (props.validationError?.msg ? " error" : "") + " " + props.className}
                style={props.style}
                onClick={(e) => {
                    fileInput.current.click()
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    if (!disabled) {
                        addNewFiles(e.dataTransfer.files);
                    }
                }}>


        {!disabled && (!props.value || props.value.length === 0) && <div className={dropMessageClass}>Drag and drop a file here</div>}
        {(props.readOnly || props.readOnly) && <div className={dropMessageClass}>Can't upload files on readonly mode</div>}
        {(props.disabled) && <div className={dropMessageClass}>Can't upload files when disabled</div>}

        {props.value?.length > 0 && <table className="list" onClick={(e) => {
            e.stopPropagation();
        }}>
            <tbody>
            {props.value.map((f, i) => {
                const error = props.validationError?.errors?.[i];

                return <tr key={i} className={error?.msg ? "error" : ""}>
                    <td> {f.name}
                        {error?.msg ? <div className="validationErrorMsg">{error.msg}</div> : ""}
                    </td>
                    <td align="right"><a onClick={(e) => removeFile(i)}>Delete</a></td>
                </tr>
            })}
            </tbody>
        </table>}

        {!disabled && <input
            name={props.name}
            type="file" ref={fileInput}
            style={{display: "none"}}
            multiple={props.multiple}
            onChange={(e) => addNewFiles(fileInput.current.files)}
        />}
    </div>
    </>
}
