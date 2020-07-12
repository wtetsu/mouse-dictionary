import { EijiroParser, SimpleDictParser, JsonDictParser } from "../src/options/logic/dictparser";

test("", () => {
  const parser = new EijiroParser();

  let hd;
  hd = parser.addLine("■when  {代名} : ＊＊");
  expect(hd).toEqual(null);
  hd = parser.addLine("■when  {名} : 〔＊＊＊＊＊＊＊〕＊＊＊＊＊");
  expect(hd).toEqual(null);
  hd = parser.addLine("■when : 【レベル】＊＊＊＊＊＊＊＊＊＊");
  expect(hd).toEqual(null);

  hd = parser.addLine("■アイウエオ {人名} : あいうえお〔火〕");
  expect(hd.head).toEqual("when");
  expect(hd.desc).toEqual("{代名} : ＊＊\n{名} : 〔＊＊＊＊＊＊＊〕＊＊＊＊＊\n【レベル】＊＊＊＊＊＊＊＊＊＊");

  hd = parser.addLine("■がぎぐげご〔動物が〕 {形} : ざじずぜぞ");
  expect(hd.head).toEqual("アイウエオ");
  expect(hd.desc).toEqual("{人名} : あいうえお〔火〕");

  hd = parser.addLine("■tile  {自動} : 《コ》〔＊＊＊＊＊＊〕＊＊＊＊＊＊＊＊");
  expect(hd.head).toEqual("がぎぐげご");
  expect(hd.desc).toEqual("〔動物が〕 {形} : ざじずぜぞ");

  hd = parser.addLine("■tile  {他動-1} : ＊＊＊＊");
  expect(hd).toEqual(null);

  hd = parser.addLine("# invalid line");
  expect(hd).toEqual(null);

  hd = parser.addLine("■ invalid line");
  expect(hd).toEqual(null);

  hd = parser.flush();
  expect(hd).toEqual({ tile: "{自動} : 《コ》〔＊＊＊＊＊＊〕＊＊＊＊＊＊＊＊\n{他動-1} : ＊＊＊＊" });
});

test("", () => {
  const parser = new SimpleDictParser(" /// ");

  let hd;
  hd = parser.addLine("aaa///bbb");
  expect(hd).toEqual(null);

  hd = parser.addLine("aaa /// bbb");
  expect(hd.head).toEqual("aaa");
  expect(hd.desc).toEqual("bbb");

  hd = parser.addLine("bbb///ccc");
  expect(hd).toEqual(null);

  hd = parser.addLine("bbb /// ccc");
  expect(hd.head).toEqual("bbb");
  expect(hd.desc).toEqual("ccc");

  expect(parser.flush()).toEqual(null);
});

test("", () => {
  const parser = new JsonDictParser();

  parser.addLine("{");
  parser.addLine('"key1":"val1",');
  parser.addLine('"key2":"val2",');
  parser.addLine('"key3":"val3"');
  parser.addLine("}");

  const r = parser.flush();
  expect(r.key1).toEqual("val1");
  expect(r.key2).toEqual("val2");
  expect(r.key3).toEqual("val3");
});
