import crypto from "crypto";

export default function createSignature(payload: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}
