import crypto from "crypto";

export default function createSignature(payload: string, secret: string) {
    return crypto
        .createHash("sha256")
        .update(payload + secret)
        .digest("hex");
}
