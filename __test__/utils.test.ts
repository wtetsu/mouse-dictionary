import utils from "../src/main/lib/utils";

const setWindowInnerSize = (width: number, height: number) => {
  //@ts-ignore
  window.innerWidth = width;
  //@ts-ignore
  window.innerHeight = height;
};

const setWindowGetSelection = (fn: () => string) => {
  //@ts-ignore
  window.getSelection = fn;
};

test("", () => {
  expect(utils.omap({ a: 1, b: 2, c: 3 }, (v) => v * 2)).toEqual({ a: 2, b: 4, c: 6 });
  expect(utils.omap({ a: 1, b: 2, c: 3 }, (v) => v * 2, ["b", "c"])).toEqual({ b: 4, c: 6 });

  expect(utils.omap({ a: 1, b: 2, c: 3 }, null, ["b", "c"])).toEqual({ b: null, c: null });
  expect(utils.omap({ a: 1, b: 2, c: 3 })).toEqual({ a: null, b: null, c: null });
});

test("", () => {
  expect(utils.areSame({}, {})).toEqual(true);
  expect(utils.areSame({ a: 123 }, { a: 123 })).toEqual(true);
  expect(utils.areSame({ a: 123 }, { b: 123 })).toEqual(false);
});

test("", () => {
  expect(utils.isInsideRange({ left: 100, top: 200, width: 50, height: 100 }, { x: 100, y: 199 })).toEqual(false);
  expect(utils.isInsideRange({ left: 100, top: 200, width: 50, height: 100 }, { x: 99, y: 200 })).toEqual(false);
  expect(utils.isInsideRange({ left: 100, top: 200, width: 50, height: 100 }, { x: 100, y: 200 })).toEqual(true);

  expect(utils.isInsideRange({ left: 100, top: 200, width: 50, height: 100 }, { x: 150, y: 300 })).toEqual(true);
  expect(utils.isInsideRange({ left: 100, top: 200, width: 50, height: 100 }, { x: 151, y: 300 })).toEqual(false);
  expect(utils.isInsideRange({ left: 100, top: 200, width: 50, height: 100 }, { x: 150, y: 301 })).toEqual(false);
});

test("", () => {
  expect(utils.convertToInt("1")).toEqual(1);
  expect(utils.convertToInt("0")).toEqual(0);
  expect(utils.convertToInt("-1")).toEqual(-1);
  expect(utils.convertToInt("abc")).toEqual(0);
  expect(utils.convertToInt("")).toEqual(0);
  expect(utils.convertToInt(null)).toEqual(0);
  expect(utils.convertToInt(undefined)).toEqual(0);
});

test("", () => {
  expect(utils.convertToStyles({})).toEqual({});
  expect(utils.convertToStyles({ top: 123, left: 234 })).toEqual({ top: "123px", left: "234px" });
  expect(utils.convertToStyles({ a: "aaa", b: "@@@" })).toEqual({});
  expect(utils.convertToStyles({ top: 123, left: 234, a: "aaa", b: "@@@" })).toEqual({ top: "123px", left: "234px" });
});

test("", () => {
  setWindowInnerSize(1024, 800);
  expect(
    utils.optimizeInitialPosition(
      {
        left: 800,
        top: 700,
        width: 300,
        height: 200,
      },
      0,
      0
    )
  ).toEqual({
    left: 724,
    top: 600,
    width: 300,
    height: 200,
  });

  expect(
    utils.optimizeInitialPosition({
      left: 800,
      top: 700,
      width: 300,
      height: 200,
    })
  ).toEqual({
    left: 719,
    top: 595,
    width: 300,
    height: 200,
  });

  expect(
    utils.optimizeInitialPosition({
      left: -100,
      top: -200,
      width: 300,
      height: 200,
    })
  ).toEqual({
    left: 5,
    top: 5,
    width: 300,
    height: 200,
  });

  setWindowInnerSize(200, 100);

  expect(
    utils.optimizeInitialPosition({
      left: -100,
      top: -200,
      width: 300,
      height: 200,
    })
  ).toEqual({
    left: 5,
    top: 5,
    width: 190,
    height: 90,
  });

  expect(
    utils.optimizeInitialPosition({
      left: null,
      top: null,
      width: null,
      height: null,
    })
  ).toEqual({
    left: null,
    top: null,
    width: null,
    height: null,
  });
});

test("", () => {
  setWindowGetSelection(() => "");
  expect(utils.getSelection()).toEqual("");

  setWindowGetSelection(() => "    a b c   ");
  expect(utils.getSelection()).toEqual("a b c");

  setWindowGetSelection(() => "    aaa\nbbb\rccc   ");
  expect(utils.getSelection()).toEqual("aaa bbb ccc");
});
