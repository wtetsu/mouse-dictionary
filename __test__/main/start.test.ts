import { expect, test, vi } from "vitest";
import launch from "../../src/main/core/launch";

vi.mock("../../src/main/core/launch", () => ({ default: vi.fn(async () => {}) }));

test("should launch Mouse Dictionary", async () => {
  vi.spyOn(console, "time").mockImplementation(() => {});
  vi.spyOn(console, "timeEnd").mockImplementation(() => {});

  await import("../../src/main/start");

  await vi.waitFor(() => expect(console.timeEnd).toHaveBeenCalledWith("launch"));
  expect(launch).toHaveBeenCalledTimes(1);
});
