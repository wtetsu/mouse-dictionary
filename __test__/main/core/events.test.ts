import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import config from "../../../src/main/core/config";
import events from "../../../src/main/core/events";
import rule from "../../../src/main/core/rule";
import dom from "../../../src/main/lib/dom";
import sound from "../../../src/main/lib/sound";
import defaultSettings from "../../../src/main/settings";
import testdata from "../../testdata";
import Chrome from "../chrome";

const settings = config.parseSettings(defaultSettings);

let chrome: Chrome;
let dialog: HTMLElement;
let doUpdateContent: ReturnType<typeof vi.fn>;

beforeAll(() => {
  testdata.load();
});

beforeEach(() => {
  // Listeners attached to body must not leak into other tests
  document.documentElement.replaceChild(document.createElement("body"), document.body);

  chrome = new Chrome();
  Object.assign(chrome.storage.local.data, { dog: "犬", cat: "猫" });
  global.chrome = chrome as any;

  vi.spyOn(rule, "load").mockResolvedValue(undefined);
  vi.spyOn(config, "savePosition").mockResolvedValue(undefined);
  (document as any).caretRangeFromPoint = vi.fn(() => null);
  (document as any).elementsFromPoint = vi.fn(() => []);

  dialog = dom.create(
    `<div style="position:fixed;left:500px;top:100px;width:200px;height:200px;">
      <span data-md-pronunciation="dog">🔊</span>
      <span data-md-hovervisible="true" style="visibility:hidden">!</span>
    </div>`,
  ) as HTMLElement;
  document.body.appendChild(dialog);
  doUpdateContent = vi.fn();
});

afterEach(() => {
  (document as any).caretRangeFromPoint = undefined;
  (document as any).elementsFromPoint = undefined;
  vi.restoreAllMocks();
});

const fire = (target: EventTarget, type: string, props: object = {}) => {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, props);
  target.dispatchEvent(event);
};

// Puts a word under the mouse cursor
const hover = (word: string) => {
  const elem = document.createElement("p");
  elem.textContent = word;
  document.body.appendChild(elem);
  (document as any).caretRangeFromPoint.mockReturnValue({ startContainer: elem.firstChild, startOffset: 0 });
  fire(elem, "mousemove", { clientX: 0, clientY: 0, x: 0, y: 0 });
};

const sendMessage = (message: object) => chrome.runtime.onMessage.dispatch({ message });

const lastContent = () => doUpdateContent.mock.lastCall?.[0].textContent;

const selectText = (text: string) => {
  vi.spyOn(window, "getSelection").mockReturnValue({ toString: () => text } as any);
};

