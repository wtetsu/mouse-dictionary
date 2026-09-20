/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { describe, expect, test } from "vitest";
import defaultSettings from "../src/main/settings";
import { describeHtmlRisks, findHtmlRisks } from "../src/options/logic/htmlrisk";

const details = (html) => findHtmlRisks(html).map((r) => r.detail);

describe("findHtmlRisks", () => {
  test("reports nothing for the default templates", () => {
    expect(details(defaultSettings.dialogTemplate)).toEqual([]);
    expect(details(defaultSettings.contentWrapperTemplate)).toEqual([]);
    expect(details(defaultSettings.contentTemplate)).toEqual([]);
    for (const rule of defaultSettings.replaceRules) {
      expect(details(rule.replace)).toEqual([]);
    }
  });

  test("reports nothing for empty or plain values", () => {
    expect(details("")).toEqual([]);
    expect(details(undefined)).toEqual([]);
    expect(details("<div>{{#words}}<span>{{{desc}}}</span>{{/words}}</div>")).toEqual([]);
    expect(details('<div style="width:{{width}}px"><a href="https://example.com">x</a></div>')).toEqual([]);
  });

  test("reports event handler attributes at any depth", () => {
    expect(details('<img src=x onerror="alert(1)">')).toEqual(["img[onerror]"]);
    expect(details('<div><img src=x onerror="alert(1)"></div>')).toEqual(["img[onerror]"]);
    expect(details("<div><p><span><b><i><img src=x onerror=alert(1)></i></b></span></p></div>")).toEqual([
      "img[onerror]",
    ]);
    expect(details('<div><svg onload="alert(1)"></svg></div>')).toEqual(["svg[onload]"]);
  });

  test("reports dangerous tags", () => {
    expect(details("<div><scr" + "ipt>alert(1)</scr" + "ipt></div>")).toEqual(["<script>"]);
    expect(details('<div><object data="x"></object></div>')).toEqual(["<object>"]);
  });

  test("reports dangerous URIs only on URI attributes", () => {
    expect(details('<a href="javascript:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<div><iframe src="javascript:alert(1)"></iframe></div>')).toEqual(["<iframe>", "iframe[src]"]);
    expect(details('<img src="data:text/html,<svg onload=alert(1)>">')).toEqual(["img[src]"]);
    expect(details('<img src="data:image/png;base64,AAAA">')).toEqual([]);
    expect(details('<div title="javascript:alert(1)">x</div>')).toEqual([]);
  });

  // Verified in Chrome 153: every payload below actually runs the script,
  // while the "not dangerous" ones do not.
  test("reports schemes obfuscated with control characters", () => {
    expect(details('<a href="java&#9;script:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<a href="java\nscript:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<a href="java&#13;script:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<a href="&#01;javascript:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<a href="jav&NewLine;ascript:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<a href="&Tab;javascript:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<a href="&#9;&#10;j&#13;av&#9;ascript&#9;:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<form><button formaction="java&#9;script:alert(1)">go</button></form>')).toEqual([
      "button[formaction]",
    ]);
    expect(details('<a href="vb&#9;script:msgbox(1)">x</a>')).toEqual(["a[href]"]);
  });

  test("ignores the case of a scheme", () => {
    expect(details('<a href="JaVaScRiPt:alert(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<a href="VBScript:msgbox(1)">x</a>')).toEqual(["a[href]"]);
    expect(details('<img src="DATA:TEXT/HTML,x">')).toEqual(["img[src]"]);
    expect(details('<img src="Data:Image/SVG+xml,x">')).toEqual(["img[src]"]);
  });

  test("reports dangerous URIs inside svg", () => {
    expect(details('<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>')).toEqual(["a[xlink:href]"]);
    expect(details('<svg><a href="javascript:alert(1)"><text>x</text></a></svg>')).toEqual(["a[href]"]);
  });

  test("reports nothing for values that merely start with a scheme name", () => {
    expect(details('<a href="javascript-guide.html">x</a>')).toEqual([]);
    expect(details('<a href="vbscript-notes/">x</a>')).toEqual([]);
    expect(details('<a href="java script:alert(1)">x</a>')).toEqual([]);
    expect(details('<a href="https://example.com/javascript:x">x</a>')).toEqual([]);
    expect(details('<a href="#javascript:x">x</a>')).toEqual([]);
    expect(details('<a href="data:application/json,%7B%7D">x</a>')).toEqual([]);
  });

  test("deduplicates repeated risks", () => {
    expect(details("<img src=x onerror=a(1)><img src=y onerror=a(2)>")).toEqual(["img[onerror]"]);
  });

  test("classifies risks by type", () => {
    expect(findHtmlRisks('<iframe src="javascript:x"></iframe>')).toEqual([
      { type: "tag", detail: "<iframe>" },
      { type: "uri", detail: "iframe[src]" },
    ]);
    expect(findHtmlRisks("<img src=x onerror=a()>")).toEqual([{ type: "event", detail: "img[onerror]" }]);
  });
});

describe("describeHtmlRisks", () => {
  test("joins details", () => {
    expect(describeHtmlRisks(findHtmlRisks('<iframe src="javascript:x"></iframe>'))).toBe("<iframe>, iframe[src]");
    expect(describeHtmlRisks([])).toBe("");
  });
});
