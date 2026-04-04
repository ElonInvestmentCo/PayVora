import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

async function getOrCreateUser() {
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, 1)).limit(1);
  if (existing.length > 0) return existing[0];
  const [user] = await db.insert(usersTable).values({
    fullName: "Alex Johnson",
    email: "alex.johnson@email.com",
    kycStatus: "not_verified",
  }).returning();
  return user;
}

router.get("/kyc/status", async (_req, res) => {
  try {
    const user = await getOrCreateUser();
    res.json({
      kycStatus: user.kycStatus,
      fullName: user.fullName,
      email: user.email,
      dob: user.dob,
      address: user.address,
      idType: user.idType,
      submittedAt: user.kycSubmittedAt,
      reviewedAt: user.kycReviewedAt,
    });
  } catch (err) {
    console.error("GET /kyc/status error:", err);
    res.status(500).json({ error: "Failed to fetch KYC status" });
  }
});

router.post("/kyc/submit", async (req, res) => {
  try {
    const { fullName, dob, address, idType } = req.body;
    if (!fullName || !dob || !address) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const user = await getOrCreateUser();
    if (user.kycStatus === "verified") {
      res.status(400).json({ error: "KYC already verified" });
      return;
    }
    const [updated] = await db.update(usersTable)
      .set({
        fullName,
        dob,
        address,
        idType: idType || "passport",
        kycStatus: "pending",
        kycSubmittedAt: new Date(),
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
    console.error("POST /kyc/submit error:", err);
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
    const { status } = req.body;
    if (!["verified", "rejected", "not_verified"].includes(status)) {
      res.status(400).json({ error: "Invalid status. Must be: verified, rejected, or not_verified" });
      return;
    }
    const user = await getOrCreateUser();
    const [updated] = await db.update(usersTable)
      .set({
        kycStatus: status,
        kycReviewedAt: status === "verified" || status === "rejected" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id))
      .returning();
    res.json({
      kycStatus: updated.kycStatus,
      reviewedAt: updated.kycReviewedAt,
    });
  } catch (err) {
    console.error("PATCH /kyc/review error:", err);
    res.status(500).json({ error: "Failed to update KYC status" });
  }
});

export default router;
