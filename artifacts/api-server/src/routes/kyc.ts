import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const VALID_REVIEW_STATUSES = ["verified", "rejected", "reviewing", "requires_resubmission", "not_verified"] as const;
type ReviewStatus = typeof VALID_REVIEW_STATUSES[number];

/** Parse DD/MM/YYYY — returns null if invalid */
function parseDob(raw: string): Date | null {
  const cleaned = raw.replace(/[/\-.\s]+/g, "/");
  const parts = cleaned.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) return null;
  const date = new Date(y, m - 1, d);
  if (date.getDate() !== d || date.getMonth() !== m - 1) return null;
  return date;
}

function getAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

async function getOrCreateUser(email = "alex.johnson@email.com") {
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) return existing[0];
  const [user] = await db.insert(usersTable).values({
    fullName: "PayVora User",
    email,
    kycStatus: "not_verified",
  }).returning();
  return user;
}

router.get("/kyc/status", async (req, res) => {
  try {
    const email = (req.query["email"] as string) || "alex.johnson@email.com";
    const user = await getOrCreateUser(email);
    res.json({
      kycStatus: user.kycStatus,
      fullName: user.fullName,
      email: user.email,
      dob: user.dob,
      address: user.address,
      idType: user.idType,
      submittedAt: user.kycSubmittedAt,
      reviewedAt: user.kycReviewedAt,
      rejectionReason: user.rejectionReason ?? null,
      reviewerNotes: user.reviewerNotes ?? null,
    });
  } catch (err) {
    req.log?.error(err, "GET /kyc/status");
    res.status(500).json({ error: "Failed to fetch KYC status" });
  }
});

router.post("/kyc/submit", async (req, res) => {
  try {
    const { fullName, dob, address, idType, email } = req.body as {
      fullName?: string;
      dob?: string;
      address?: string;
      idType?: string;
      email?: string;
    };

    if (!fullName?.trim() || !dob?.trim() || !address?.trim()) {
      res.status(400).json({ error: "fullName, dob, and address are required" });
      return;
    }

    // Validate full name has at least two parts
    if (fullName.trim().split(/\s+/).length < 2) {
      res.status(400).json({ error: "Please provide your first and last name" });
      return;
    }

    // Validate DOB format and age
    const parsedDob = parseDob(dob.trim());
    if (!parsedDob) {
      res.status(400).json({ error: "Invalid date of birth. Use DD/MM/YYYY format" });
      return;
    }
    const age = getAge(parsedDob);
    if (age < 18) {
      res.status(400).json({ error: "You must be at least 18 years old" });
      return;
    }
    if (age > 120) {
      res.status(400).json({ error: "Please enter a valid date of birth" });
      return;
    }

    // Validate address has minimum substance
    if (address.trim().length < 10) {
      res.status(400).json({ error: "Please enter your complete residential address" });
      return;
    }

    const userEmail = email?.trim() || "alex.johnson@email.com";
    const user = await getOrCreateUser(userEmail);

    if (user.kycStatus === "verified") {
      res.status(400).json({ error: "KYC already verified" });
      return;
    }

    const [updated] = await db.update(usersTable)
      .set({
        fullName: fullName.trim(),
        dob: dob.trim(),
        address: address.trim(),
        idType: idType || "passport",
        kycStatus: "pending",
        kycSubmittedAt: new Date(),
        rejectionReason: null,
        reviewerNotes: null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id))
      .returning();

    res.json({
      kycStatus: updated.kycStatus,
      fullName: updated.fullName,
      email: updated.email,
      dob: updated.dob,
      address: updated.address,
      idType: updated.idType,
      submittedAt: updated.kycSubmittedAt,
    });
  } catch (err) {
    req.log?.error(err, "POST /kyc/submit");
    res.status(500).json({ error: "Failed to submit KYC" });
  }
});

router.patch("/kyc/review", async (req, res) => {
  try {
    const authHeader = req.headers["x-admin-key"];
    const adminKey = process.env.ADMIN_KEY || "admin-secret";
    if (authHeader !== adminKey) {
      res.status(403).json({ error: "Forbidden: admin access required" });
      return;
    }

    const { status, rejectionReason, reviewerNotes, email } = req.body as {
      status?: string;
      rejectionReason?: string;
      reviewerNotes?: string;
      email?: string;
    };

    if (!status || !(VALID_REVIEW_STATUSES as readonly string[]).includes(status)) {
      res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_REVIEW_STATUSES.join(", ")}`,
      });
      return;
    }

    if ((status === "rejected" || status === "requires_resubmission") && !rejectionReason?.trim()) {
      res.status(400).json({ error: "rejectionReason is required when rejecting or requesting resubmission" });
      return;
    }

    const userEmail = email?.trim() || "alex.johnson@email.com";
    const user = await getOrCreateUser(userEmail);
    const reviewedStatus = status as ReviewStatus;
    const isReviewed = reviewedStatus === "verified" || reviewedStatus === "rejected" || reviewedStatus === "requires_resubmission";

    const [updated] = await db.update(usersTable)
      .set({
        kycStatus: reviewedStatus,
        kycReviewedAt: isReviewed ? new Date() : null,
        rejectionReason: rejectionReason?.trim() ?? null,
        reviewerNotes: reviewerNotes?.trim() ?? null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id))
      .returning();

    res.json({
      kycStatus: updated.kycStatus,
      reviewedAt: updated.kycReviewedAt,
      rejectionReason: updated.rejectionReason,
      reviewerNotes: updated.reviewerNotes,
    });
  } catch (err) {
    req.log?.error(err, "PATCH /kyc/review");
    res.status(500).json({ error: "Failed to update KYC status" });
  }
});

export default router;
