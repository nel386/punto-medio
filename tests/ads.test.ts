import { describe, expect, it, vi } from "vitest";
import { ConsentAwareAds, NoopAds, type AdsProvider } from "../src/platform/ads";

function providerMock(): AdsProvider {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    showInterstitial: vi.fn().mockResolvedValue(undefined),
    showRewarded: vi.fn().mockResolvedValue(true),
  };
}

describe("contrato de anuncios", () => {
  it("mantiene el modo por defecto local y sin anuncios", async () => {
    const ads = new NoopAds();

    await expect(ads.initialize()).resolves.toBeUndefined();
    await expect(ads.showInterstitial("between-rounds")).resolves.toBeUndefined();
    await expect(ads.showRewarded("bonus")).resolves.toBe(false);
  });

  it("no contacta con el proveedor sin consentimiento explícito", async () => {
    const provider = providerMock();
    const ads = new ConsentAwareAds({ provider, consent: "unknown", isOnline: () => true });

    await ads.initialize();
    await ads.showInterstitial("between-rounds");
    await expect(ads.showRewarded("bonus")).resolves.toBe(false);

    expect(provider.initialize).not.toHaveBeenCalled();
    expect(provider.showInterstitial).not.toHaveBeenCalled();
    expect(provider.showRewarded).not.toHaveBeenCalled();
  });

  it("usa el proveedor solo online, con consentimiento y una vez por sesión", async () => {
    const provider = providerMock();
    const ads = new ConsentAwareAds({
      provider,
      consent: "granted",
      isOnline: () => true,
      interstitialCooldownMs: 0,
    });

    await ads.initialize();
    await ads.showInterstitial("between-rounds");
    await ads.showInterstitial("end-game");

    expect(provider.initialize).toHaveBeenCalledTimes(1);
    expect(provider.showInterstitial).toHaveBeenCalledTimes(1);
    expect(provider.showInterstitial).toHaveBeenCalledWith("between-rounds");
  });

  it("trata la falta de conexión como fallback silencioso", async () => {
    const provider = providerMock();
    const ads = new ConsentAwareAds({ provider, consent: "granted", isOnline: () => false });

    await ads.initialize();
    await ads.showInterstitial("between-rounds");

    expect(provider.initialize).not.toHaveBeenCalled();
    expect(provider.showInterstitial).not.toHaveBeenCalled();
  });

  it("absorbe fallos del proveedor y no convierte el anuncio en requisito", async () => {
    const provider: AdsProvider = {
      initialize: vi.fn().mockRejectedValue(new Error("SDK no disponible")),
      showInterstitial: vi.fn().mockRejectedValue(new Error("sin inventario")),
      showRewarded: vi.fn().mockRejectedValue(new Error("cerrado")),
    };
    const ads = new ConsentAwareAds({ provider, consent: "granted", isOnline: () => true });

    await expect(ads.initialize()).resolves.toBeUndefined();
    await expect(ads.showInterstitial("end-game")).resolves.toBeUndefined();
    await expect(ads.showRewarded("bonus")).resolves.toBe(false);
  });
});
