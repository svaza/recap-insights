import { useGetProfileQuery } from "../store";
import { getProviderDisplayName } from "../utils/provider";

export function useAthleteProfile() {
    const { data, isLoading } = useGetProfileQuery();

    const athleteProfile = data?.profile ?? null;
    const connected = data ? data.connected : null;
    const provider = data?.provider ?? null;
    const providerDisplayName = getProviderDisplayName(provider);

    return { athleteProfile, connected, provider, providerDisplayName, isLoading };
}
