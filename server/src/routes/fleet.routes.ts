import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  getOneVehicle,
  getVehicles,
  postMileage,
  postService,
  postVehicle,
  putVehicle,
  removeVehicle,
} from "../controllers/fleet.controller.js";

const router: Router = Router();

router.use(authenticateToken);

router.get("/vehicles", getVehicles);
router.post("/vehicles", postVehicle);
router.get("/vehicles/:id", getOneVehicle);
router.put("/vehicles/:id", putVehicle);
router.delete("/vehicles/:id", removeVehicle);
router.post("/vehicles/:id/mileage", postMileage);
router.post("/vehicles/:id/service", postService);

export default router;
