import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Chrome from "../main/chrome";

let chrome: Chrome;

beforeEach(() => {
  vi.resetModules();
  chrome = new Chrome();
  chrome.tabs.query.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  global.chrome = chrome as any;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const importBackground = () => import("../../src/background/background");

describe("extension icon", () => {
  test("should inject the main script (chrome)", async () => {
    await importBackground();
    chrome.action.onClicked.dispatch({ id: 5 });
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({ target: { tabId: 5 }, files: ["main.js"] });
    expect(chrome.browserAction.onClicked.listeners).toHaveLength(0);
  });

  test("should inject the main script (firefox)", async () => {
    vi.stubGlobal("BROWSER", "firefox");
    vi.stubGlobal("browser", chrome);
    await importBackground();
    chrome.browserAction.onClicked.dispatch();
    expect(chrome.tabs.executeScript).toHaveBeenCalledWith({ file: "./main.js" });
    expect(chrome.action.onClicked.listeners).toHaveLength(0);
  });
});

test("should forward external messages to the active tabs", async () => {
  await importBackground();
  const message = { type: "text", text: "dog" };
  chrome.runtime.onMessageExternal.dispatch(message);
  expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true });
  await vi.waitFor(() => expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2));
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { message });
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(2, { message });
});

test("should ignore tabs where the content script is unavailable", async () => {
  chrome.tabs.sendMessage.mockRejectedValue(new Error("Receiving end does not exist."));
  chrome.runtime.sendMessage.mockRejectedValue(new Error("Receiving end does not exist."));
  await importBackground();
  chrome.commands.onCommand.dispatch("scroll_up");
  chrome.runtime.onMessage.dispatch({ type: "open_pdf", payload: "PDF DATA" }, {}, vi.fn());
  await vi.waitFor(() => expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2));
});

test("should skip tabs without an id", async () => {
  chrome.tabs.query.mockResolvedValue([{}, { id: 2 }]);
  await importBackground();
  chrome.action.onClicked.dispatch({});
  expect(chrome.scripting.executeScript).not.toHaveBeenCalled();

  chrome.commands.onCommand.dispatch("scroll_up");
  await vi.waitFor(() => expect(chrome.tabs.sendMessage).toHaveBeenCalledOnce());
  expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(2, { message: { type: "scroll_up" } });
});

describe("commands", () => {
  test.each(["scroll_up", "scroll_down"])("should send %s to the active tabs", async (command) => {
    await importBackground();
    chrome.commands.onCommand.dispatch(command);
    await vi.waitFor(() => expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2));
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { message: { type: command } });
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(2, { message: { type: command } });
  });

  test("should inject the main script into the active tabs", async () => {
    await importBackground();
    chrome.commands.onCommand.dispatch("activate_extension");
    await vi.waitFor(() => expect(chrome.scripting.executeScript).toHaveBeenCalledTimes(2));
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({ target: { tabId: 1 }, files: ["main.js"] });
    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({ target: { tabId: 2 }, files: ["main.js"] });
  });

  test("should ignore unknown commands", async () => {
    await importBackground();
    chrome.commands.onCommand.dispatch("unknown");
    expect(chrome.tabs.query).not.toHaveBeenCalled();
  });
});

describe("PDF messages", () => {
  test("should pass PDF data to the options page", async () => {
    await importBackground();

    const openResponse = vi.fn();
    const [keepChannelOpen] = chrome.runtime.onMessage.dispatch(
      { type: "open_pdf", payload: "PDF DATA" },
      {},
      openResponse,
    );
    expect(keepChannelOpen).toBe(true);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type: "prepare_pdf" });
    expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
    await vi.waitFor(() => expect(openResponse).toHaveBeenCalled());

    const idResponse = vi.fn();
    chrome.runtime.onMessage.dispatch({ type: "shift_pdf_id" }, {}, idResponse);
    const id = idResponse.mock.lastCall[0];
    expect(id).toBeTruthy();

    const dataResponse = vi.fn();
    chrome.runtime.onMessage.dispatch({ type: "get_pdf_data", id }, {}, dataResponse);
    expect(dataResponse).toHaveBeenCalledWith("PDF DATA");

    // The queue is empty now
    chrome.runtime.onMessage.dispatch({ type: "shift_pdf_id" }, {}, idResponse);
    expect(idResponse.mock.lastCall[0]).toBeFalsy();
  });

  test("should ignore unknown messages", async () => {
    await importBackground();
    const sendResponse = vi.fn();
    chrome.runtime.onMessage.dispatch({ type: "unknown" }, {}, sendResponse);
    chrome.runtime.onMessage.dispatch(undefined, {}, sendResponse);
    expect(sendResponse).not.toHaveBeenCalled();
  });
});
