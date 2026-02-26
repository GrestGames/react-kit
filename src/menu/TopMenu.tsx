import "./TopMenu.css"
import React, {ReactNode, useEffect, useRef, useState} from "react";
import {useIsMobile} from "../responsive/useResponsive";

export interface TopMenuSubItem {
    title: string;
    onClick: () => void;
    isVisible?: boolean;
    isActive?: boolean;
}

export interface TopMenuItem {
    title: ReactNode;
    onClick?: () => void;
    isVisible?: boolean;
    isActive?: boolean;
    subItems?: TopMenuSubItem[];
}

export interface TopMenuProps {
    items: TopMenuItem[];
    rightItems?: TopMenuItem[];
    /** Rendered between main items and right items on desktop (e.g. company selector) */
    extra?: ReactNode;
    /** Rendered at top of mobile dropdown (e.g. company selector) */
    mobileExtra?: ReactNode;
    /** Override auto-detected current page title shown on mobile */
    currentPageTitle?: ReactNode;
}

export function TopMenu({items, rightItems = [], extra, mobileExtra, currentPageTitle}: TopMenuProps) {
    const isMobile = useIsMobile();
    const [menuOpen, setMenuOpen] = useState(false);
    const [submenusHidden, setSubmenusHidden] = useState(false);
    const [touchOpenMenu, setTouchOpenMenu] = useState<string | null>(null);
    const wasTouchRef = useRef(false);

    // Close touch-opened submenu on outside click
    useEffect(() => {
        if (touchOpenMenu === null) return () => {};
        const handler = () => setTouchOpenMenu(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [touchOpenMenu]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobile && menuOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            return () => {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                window.scrollTo(0, scrollY);
            };
        }
        return () => {};
    }, [isMobile, menuOpen]);

    const allMenus = [...items, ...rightItems];

    const autoPageTitle = (() => {
        for (const item of allMenus) {
            if (item.isActive && item.onClick) return item.title;
            const sub = item.subItems?.find(sub => sub.isActive);
            if (sub) return sub.title;
        }
        return "";
    })();

    const resolvedPageTitle = currentPageTitle ?? autoPageTitle;

    const navigate = (action: () => void) => {
        return (e: React.MouseEvent<HTMLElement>) => {
            action();
            setMenuOpen(false);
            setSubmenusHidden(true);
            setTouchOpenMenu(null);
        }
    }

    const renderMenu = (menuItems: TopMenuItem[], rightAlign: boolean, keyPrefix: string) => {
        return menuItems.map((item, i) => {
            if (item.isVisible === false) return undefined;

            const visibleSubItems = item.subItems?.filter(sub => sub.isVisible !== false);
            const hasSubItems = visibleSubItems && visibleSubItems.length > 0;
            if (!item.onClick && item.subItems && !hasSubItems) return undefined;
            const isActive = item.isActive || visibleSubItems?.some(sub => sub.isActive);
            const menuKey = keyPrefix + i;
            const isTouchOpen = touchOpenMenu === menuKey;

            const handleClick = (e: React.MouseEvent<HTMLElement>) => {
                const isTouch = wasTouchRef.current;
                wasTouchRef.current = false;
                // Mobile hamburger: submenus are already inline, just navigate
                if (isMobile && item.onClick) {
                    navigate(item.onClick)(e);
                    return;
                }
                if (hasSubItems && (isTouch || !item.onClick)) {
                    e.stopPropagation();
                    if (isTouchOpen) {
                        setTouchOpenMenu(null);
                        if (item.onClick) item.onClick();
                    } else {
                        setTouchOpenMenu(menuKey);
                    }
                    return;
                }
                if (item.onClick) navigate(item.onClick)(e);
            };

            return <div key={i} className={"topMenuItem" + (hasSubItems ? " hasSubmenu" : "") + (rightAlign ? " topMenuRight" : "") + (isTouchOpen ? " touchOpen" : "")}
                        onMouseLeave={() => submenusHidden && setSubmenusHidden(false)}>
                <span onTouchEnd={() => { wasTouchRef.current = true; }}
                      onClick={handleClick}
                      className={"button " + (isActive ? "selected" : "")}>{item.title}</span>
                {hasSubItems && <div className={"submenu" + (rightAlign ? " submenuRight" : "")}>
                    {visibleSubItems.map((sub, j) => (
                        <span key={j} className={"submenuItem" + (sub.isActive ? " selected" : "")} onClick={navigate(sub.onClick)}>{sub.title}</span>
                    ))}
                </div>}
            </div>
        })
    }

    return <>
        {/* Mobile backdrop — dims page and closes menu on tap */}
        {isMobile && menuOpen && <div className="topMenuBackdrop" onClick={() => setMenuOpen(false)}/>}

        <div className="topMenu">

            {/* Hamburger toggle (visible only on mobile via CSS) */}
            <span className="menuToggle" onClick={() => setMenuOpen(!menuOpen)}>&#9776;</span>

            {/* Mobile: show current page name */}
            {isMobile && <span className="topMenuPageTitle">{resolvedPageTitle || ""}</span>}

            {/* Mobile: right icons always visible in top bar */}
            {isMobile && <div className={"topMenuIcons" + (submenusHidden ? " submenusHidden" : "")}>
                {renderMenu(rightItems, true, "r")}
            </div>}

            {/* Menu items (desktop: inline, mobile: vertical dropdown) */}
            <div className={"topMenuItems" + (isMobile && menuOpen ? " topMenuOpen" : "") + (submenusHidden ? " submenusHidden" : "")}>

                {/* Mobile extra content (e.g. company selector) */}
                {isMobile && mobileExtra && <div className="topMenuCompanyRow">{mobileExtra}</div>}

                {renderMenu(items, false, "m")}

                {!isMobile && <div className="topMenuDivider"/>}

                {/* Desktop extra content (e.g. company selector) */}
                {!isMobile && extra}

                {!isMobile && renderMenu(rightItems, true, "r")}
            </div>
        </div>
    </>
}
