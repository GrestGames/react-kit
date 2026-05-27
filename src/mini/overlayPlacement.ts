import {offset, type Middleware, type Placement} from "@floating-ui/react";

export type {Placement};

/** One placement vocabulary for every anchored overlay (ToolTip, Popover,
 *  ActionMenu): a Floating UI side+alignment, or "over" to center the floating
 *  element on top of its trigger. Overlays always flip/shift to stay on-screen;
 *  there is intentionally no "forced side" — pinning content off-screen is worse
 *  UX than letting it flip. */
export type OverlayPlacement = Placement | "over";

/** Offset middleware for the "over" placement — pulls the floating element back
 *  onto the trigger so the two are concentric (e.g. a panel opening over its
 *  button). Pair with no `flip` (there's no opposite side to flip to). */
export function overOffset(): Middleware {
    return offset(({rects}) => -rects.reference.height / 2 - rects.floating.height / 2);
}
