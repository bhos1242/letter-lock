import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create demo owner user
  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo Owner",
      password: passwordHash,
      isVerified: true,
      role: "USER",
    },
  });
  console.log("Created user:", user.email);

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
    },
  });
  console.log("Created org:", org.name);

  // Create owner membership
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });

  // Create branding placeholder
  await prisma.organizationBranding.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      primaryColor: "#2563eb",
      supportEmail: "hr@acme.com",
      website: "https://acme.com",
      address: "123 Business Ave, Tech City, TC 12345",
    },
  });

  // Create sample offer letter template
  const existingTemplate = await prisma.template.findFirst({
    where: { organizationId: org.id, name: "Standard Offer Letter" },
  });

  if (!existingTemplate) {
    const template = await prisma.template.create({
      data: {
        organizationId: org.id,
        name: "Standard Offer Letter",
        type: "OFFER_LETTER",
        status: "PUBLISHED",
        requiresApproval: false,
        createdById: user.id,
      },
    });

    const offerLetterContent = `<p>Dear {{candidate_name}},</p>

<p>We are pleased to extend an offer of employment to you for the position of <strong>{{job_title}}</strong> in the <strong>{{department}}</strong> department at <strong>{{company_name}}</strong>.</p>

<p>Your employment will commence on <strong>{{joining_date}}</strong>. You will be reporting directly to {{manager_name}}.</p>

<p>The compensation for this position is <strong>{{salary}}</strong> per annum, subject to applicable deductions as per law.</p>

<p>This offer is contingent upon the successful completion of background verification and submission of required documents prior to your joining date.</p>

<p>Please confirm your acceptance of this offer by signing and returning a copy of this letter by <strong>{{issue_date}}</strong>.</p>

<p>We look forward to welcoming you to our team and are excited about the contributions you will make to {{company_name}}.</p>

<p>Sincerely,<br/>Human Resources<br/>{{company_name}}</p>`;

    const version = await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        organizationId: org.id,
        versionNumber: 1,
        content: offerLetterContent,
        variableSchemaJson: JSON.stringify([
          "candidate_name",
          "job_title",
          "department",
          "joining_date",
          "manager_name",
          "salary",
          "issue_date",
        ]),
        createdById: user.id,
      },
    });

    await prisma.template.update({
      where: { id: template.id },
      data: { currentVersionId: version.id },
    });

    console.log("Created template:", template.name);
  }

  console.log("\nSeed complete!");
  console.log("Login: demo@example.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
