import "server-only";

import { createHash, randomBytes } from "node:crypto";

import QRCode from "qrcode";
import { OTP } from "otplib";

const otp = new OTP({ strategy: "totp" });

export type TotpEnrollment = {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  manualKey: string;
};

export async function createTotpEnrollment(email: string): Promise<TotpEnrollment> {
  const secret = otp.generateSecret();
  const otpauthUrl = otp.generateURI({
    issuer: "Deodar Wears",
    label: email,
    secret,
  });

  return {
    secret,
    otpauthUrl,
    qrCodeDataUrl: await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 192 }),
    manualKey: secret,
  };
}

export function verifyTotp(token: string, secret: string): boolean {
  return otp.verifySync({ token, secret }).valid;
}

export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    [randomBytes(2), randomBytes(2), randomBytes(2)]
      .map((part) => part.toString("hex").toUpperCase())
      .join("-"),
  );
}

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}
