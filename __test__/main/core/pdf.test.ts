import { afterEach, beforeEach, expect, test, vi } from "vitest";
import pdf from "../../../src/main/core/pdf";
import res from "../../../src/main/core/resource";
import Chrome from "../chrome";

let chrome: Chrome;

beforeEach(() => {
  vi.useFakeTimers();
  chrome = new Chrome();
  global.chrome = chrome as any;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

const stubFetch = (response: object) => {
  const fetchMock = vi.fn(async () => response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

const createResponse = (bytes: Uint8Array, status = 200) => ({
  status,
  text: async () => "Not Found",
  arrayBuffer: async () => bytes.buffer,
});

const ribbonText = () => document.body.textContent;

test("should send PDF data to the background", async () => {
  // Larger than the chunk size (32768 bytes) used for base64 conversion
  const bytes = new Uint8Array(70000);
  bytes.set([0x25, 0x50, 0x44, 0x46]); // "%PDF"
  for (let i = 4; i < bytes.length; i++) {
    bytes[i] = i % 256;
  }
  const fetchMock = stubFetch(createResponse(bytes));

  await pdf.invoke();

  expect(fetchMock).toHaveBeenCalledWith(location.href);
  expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
    type: "open_pdf",
    payload: Buffer.from(bytes).toString("base64"),
  });
  // The ribbon is closed
  expect(document.body.children.length).toEqual(0);
});

test("should show the response text when the status is not 200", async () => {
  stubFetch(createResponse(new Uint8Array(0), 404));
  await pdf.invoke();
  expect(ribbonText()).toContain("Not Found");
  expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
});

test("should stop processing non-PDF data", async () => {
  stubFetch(createResponse(new TextEncoder().encode("<html></html>")));
  await pdf.invoke();
  expect(ribbonText()).toContain(res("nonPdf"));
  expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
});

test("should show the error message when fetch fails", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("Network error");
    }),
  );
  await pdf.invoke();
  expect(ribbonText()).toContain("Network error");
});

test("should show a special message for local files", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("Network error");
    }),
  );
  vi.stubGlobal("location", { href: "file:///tmp/test.pdf" });
  await pdf.invoke();
  expect(ribbonText()).toContain(res("cannotFetchLocalPdf"));
});
