import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import config from "../../../src/main/core/config";
import events from "../../../src/main/core/events";
import launch from "../../../src/main/core/launch";
import pdf from "../../../src/main/core/pdf";
import res from "../../../src/main/core/resource";
import rule from "../../../src/main/core/rule";
import view from "../../../src/main/core/view";
import dom from "../../../src/main/lib/dom";
import defaultSettings from "../../../src/main/settings";

declare const DIALOG_ID: string;
const SHADOW_HOST_ID = `${DIALOG_ID}_SH`;

let alertMock: ReturnType<typeof vi.fn>;
let confirmMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  document.body.innerHTML = "";
  alertMock = vi.fn();
  confirmMock = vi.fn(() => false);
  vi.stubGlobal("alert", alertMock);
  vi.stubGlobal("confirm", confirmMock);
  vi.spyOn(console, "error").mockImplementation(() => {});

  vi.spyOn(events, "attach").mockResolvedValue(undefined);
  vi.spyOn(rule, "load").mockResolvedValue(undefined);
  vi.spyOn(pdf, "invoke").mockResolvedValue(undefined);
  vi.spyOn(config, "isDataReady").mockResolvedValue(true);
  stubSettings({});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const stubSettings = (userSettings: object, position: object = {}) => {
  const settings = config.parseSettings({ ...defaultSettings, ...userSettings });
  vi.spyOn(config, "loadAll").mockResolvedValue({ settings, position });
  vi.spyOn(config, "loadSettings").mockResolvedValue(settings);
  return settings;
};

const findShadowDialog = () => document.getElementById(SHADOW_HOST_ID)?.shadowRoot?.getElementById(DIALOG_ID);

describe("first launch", () => {
  test("should create the dialog in a shadow DOM by default", async () => {
    await launch();

    const dialog = findShadowDialog();
    expect(dialog).toBeTruthy();
    expect(document.getElementById(DIALOG_ID)).toBeNull();
    expect(events.attach).toHaveBeenCalledWith(expect.any(Object), dialog, expect.any(Function));
    expect(rule.load).toHaveBeenCalled();
  });

  test("should create the dialog in the light DOM when specified", async () => {
    stubSettings({ domType: "light" });
    await launch();

    expect(document.getElementById(DIALOG_ID)).toBeTruthy();
    expect(document.getElementById(SHADOW_HOST_ID)).toBeNull();
  });

  test("should update the content through the callback", async () => {
    await launch();
    const doUpdate = vi.mocked(events.attach).mock.lastCall[2];
    doUpdate(dom.create("<p>updated!</p>"));
    expect(findShadowDialog().textContent).toContain("updated!");
  });

  test.each([
    ["right", `${document.documentElement.clientWidth - 5}px`],
    ["left", "5px"],
  ])("should put the dialog on the %s side", async (initialPosition, expectedLeft) => {
    stubSettings({ initialPosition });
    await launch();
    expect(findShadowDialog().style.left).toEqual(expectedLeft);
  });

  test("should restore the last position", async () => {
    // parseSettings() turns "keep" into "right" when saving window status is disabled
    vi.spyOn(config, "loadAll").mockResolvedValue({
      settings: { ...config.parseSettings(defaultSettings), initialPosition: "keep" },
      position: { left: 10, top: 20, width: 300, height: 400 },
    });
    await launch();

    const style = findShadowDialog().style;
    expect(style.left).toEqual("10px");
    expect(style.top).toEqual("20px");
    expect(style.width).toEqual("300px");
    expect(style.height).toEqual("400px");
  });

  test("should not launch on frame pages", async () => {
    document.body.appendChild(document.createElement("frame"));
    await launch();
    expect(alertMock).toHaveBeenCalledWith(res("doesntSupportFrame"));
    expect(config.loadAll).not.toHaveBeenCalled();
  });

  test("should show an error when initialization fails", async () => {
    vi.spyOn(view, "create").mockImplementation(() => {
      throw new Error("init error");
    });
    await launch();
    expect(alertMock).toHaveBeenCalledWith("init error");
    expect(rule.load).not.toHaveBeenCalled();
  });

  test("should show an error when attaching events fails", async () => {
    vi.mocked(events.attach).mockRejectedValue(new Error("attach error"));
    await launch();
    await vi.waitFor(() => expect(alertMock).toHaveBeenCalledWith("attach error"));
  });
});

