import { useEffect, useState } from "react";

export function possessive(name: string) {
    const n = name.trim();
    if (!n) return "Your";
    return /s$/i.test(n) ? `${n}’` : `${n}’s`;
}

export function useIsNarrow(bp = 640) {
    const [isNarrow, setIsNarrow] = useState(() => window.innerWidth < bp);
    useEffect(() => {
        const onResize = () => setIsNarrow(window.innerWidth < bp);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [bp]);
    return isNarrow;
}
