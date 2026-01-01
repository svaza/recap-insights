import { Navigate, Route, Routes } from "react-router-dom";
import SelectPage from "./pages/SelectPage";
import RecapPage from "./pages/RecapPage";
import ProviderCallbackPage from "./pages/ProviderCallbackPage";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/select" replace />} />
            <Route path="/select" element={<SelectPage />} />
            <Route path="/recap" element={<RecapPage />} />
            <Route path="/provider/callback" element={<ProviderCallbackPage />} />
            <Route path="*" element={<Navigate to="/select" replace />} />
        </Routes>
    );
}
