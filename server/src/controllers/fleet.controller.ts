import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import { isIntentionalError, publicErrorMessage } from "../utils/publicError.js";
import {
  canUseFleet,
  createVehicle,
  deleteVehicle,
  fleetSummary,
  getVehicle,
  listVehicles,
  markServiced,
  recordMileage,
  updateVehicle,
} from "../services/fleet.service.js";

// Everything in the fleet is limited to the PS, Director and Assistant Director.
function guard(req: AuthRequest, res: Response): number | null {
  const id = Number(req.user?.id);

  if (!Number.isFinite(id)) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  if (!canUseFleet(String(req.user?.role || ""))) {
    res.status(403).json({
      message:
        "The fleet is managed by the PS, Director and Assistant Director only",
    });
    return null;
  }

  return id;
}

function fail(res: Response, error: unknown, fallback: string) {
  return res
    .status(isIntentionalError(error) ? 400 : 500)
    .json({ message: publicErrorMessage(error, fallback) });
}

export const getVehicles = async (req: AuthRequest, res: Response) => {
  if (guard(req, res) === null) return;

  try {
    const vehicles = await listVehicles({
      ...(typeof req.query.search === "string" ? { search: req.query.search } : {}),
      ...(typeof req.query.status === "string" ? { status: req.query.status } : {}),
      ...(typeof req.query.make === "string" ? { make: req.query.make } : {}),
    });
    return res.status(200).json({ vehicles, summary: await fleetSummary() });
  } catch (error) {
    return fail(res, error, "Error loading the fleet");
  }
};

export const getOneVehicle = async (req: AuthRequest, res: Response) => {
  if (guard(req, res) === null) return;

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Valid vehicle id is required" });
  }

  const vehicle = await getVehicle(id);
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

  return res.status(200).json({ vehicle });
};

export const postVehicle = async (req: AuthRequest, res: Response) => {
  const actorId = guard(req, res);
  if (actorId === null) return;

  try {
    const vehicle = await createVehicle(req.body, actorId);
    return res.status(201).json({ message: "Vehicle added", vehicle });
  } catch (error) {
    return fail(res, error, "Error adding the vehicle");
  }
};

export const putVehicle = async (req: AuthRequest, res: Response) => {
  const actorId = guard(req, res);
  if (actorId === null) return;

  try {
    const vehicle = await updateVehicle(Number(req.params.id), req.body, actorId);
    return res.status(200).json({ message: "Vehicle updated", vehicle });
  } catch (error) {
    return fail(res, error, "Error updating the vehicle");
  }
};

export const postMileage = async (req: AuthRequest, res: Response) => {
  const actorId = guard(req, res);
  if (actorId === null) return;

  try {
    const vehicle = await recordMileage(
      Number(req.params.id),
      req.body?.mileage,
      req.body?.note ? String(req.body.note).slice(0, 200) : undefined,
      actorId,
    );
    return res.status(200).json({ message: "Mileage recorded", vehicle });
  } catch (error) {
    return fail(res, error, "Error recording mileage");
  }
};

export const postService = async (req: AuthRequest, res: Response) => {
  const actorId = guard(req, res);
  if (actorId === null) return;

  try {
    const vehicle = await markServiced(
      Number(req.params.id),
      actorId,
      req.body?.note ? String(req.body.note).slice(0, 200) : undefined,
    );
    return res.status(200).json({ message: "Vehicle marked as serviced", vehicle });
  } catch (error) {
    return fail(res, error, "Error updating the service record");
  }
};

export const removeVehicle = async (req: AuthRequest, res: Response) => {
  if (guard(req, res) === null) return;

  try {
    await deleteVehicle(Number(req.params.id));
    return res.status(200).json({ message: "Vehicle removed" });
  } catch (error) {
    return fail(res, error, "Error removing the vehicle");
  }
};
