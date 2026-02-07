/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

type ReleaseNotesDialogContextValue = {
    openReleaseNotes: () => void;
    closeReleaseNotes: () => void;
};

const ReleaseNotesDialogContext = createContext<ReleaseNotesDialogContextValue | null>(null);

export function ReleaseNotesDialogProvider(props: {
    value: ReleaseNotesDialogContextValue;
    children: ReactNode;
}) {
    const { value, children } = props;
    return (
        <ReleaseNotesDialogContext.Provider value={value}>
            {children}
        </ReleaseNotesDialogContext.Provider>
    );
}

export function useReleaseNotesDialog(): ReleaseNotesDialogContextValue {
    const context = useContext(ReleaseNotesDialogContext);

    if (context) {
        return context;
    }

    return {
        openReleaseNotes: () => undefined,
        closeReleaseNotes: () => undefined
    };
}
