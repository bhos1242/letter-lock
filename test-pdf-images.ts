import { prisma_db } from "./lib/prisma";
import { getPresignedDownloadUrl } from "./lib/storage";

async function main() {
  const brandings = await prisma_db.organizationBranding.findMany({});
  for (const b of brandings) {
    console.log("Branding:", b.id);
    if (b.logoUrl) {
      console.log("Logo:", b.logoUrl);
      if (b.logoUrl.startsWith("/api/assets/")) {
        const key = b.logoUrl.replace("/api/assets/", "");
        console.log("Key:", key);
        const presigned = await getPresignedDownloadUrl(key);
        console.log("Presigned:", presigned.slice(0, 100) + "...");
        
        // Let's try to fetch it
        const res = await fetch(presigned);
        console.log("Fetch logo status:", res.status);
      }
    }
  }
}
main();
