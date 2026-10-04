import { beforeEach, expect, test, vi } from "vitest";
import * as message from "../../../src/options/logic/message";
import * as res from "../../../src/options/logic/resource";

const { fire, toastFire } = vi.hoisted(() => ({ fire: vi.fn(), toastFire: vi.fn() }));

vi.mock("sweetalert2", () => ({
  default: {
    fire,
    mixin: () => ({ fire: toastFire }),
    stopTimer: vi.fn(),
    resumeTimer: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  res.setLang("en");
});

test("notifications are shown as toasts", () => {
  message.info("i");
  message.success("s", "detail");
  message.warn("w");
  message.error("e", "boom");

  expect(toastFire.mock.calls).toEqual([
    [{ icon: "info", title: "i", text: undefined }],
    [{ icon: "success", title: "s", text: "detail" }],
    [{ icon: "warning", title: "w", text: undefined }],
    [{ icon: "error", title: "e", text: "boom" }],
  ]);
  expect(fire).not.toHaveBeenCalled();
});

test("confirm resolves true on OK", async () => {
  fire.mockResolvedValue({ isConfirmed: true });
  await expect(message.confirm("Load?")).resolves.toBe(true);
  expect(fire).toHaveBeenCalledWith(
    expect.objectContaining({
      icon: "info",
      text: "Load?",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
    }),
  );
});

test("confirm resolves false on Cancel or dismissal", async () => {
  fire.mockResolvedValue({ isConfirmed: false, isDismissed: true });
  await expect(message.confirm("Import?", "warning")).resolves.toBe(false);
  expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "warning" }));
});

test("confirm labels follow the language", async () => {
  fire.mockResolvedValue({ isConfirmed: true });
  res.setLang("ja");
  await message.confirm("Load?");
  expect(fire).toHaveBeenCalledWith(
    expect.objectContaining({ confirmButtonText: "OK", cancelButtonText: "キャンセル" }),
  );
});
