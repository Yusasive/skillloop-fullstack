import handler from "../../app/api/session/route";
import { createMocks } from "node-mocks-http";

describe("POST /api/session", () => {
  it("should create session with valid data", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        learner: "0xabc...",
        tutor: "0xdef...",
        amount: "10",
        skill: "Solidity",
      },
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toHaveProperty("sessionId");
  });
});
