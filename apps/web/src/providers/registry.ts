import { ProviderError } from "./errors";
import type { PlaceProvider } from "./types";

export class ProviderRegistry {
  private readonly providers = new Map<string, PlaceProvider>();

  register(provider: PlaceProvider): void {
    if (this.providers.has(provider.id)) {
      throw new ProviderError({
        providerId: provider.id,
        code: "CONFIGURATION",
        message: `A provider with id ${provider.id} is already registered.`,
        retryable: false,
      });
    }

    this.providers.set(provider.id, provider);
  }

  get(id: string): PlaceProvider {
    const provider = this.providers.get(id);

    if (!provider) {
      throw new ProviderError({
        providerId: id,
        code: "NOT_FOUND",
        message: `No provider is registered with id ${id}.`,
        retryable: false,
      });
    }

    return provider;
  }

  list(): PlaceProvider[] {
    return [...this.providers.values()];
  }
}
