import {TipBox} from "../other/TipBox";
import {useState} from "react";
import "./DeleteObjectSection.css";
import {FormObject} from "../useAsyncForm";
import {ApiErrors} from "../../ApiError";
import {ERROR} from "@grest-ts/schema";
import {Alert} from "../../mini/Alert";
import {Button} from "../buttons/Button";

export interface Props<T> {
    prop: FormObject<T>
    objectName?: string;
    onDelete: () => void;
}

export function DeleteObjectSection<T>({objectName, prop, onDelete}: Props<T>) {
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState<ERROR<string, any> | undefined>(undefined)

    if (prop.getForm().isReadOnly()) {
        return <></>;
    }

    const deleteClick = async () => {
        try {
            await onDelete();
        } catch (e) {
            setError(ERROR.fromUnknown(e))
        }
    }

    const content = <table className="deleteObject">
        <tbody>
        <tr>
            <td align="left" style={{verticalAlign: "middle"}}><label>
                {error && <Alert intent="danger" onClick={() => setError(undefined)}>{ApiErrors.getDisplayMessage(error)}</Alert>}
                <input type="checkbox" checked={checked} onChange={(e) => {
                    setChecked(!!e.target.checked)
                }}/>
                {checked && <>Deleting is permanent! There is no undo.</>}
                {!checked && <>Check if you wish to delete this {objectName}.</>}
            </label></td>
            <td align="right" style={{verticalAlign: "middle"}}>{checked && <Button intent="danger" onClick={deleteClick}>Delete</Button>}</td>
        </tr>
        </tbody>
    </table>;

    if (checked) {
        return <TipBox intent="danger" iconLetter="!" style={{margin: "20px 0 20px 0"}}>{content}</TipBox>
    } else {
        return <TipBox intent="warning" iconLetter="!" style={{margin: "20px 0 20px 0"}}>{content}</TipBox>
    }

}