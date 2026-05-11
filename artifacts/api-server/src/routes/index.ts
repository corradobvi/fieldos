import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stateRouter from "./state";
import loginRouter from "./login";
import authRouter from "./auth";
import assistRouter from "./assist";
import pushRouter from "./push";
import uploadRouter from "./upload";
import publicRouter from "./public";
import v2Router from "./v2/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loginRouter);
router.use(authRouter);
router.use(stateRouter);
router.use(assistRouter);
router.use(pushRouter);
router.use(uploadRouter);
router.use(publicRouter);
// v2 — nuove API con tabelle relazionali (JWT auth)
router.use("/api/v2", v2Router);

export default router;
