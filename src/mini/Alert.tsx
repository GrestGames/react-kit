import {PropsWithChildren} from 'react'
import {AddToBody} from "../helpers/AddToBody";
import {DarkBackground} from "./DarkBackground";
import {Panel} from "./Panel";
import {ErrorBox} from "../form/other/TipBox";

interface Props {
    title?: string;
    buttonTitle?: string;
    onClick?: () => void;
    width?: number
}

export function Alert({title, children, buttonTitle, onClick, width}: PropsWithChildren<Props>) {
    return <AddToBody id="alert">
        <DarkBackground zIndex={200} onClick={onClick}/>
        <Panel width={width || "250px"} zIndex={201} style={{marginTop: "200px"}}>
            <div style={{padding: "10px", marginBottom: "5px"}}>
                {title && <b className="bigText">{title}<br/></b>}
                {children}
            </div>
            <button onClick={onClick} style={{position: "relative", left: "50%", transform: "translateX(-50%)"}}>{buttonTitle || 'Oh well...'}</button>
        </Panel>
    </AddToBody>
}

export function ErrorAlert(props: PropsWithChildren<Props>) {

    let children: any = props.children;
    if (typeof props.children === "string") {
        children = convertLineBreaksToBr(children);
    }

    return <Alert {...props}>
        <ErrorBox>
            {children}
        </ErrorBox>
    </Alert>
}

function convertLineBreaksToBr(string: string) {
    return string.split('\n').map((line: string, index: number, array: string[]) => (
        <span key={index}>
            {line}{index !== array.length - 1 && <br/>}
        </span>
    ));
}