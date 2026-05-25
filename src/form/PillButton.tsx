import {forwardRef} from "react";
import {Intent} from "../intents";
import {ToolTipSupported} from "../mini/ToolTip";
import {ChipPrimitive} from "./ChipPrimitive";

interface PillButtonProps extends ToolTipSupported {
    children: React.ReactNode;
    onClick?: () => void;
    dotted?: boolean;
    active?: boolean;
    bold?: boolean;
    disabled?: boolean;
    loading?: boolean;
    intent?: Intent;
    className?: string;
}

export const PillButton = forwardRef<HTMLSpanElement, PillButtonProps>(function PillButton(
    {children, onClick, dotted, active, bold, disabled, loading, intent = "default", className, title, titleProps},
    ref,
) {
    let extraCls = "";
    if (dotted) extraCls += " pillDotted";
    if (bold) extraCls += " pillBold";
    const cls = extraCls.trim() || undefined;

    return (
        <ChipPrimitive
            ref={ref}
            variant="pill"
            intent={intent}
            active={active}
            disabled={disabled}
            loading={loading}
            onClick={onClick}
            className={cls ? (className ? cls + " " + className : cls) : className}
            title={title}
            titleProps={titleProps}
        >
            {children}
        </ChipPrimitive>
    );
});
