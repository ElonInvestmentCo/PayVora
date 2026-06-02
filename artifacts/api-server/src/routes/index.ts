import { Router, type IRouter } from "express";
import healthRouter   from "./health";
import kycRouter      from "./kyc";
import paymentsRouter from "./payments";
import walletRouter   from "./wallet";

const router: IRouter = Router();

router.use(healthRouter);
router.use(kycRouter);
router.use(paymentsRouter);
router.use(walletRouter);

export default router;
