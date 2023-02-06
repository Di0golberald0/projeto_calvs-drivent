import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const hotels = await hotelRepository.findHotels();
  return hotels;
}

const hotelService = {
  getHotels,
};

export default hotelService;
