import { useGetRecapQuery, type RecapData } from "../store";
import { getProviderDisplayName } from "../utils/provider";

export function useFetchRecap(queryString: string) {
    const { data, isLoading, error: queryError } = useGetRecapQuery(queryString);

    // Determine connection state and extract data
    const isConnected = data && "connected" in data ? data.connected : null;
    const hasError = data && "error" in data && data.connected === true;
    const recapData = data && "total" in data ? (data as RecapData) : null;

    const connected = isConnected;
    const loading = isLoading;
    const error = hasError ? (data as { error: string }).error : queryError ? String(queryError) : null;
    const provider = recapData?.provider ?? null;
    const providerDisplayName = getProviderDisplayName(provider);
    const highlights = recapData?.highlights ?? null;
    const total = recapData?.total ?? null;
    const breakdown = recapData?.breakdown ?? [];
    const range = recapData?.range ?? null;
    const activeDays = recapData?.activeDays ?? [];

    return {
        loading,
        connected,
        error,
        provider,
        providerDisplayName,
        highlights,
        total,
        breakdown,
        range,
        activeDays,
    };
}
