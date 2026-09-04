export type AdSlot = "between-rounds" | "end-game";

export type AdsConsent = "unknown" | "denied" | "granted";

/**
 * The only provider surface Punto Medio needs. A real AdMob/AdSense adapter
 * can implement this without leaking provider details into the game.
 */
export interface AdsProvider {
  initialize(): Promise<void>;
  showInterstitial(slot: AdSlot): Promise<void>;
  showRewarded(rewardId: string): Promise<boolean>;
}

export interface AdsPort {
  initialize(): Promise<void>;
  showInterstitial(slot: AdSlot): Promise<void>;
  showRewarded(rewardId: string): Promise<boolean>;
}

export interface ConsentAwareAdsOptions {
  provider?: AdsProvider;
  consent?: AdsConsent | (() => AdsConsent);
  isOnline?: () => boolean;
  now?: () => number;
  maxInterstitialsPerSession?: number;
  interstitialCooldownMs?: number;
}

const DEFAULT_MAX_INTERSTITIALS_PER_SESSION = 1;
const DEFAULT_INTERSTITIAL_COOLDOWN_MS = 120_000;

function readConsent(value: ConsentAwareAdsOptions["consent"]): AdsConsent {
  return typeof value === "function" ? value() : (value ?? "unknown");
}

function defaultIsOnline() {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}

/**
 * Provider boundary for production ads.
 *
 * It is deliberately fail-closed: no provider call happens without explicit
 * consent, a network connection and successful initialization. Provider
 * errors are swallowed so an ad can never interrupt a local pass-and-play
 * session.
 */
export class ConsentAwareAds implements AdsPort {
  private readonly provider: AdsProvider | undefined;
  private readonly consentSource: ConsentAwareAdsOptions["consent"];
  private readonly isOnline: () => boolean;
  private readonly now: () => number;
  private readonly maxInterstitialsPerSession: number;
  private readonly interstitialCooldownMs: number;
  private initialized = false;
  private initializationAttempted = false;
  private interstitialCount = 0;
  private lastInterstitialAt: number | null = null;

  constructor(options: ConsentAwareAdsOptions = {}) {
    this.provider = options.provider;
    this.consentSource = options.consent ?? "unknown";
    this.isOnline = options.isOnline ?? defaultIsOnline;
    this.now = options.now ?? Date.now;
    this.maxInterstitialsPerSession = Math.max(0, options.maxInterstitialsPerSession ?? DEFAULT_MAX_INTERSTITIALS_PER_SESSION);
    this.interstitialCooldownMs = Math.max(0, options.interstitialCooldownMs ?? DEFAULT_INTERSTITIAL_COOLDOWN_MS);
  }

  async initialize() {
    if (this.initializationAttempted || !this.canUseAds()) return;
    this.initializationAttempted = true;
    if (!this.provider) return;

    try {
      await this.provider.initialize();
      this.initialized = true;
    } catch {
      this.initialized = false;
    }
  }

  async showInterstitial(slot: AdSlot) {
    if (!this.canShowProviderAd() || !this.canShowInterstitial()) return;
    this.interstitialCount += 1;
    this.lastInterstitialAt = this.now();
    try {
      await this.provider?.showInterstitial(slot);
    } catch {
      // Ads are optional. A provider failure must be indistinguishable from
      // an unavailable ad to the game.
    }
  }

  async showRewarded(rewardId: string) {
    if (!rewardId.trim() || !this.canShowProviderAd()) return false;
    try {
      return (await this.provider?.showRewarded(rewardId.trim())) ?? false;
    } catch {
      return false;
    }
  }

  private canUseAds() {
    return Boolean(this.provider) && this.isOnline() && readConsent(this.consentSource) === "granted";
  }

  private canShowProviderAd() {
    return this.canUseAds() && this.initialized;
  }

  private canShowInterstitial() {
    if (this.interstitialCount >= this.maxInterstitialsPerSession) return false;
    if (this.lastInterstitialAt === null) return true;
    return this.now() - this.lastInterstitialAt >= this.interstitialCooldownMs;
  }
}

/** Safe default used until a reviewed provider, IDs and consent flow exist. */
export class NoopAds implements AdsPort {
  async initialize() {}
  async showInterstitial(_slot: AdSlot) {}
  async showRewarded(_rewardId: string) { return false; }
}

// No provider is bundled yet. This keeps web, Android, offline and
// non-consented builds local-only and avoids accidental data transmission.
export const ads: AdsPort = new NoopAds();
