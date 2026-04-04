import { Router, type IRouter } from "express";
import healthRouter from "./health";
import kycRouter from "./kyc";

const router: IRouter = Router();

router.use(healthRouter);
router.use(kycRouter);

export default router;
