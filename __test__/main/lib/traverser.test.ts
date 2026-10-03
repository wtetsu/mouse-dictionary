import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import rule from "../../../src/main/core/rule";
import dom from "../../../src/main/lib/dom";
import traverser from "../../../src/main/lib/traverser";
import testdata from "../../testdata";

let caretRangeFromPoint: ReturnType<typeof vi.fn>;

beforeAll(() => {
  testdata.load();
});

beforeEach(() => {
  caretRangeFromPoint = vi.fn();
  (document as any).caretRangeFromPoint = caretRangeFromPoint;
});

afterEach(() => {
  (document as any).caretRangeFromPoint = undefined;
  (Intl as any).v8BreakIterator = undefined;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

const attach = (html: string): HTMLElement => {
  const elem = dom.create(html) as HTMLElement;
  document.body.appendChild(elem);
  return elem;
};

const pointAt = (node: Node, offset: number) => {
  caretRangeFromPoint.mockReturnValue({ startContainer: node, startOffset: offset });
};

describe("English text", () => {
  test("should fetch words from the cursor position up to maxWords", () => {
    const elem = attach("<div>hello world foo bar baz</div>");
    pointAt(elem.firstChild, 7);

    const traverse = traverser.build(rule.doLetters, 3);
    expect(traverse(elem, 10, 20)).toEqual(["world foo bar"]);
    expect(caretRangeFromPoint).toHaveBeenCalledWith(10, 20);
  });

  test("should concatenate following text when reaching the end of the node", () => {
    const elem = attach("<p><span>hello</span> world again</p>");
    pointAt(elem.firstChild.firstChild, 2);

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(elem, 0, 0)).toEqual(["hello world again"]);
  });

  test("should limit concatenated text to maxWords", () => {
    const elem = attach("<p><span>hello</span> world again and again</p>");
    pointAt(elem.firstChild.firstChild, 0);

    const traverse = traverser.build(rule.doLetters, 3);
    expect(traverse(elem, 0, 0)).toEqual(["hello world again"]);
  });

  test("should concatenate hyphenated text without a space", () => {
    const elem = attach("<p><span>well</span>-known fact</p>");
    pointAt(elem.firstChild.firstChild, 1);

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(elem, 0, 0)).toEqual(["well-known fact"]);
  });

  test("should work with the fallback character checker", () => {
    const elem = attach("<div>hello world</div>");
    pointAt(elem.firstChild, 7);

    const traverse = traverser.build(undefined, undefined);
    expect(traverse(elem, 0, 0)).toEqual(["hello world"]);
  });
});

describe("Japanese text", () => {
  test("should fetch text without word segmentation", () => {
    const elem = attach("<div>日本語のテキストです</div>");
    pointAt(elem.firstChild, 2);

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(elem, 0, 0)).toEqual(["のテキストです", "語のテキストです"]);
  });

  test("should concatenate following text without a space", () => {
    const elem = attach("<div><span>日本</span>語です</div>");
    pointAt(elem.firstChild.firstChild, 0);

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(elem, 0, 0)).toEqual(["本語です", "日本語です"]);
  });

  test("should move the start position to the beginning of the word", () => {
    // Fake Intl.v8BreakIterator: "日本語" / "の" / "テキスト" / "です"
    (Intl as any).v8BreakIterator = () => {
      const boundaries = [3, 4, 8, 10];
      let i = 0;
      return { adoptText: () => {}, next: () => boundaries[i++] };
    };
    const elem = attach("<div>日本語のテキストです</div>");

    const traverse = traverser.build(rule.doLetters, 8);

    pointAt(elem.firstChild, 1);
    expect(traverse(elem, 0, 0)).toEqual(["日本語のテキストです", "本語のテキストです"]);

    pointAt(elem.firstChild, 4);
    expect(traverse(elem, 0, 0)).toEqual(["テキストです"]);
  });
});

describe("Non-text nodes", () => {
  test("should look up text in input elements through a decoy", () => {
    const input = attach('<input type="text" value="input text">') as HTMLInputElement;
    const decoyText = document.createTextNode("input text");
    caretRangeFromPoint
      .mockReturnValueOnce({ startContainer: input, startOffset: 0 })
      .mockReturnValueOnce({ startContainer: decoyText, startOffset: 1 });

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(input, 0, 0)).toEqual(["input text"]);
    // The decoy must be removed after use
    expect(document.body.children.length).toEqual(1);
  });

  test("should return an empty list when nothing is found through a decoy", () => {
    const input = attach('<input type="text" value="input text">');
    caretRangeFromPoint.mockReturnValueOnce({ startContainer: input, startOffset: 0 }).mockReturnValueOnce(null);

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(input, 0, 0)).toEqual([]);
    expect(document.body.children.length).toEqual(1);
  });

  test("should return an empty list when no range is found", () => {
    const elem = attach("<div>hello</div>");
    caretRangeFromPoint.mockReturnValue(null);

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(elem, 0, 0)).toEqual([]);
  });

  test("should return an empty list for other node types", () => {
    const elem = attach("<div><!-- comment --></div>");
    pointAt(elem.firstChild, 0);

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(elem, 0, 0)).toEqual([]);
  });

  test("should return an empty list when an error occurs", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const elem = attach("<div>hello</div>");
    caretRangeFromPoint.mockImplementation(() => {
      throw new Error("error!");
    });

    const traverse = traverser.build(rule.doLetters, 8);
    expect(traverse(elem, 0, 0)).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });
});