describe("mouse events", () => {
  test("should look up the word under the cursor", async () => {
    await events.attach(settings, dialog, doUpdateContent);

    hover("dog");
    await vi.waitFor(() => expect(lastContent()).toContain("犬"));
    expect(rule.load).toHaveBeenCalled();

    hover("cat");
    await vi.waitFor(() => expect(lastContent()).toContain("猫"));
  });

  test("should not look up while the mouse button is pressed", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    hover("dog");
    await vi.waitFor(() => expect(doUpdateContent).toHaveBeenCalledTimes(1));

    fire(document.body, "mousedown");
    hover("cat");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(doUpdateContent).toHaveBeenCalledTimes(1);
  });

  test("should look up the selected text on mouseup", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    selectText("cat");
    dialog.scrollTop = 100;

    fire(document.body, "mouseup", { clientX: 0, clientY: 0 });
    await vi.waitFor(() => expect(lastContent()).toContain("猫"));
    await vi.waitFor(() => expect(dialog.scrollTop).toEqual(0));

    // Doesn't update while the text is selected
    hover("dog");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(lastContent()).not.toContain("犬");
  });

  test("should look up the selected text on attach", async () => {
    selectText("dog");
    await events.attach(settings, dialog, doUpdateContent);
    await vi.waitFor(() => expect(lastContent()).toContain("犬"));
  });

  test("should move the dialog with smart-snap", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    const guideText = "Shift+Move: Smart-snap";

    fire(document.body, "keydown", { key: "Shift" });
    fire(dialog, "mousedown", { pageX: 600, pageY: 200 });
    expect(dialog.textContent).toContain(guideText);

    fire(document.body, "mousemove", { pageX: 650, pageY: 250, clientX: 650, clientY: 250 });
    await vi.waitFor(() => expect(dialog.style.left).toEqual("550px"));
    // Snap area appears
    expect(document.body.lastElementChild.getAttribute("style")).toContain("z-index");

    fire(document.body, "keyup", { key: "Shift" });
    expect(document.body.lastElementChild.getAttribute("style")).not.toContain("z-index");

    fire(document.body, "mouseup", { clientX: 650, clientY: 250 });
    expect(dialog.textContent).not.toContain(guideText);
    expect(config.savePosition).toHaveBeenCalledWith(expect.objectContaining({ left: 550, top: 150 }));
  });

  test("should ignore other keys", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    fire(document.body, "keydown", { key: "a" });
    fire(dialog, "mousedown", { pageX: 600, pageY: 200 });
    fire(document.body, "mousemove", { pageX: 650, pageY: 250, clientX: 650, clientY: 250 });
    await vi.waitFor(() => expect(dialog.style.left).toEqual("550px"));
    // No snap area
    expect(document.body.lastElementChild).toBe(dialog);
    fire(document.body, "keyup", { key: "a" });
  });
});

describe("dialog events", () => {
  test("should pronounce the word when the icon is clicked", async () => {
    const pronounce = vi.spyOn(sound, "pronounce").mockImplementation(() => {});
    await events.attach(settings, dialog, doUpdateContent);
    const icon = dialog.querySelector("[data-md-pronunciation]");

    fire(dialog, "mouseenter");
    fire(dialog, "mouseenter"); // must not register the listener twice
    fire(icon, "click");
    expect(pronounce).toHaveBeenCalledTimes(1);
    expect(pronounce).toHaveBeenCalledWith("dog");
  });

  test("should show hover-visible elements only while hovering", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    const elem = dialog.querySelector("[data-md-hovervisible]") as HTMLElement;

    fire(dialog, "mouseenter");
    expect(elem.style.visibility).toEqual("visible");
    fire(dialog, "mouseleave");
    expect(elem.style.visibility).toEqual("hidden");
  });
});

describe("messages", () => {
  test("should look up the text in a message", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    sendMessage({ type: "text", text: "dog" });
    await vi.waitFor(() => expect(lastContent()).toContain("犬"));
  });

  test("should enable and disable the default lookup", async () => {
    await events.attach(settings, dialog, doUpdateContent);

    sendMessage({ type: "disable_default" });
    hover("dog");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(doUpdateContent).not.toHaveBeenCalled();

    sendMessage({ type: "enable_default" });
    hover("cat");
    await vi.waitFor(() => expect(lastContent()).toContain("猫"));
  });

  test("should scroll the dialog", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    sendMessage({ type: "scroll_down" });
    expect(dialog.scrollTop).toEqual(50);
    sendMessage({ type: "scroll_up" });
    expect(dialog.scrollTop).toEqual(0);
  });

  test("should move the dialog", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    fire(dialog, "mousedown", { pageX: 600, pageY: 200 });
    sendMessage({ type: "mousemove", pageX: 610, pageY: 220, clientX: 610, clientY: 220 });
    expect(dialog.style.left).toEqual("510px");
    sendMessage({ type: "mouseup" });
    expect(config.savePosition).toHaveBeenCalledWith(expect.objectContaining({ left: 510, top: 120 }));
  });

  test("should ignore unknown messages", async () => {
    await events.attach(settings, dialog, doUpdateContent);
    sendMessage({ type: "unknown" });
    chrome.runtime.onMessage.dispatch({});
    expect(doUpdateContent).not.toHaveBeenCalled();
  });
});
