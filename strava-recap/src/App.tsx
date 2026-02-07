import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import SelectPage from "./pages/SelectPage";
import RecapPage from "./pages/RecapPage";
import FlyerPage from "./pages/FlyerPage";
import ProviderCallbackPage from "./pages/ProviderCallbackPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import {
    CURRENT_APP_VERSION,
    RELEASE_VERSION_STORAGE_KEY
} from "./config/releases";
import { useDisconnectMutation } from "./store";
import { clearCacheByPrefix } from "./utils/storageCache";
import {
    ReleaseNotesDialogProvider,
    useReleaseNotesDialog
} from "./context/ReleaseNotesDialogContext";
import ReleaseNotesModal from "./ui/ReleaseNotesModal";
import "./App.css";

function ReleaseNotesRouteHandler() {
    const navigate = useNavigate();
    const { openReleaseNotes } = useReleaseNotesDialog();

    useEffect(() => {
        openReleaseNotes();
        navigate("/select", { replace: true });
    }, [navigate, openReleaseNotes]);

    return null;
}

export default function App() {
    const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
    const [disconnect] = useDisconnectMutation();
    const hasCheckedReleaseVersion = useRef(false);

    const openReleaseNotes = useCallback(() => {
        setIsReleaseNotesOpen(true);
    }, []);

    const closeReleaseNotes = useCallback(() => {
        setIsReleaseNotesOpen(false);
    }, []);

    useEffect(() => {
        if (hasCheckedReleaseVersion.current) {
            return;
        }
        hasCheckedReleaseVersion.current = true;

        const run = async () => {
            let storedVersion: string | null = null;

            try {
                storedVersion = localStorage.getItem(RELEASE_VERSION_STORAGE_KEY);
            } catch {
                return;
            }

            const normalizedStoredVersion = storedVersion?.trim() ?? "";
            const shouldRunReleaseFlow = normalizedStoredVersion !== CURRENT_APP_VERSION;

            if (shouldRunReleaseFlow) {
                clearCacheByPrefix("recapcache:");

                try {
                    await disconnect().unwrap();
                } catch {
                    // Ignore disconnect errors during release migration checks.
                }

                openReleaseNotes();
            }

            try {
                localStorage.setItem(RELEASE_VERSION_STORAGE_KEY, CURRENT_APP_VERSION);
            } catch {
                // Ignore localStorage write errors.
            }
        };

        void run();
    }, [disconnect, openReleaseNotes]);

    const releaseDialogContext = useMemo(
        () => ({ openReleaseNotes, closeReleaseNotes }),
        [closeReleaseNotes, openReleaseNotes]
    );

    return (
        <ReleaseNotesDialogProvider value={releaseDialogContext}>
            <Routes>
                <Route path="/" element={<Navigate to="/select" replace />} />
                <Route path="/select" element={<SelectPage />} />
                <Route path="/recap" element={<RecapPage />} />
                <Route path="/flyer" element={<FlyerPage />} />
                <Route path="/provider/callback" element={<ProviderCallbackPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/releases" element={<ReleaseNotesRouteHandler />} />
                <Route path="*" element={<Navigate to="/select" replace />} />
            </Routes>

            <ReleaseNotesModal open={isReleaseNotesOpen} onClose={closeReleaseNotes} />
        </ReleaseNotesDialogProvider>
    );
}
