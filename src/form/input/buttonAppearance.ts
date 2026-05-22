import {createContext} from "react";

export type ButtonAppearance = "gradient" | "outline";

/**
 * Lets a container (e.g. `<Grid>`) set the default button appearance for its
 * subtree. An explicit `appearance` prop on a button always wins over this.
 */
export const ButtonAppearanceContext = createContext<ButtonAppearance | undefined>(undefined);
