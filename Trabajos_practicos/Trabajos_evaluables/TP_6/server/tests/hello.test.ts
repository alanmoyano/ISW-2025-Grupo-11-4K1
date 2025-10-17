import app from "@server/index";
import { describe, expect, it } from "vitest";

describe("Hello world test", () => {
  it("should return hello world", async () => {
    const response = await app.request("/hello");

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Hello BHVR!");
    expect(data.success).toBe(true);
  });
});
