import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stateRouter from "./state";
import loginRouter from "./login";
import assistRouter from "./assist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(loginRouter);
router.use(stateRouter);
router.use(assistRouter);

export default router;
