import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import hotelService from "@/services/hotels-service";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await hotelService.getHotels(Number(userId));
    return res.status(httpStatus.OK).send(hotels);
  } catch(error) {
    if(error.name === "NotFound") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  }
}
