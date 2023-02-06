import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and hotel list", async () => {
      const user = await createUser();
      const token = await generateValidToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, ticketType.price);

      const TestHotel = await  prisma.hotel.create({
        date: {
          name: "Hotel Teste",
          image: "https://dsdsds.jpg"
        }
      });
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: TestHotel.id,
          name: TestHotel.name,
          image: TestHotel.image,
          createdAt: TestHotel.createdAt.toISOstring(),
          updatedAt: TestHotel.updatedAt.toISOstring()
        }
      ]);
    });

    it("should respond with status 200 and empty array", async () => {
      const user = await createUser();
      const token = await generateValidToken();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([]);
    });
  });
});
