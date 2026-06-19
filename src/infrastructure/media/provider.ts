import "server-only";

import { ApplicationError } from "@/infrastructure/errors/application-error";

export type MediaProvider = {
  createUploadSignature(input: unknown): Promise<unknown>;
  getAsset(publicId: string): Promise<unknown>;
  deleteAsset(publicId: string): Promise<void>;
};

export class UnconfiguredMediaProvider implements MediaProvider {
  public async createUploadSignature(): Promise<unknown> {
    throw unavailable();
  }

  public async getAsset(): Promise<unknown> {
    throw unavailable();
  }

  public async deleteAsset(): Promise<void> {
    throw unavailable();
  }
}

export const mediaProvider: MediaProvider = new UnconfiguredMediaProvider();

function unavailable(): ApplicationError {
  return new ApplicationError({
    code: "PROVIDER_UNAVAILABLE",
    message: "Media provider is not configured.",
    status: 503,
    retryable: true,
  });
}