describe("dictionary data is not ready", () => {
  test("should show a notice until the data is loaded", async () => {
    const isDataReady = vi.mocked(config.isDataReady);
    isDataReady.mockResolvedValue(false);
    await launch();

    const dialog = findShadowDialog();
    await vi.waitFor(() => expect(dialog.textContent).toContain(res("needToPrepareDict")));
    const doUpdate = vi.mocked(events.attach).mock.lastCall[2];

    // Still not ready
    await doUpdate(dom.create("<p>first</p>"));
    expect(dialog.textContent).toContain(res("needToPrepareDict"));

    // Ready (this call only switches the update function)
    isDataReady.mockResolvedValue(true);
    await doUpdate(dom.create("<p>second</p>"));
    expect(dialog.textContent).toContain(res("needToPrepareDict"));

    await doUpdate(dom.create("<p>third</p>"));
    expect(dialog.textContent).toContain("third");
  });
});

describe("second or later launch", () => {
  test.each(["shadow", "light"])("should toggle the dialog (%s)", async (domType) => {
    const settings = stubSettings({ domType });
    await launch();
    const dialog = findShadowDialog() ?? document.getElementById(DIALOG_ID);

    await launch();
    expect(dialog.getAttribute("data-mouse-dictionary-hidden")).toEqual("true");
    expect(dialog.style.opacity).toEqual(String(settings.hiddenDialogStyles.opacity));

    await launch();
    expect(dialog.getAttribute("data-mouse-dictionary-hidden")).toEqual("false");
    expect(dialog.style.opacity).toEqual(String(settings.normalDialogStyles.opacity));

    expect(events.attach).toHaveBeenCalledTimes(1);
  });
});

describe("PDF", () => {
  test("should open the PDF viewer when confirmed", async () => {
    stubSettings({ pdfUrl: ".*" });
    confirmMock.mockReturnValue(true);
    await launch();
    expect(confirmMock).toHaveBeenCalledWith(res("continueProcessingPdf"));
    expect(pdf.invoke).toHaveBeenCalled();
    expect(findShadowDialog()).toBeFalsy();
  });

  test("should do nothing when not confirmed", async () => {
    stubSettings({ pdfUrl: ".*" });
    await launch();
    expect(pdf.invoke).not.toHaveBeenCalled();
    expect(findShadowDialog()).toBeFalsy();
  });

  test("should skip the confirmation when specified", async () => {
    stubSettings({ pdfUrl: ".*", skipPdfConfirmation: true });
    await launch();
    expect(confirmMock).not.toHaveBeenCalled();
    expect(pdf.invoke).toHaveBeenCalled();
  });

  test("should show an error when the PDF viewer fails", async () => {
    stubSettings({ pdfUrl: ".*", skipPdfConfirmation: true });
    vi.mocked(pdf.invoke).mockImplementation(() => {
      throw new Error("pdf error");
    });
    await launch();
    expect(alertMock).toHaveBeenCalledWith("pdf error");
  });

  test("should launch normally when the URL doesn't match", async () => {
    stubSettings({ pdfUrl: "\\.pdf$" });
    await launch();
    expect(confirmMock).not.toHaveBeenCalled();
    expect(findShadowDialog()).toBeTruthy();
  });

  test("should launch normally when the URL pattern is invalid", async () => {
    stubSettings({ pdfUrl: "(" });
    await launch();
    expect(console.error).toHaveBeenCalled();
    expect(findShadowDialog()).toBeTruthy();
  });

  test("should detect PDF documents by content type", async () => {
    Object.defineProperty(document, "contentType", { value: "application/pdf", configurable: true });
    try {
      await launch();
      expect(confirmMock).toHaveBeenCalled();
    } finally {
      delete (document as any).contentType;
    }
  });

  test("should detect PDF documents by an embed element", async () => {
    const embed = document.createElement("embed");
    embed.setAttribute("type", "application/pdf");
    Object.defineProperty(embed, "type", { value: "application/pdf" });
    document.body.appendChild(embed);
    await launch();
    expect(confirmMock).toHaveBeenCalled();
  });
});
