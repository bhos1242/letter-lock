import QRCode from "qrcode";

/**
 * Generates a QR code as a base64-encoded PNG data URL.
 */
export async function generateQRCode(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 150,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

/**
 * Generates a QR code as a raw PNG Buffer.
 */
export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 150,
  });
}
