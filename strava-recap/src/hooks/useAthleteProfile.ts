import { useEffect, useState } from "react";
import { getFromStorage, setStorage, clearCacheByPrefix } from "../utils/storageCache";
import { parseProviderType, getProviderDisplayName, type ProviderType } from "../utils/provider";

type AthleteProfile = {
    firstName: string;
    lastName: string;
    fullName: string;
};

type AthleteApiResponse =
    | { connected: false }
    | { connected: true; provider?: string; profile: AthleteProfile };

const CACHE_KEY = "recapcache:profile";
const PROVIDER_CACHE_KEY = "recapcache:provider";

export function useAthleteProfile() {
    const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(() => {
        // Try to load from cache on initial render
        return getFromStorage<AthleteProfile>(CACHE_KEY);
    });
    const [connected, setConnected] = useState<boolean | null>(() => {
        // If we have cached profile, we're connected
        return getFromStorage<AthleteProfile>(CACHE_KEY) ? true : null;
    });
    const [provider, setProvider] = useState<ProviderType>(() => {
        return getFromStorage<ProviderType>(PROVIDER_CACHE_KEY);
    });

    useEffect(() => {
        // Skip API call if we have cached data
        const cachedData = getFromStorage<AthleteProfile>(CACHE_KEY);
        if (cachedData) {
            return;
        }

        let cancelled = false;
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/me");
                const data = (await res.json()) as AthleteApiResponse;
                
                if (cancelled) return;

                if (data.connected) {
                    setAthleteProfile(data.profile);
                    setConnected(true);
                    const providerType = parseProviderType(data.provider);
                    setProvider(providerType);
                    setStorage(CACHE_KEY, data.profile);
                    setStorage(PROVIDER_CACHE_KEY, providerType);
                } else {
                    // Clear all cache if not connected
                    setAthleteProfile(null);
                    setConnected(false);
                    setProvider(null);
                    clearCacheByPrefix("recapcache:");
                }
            } catch (e) {
                // Silently fail - profile is optional
            }
        };
        fetchProfile();
        return () => {
            cancelled = true;
        };
    }, []);

    const providerDisplayName = getProviderDisplayName(provider);

    return { athleteProfile, connected, provider, providerDisplayName };
}
