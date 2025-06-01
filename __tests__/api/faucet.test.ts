import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import handler from "../../app/api/faucet/route";
import { createMocks } from "node-mocks-http";

describe("POST /api/faucet", () => {
  it("should reject GET requests", async () => {
    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("should return success for valid wallet address", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: { wallet: "0x1234567890abcdef1234567890abcdef12345678" },
    });

    await handler(req, res);

    console.log("Status:", res._getStatusCode());
    console.log("Data:", res._getData());

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty("success");
  });
});
