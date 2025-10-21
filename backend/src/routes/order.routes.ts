import { Router } from "express";
import { createOrder, capturePaymentAndFinalizeOrder } from "../controllers/order.controller";

const router = Router();
router.post('/create', createOrder);
router.post('/capture', capturePaymentAndFinalizeOrder);

export default router;