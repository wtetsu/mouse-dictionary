/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

/**
 * Detects script-ish constructs in HTML templates.
 *
 * Templates are Mustache sources that end up in the page DOM through innerHTML,
 * so they cannot be sanitized without breaking the Mustache syntax.
 * This only reports what looks dangerous; it never rewrites the given text.
 */

const DANGEROUS_TAGS = new Set([
  "applet",
  "base",
  "embed",
  "frame",
  "frameset",
  "iframe",
  "link",
  "meta",
  "object",
  "portal",
  "script",
]);

const URI_ATTRIBUTES = new Set([
  "action",
  "background",
  "data",
  "formaction",
  "href",
  "poster",
  "src",
  "srcdoc",
  "xlink:href",
]);

/**
 * Browsers strip control characters out of a URI scheme before acting on it,
 * so "java&#9;script:" runs just like "javascript:". Drop them before testing.
 */
const CONTROL_CHARS = /\p{Cc}/gu;

const DANGEROUS_URI = /^(?:(?:javascript|vbscript)\s*:|data\s*:\s*text\s*\/\s*html|data\s*:\s*image\s*\/\s*svg)/i;

const isDangerousUri = (value: string): boolean => DANGEROUS_URI.test(value.replace(CONTROL_CHARS, "").trim());

export type HtmlRisk = {
  type: "tag" | "event" | "uri";
  detail: string;
};

export const findHtmlRisks = (html: string): HtmlRisk[] => {
  if (!html) {
    return [];
  }
  const container = document.createElement("template");
  try {
    container.innerHTML = html;
  } catch {
    return [];
  }

  const risks: HtmlRisk[] = [];
  const found = new Set<string>();
  const add = (type: HtmlRisk["type"], detail: string) => {
    if (found.has(detail)) {
      return;
    }
    found.add(detail);
    risks.push({ type, detail });
  };

  for (const element of container.content.querySelectorAll("*")) {
    const tagName = element.tagName.toLowerCase();
    if (DANGEROUS_TAGS.has(tagName)) {
      add("tag", `<${tagName}>`);
    }
    for (const attribute of element.attributes) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on")) {
        add("event", `${tagName}[${name}]`);
      } else if (URI_ATTRIBUTES.has(name) && isDangerousUri(attribute.value)) {
        add("uri", `${tagName}[${name}]`);
      }
    }
  }
  return risks;
};

export const describeHtmlRisks = (risks: HtmlRisk[]): string => risks.map((r) => r.detail).join(", ");
