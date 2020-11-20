[![Test](https://github.com/wtetsu/mouse-dictionary/workflows/Test/badge.svg)](https://github.com/wtetsu/mouse-dictionary/actions?query=workflow%3ATest)
[![Code Climate](https://codeclimate.com/github/wtetsu/mouse-dictionary/badges/gpa.svg)](https://codeclimate.com/github/wtetsu/mouse-dictionary)
[![codecov](https://codecov.io/gh/wtetsu/mouse-dictionary/branch/master/graph/badge.svg)](https://codecov.io/gh/wtetsu/mouse-dictionary)

# Mouse Dictionary: Super Fast Dictionary

<img src="https://github.com/wtetsu/mouse-dictionary/blob/images/logo.png" title="Mouse Dictionary" width="400" height="229">

[Mouse Dictionary](https://mouse-dictionary.netlify.app/en/) is a super fast dictionary for Chrome and Firefox.

Features:
- Super fast (react in 1/60 second)
- Awesome phrases detection
- Capable of importing your own text data
- **Available on PDF documents!**
- Look up connected words at one
  - camelCase -> "camel", "case"
  - snake_case -> "snake", "case"
  - splitinto  -> "split into"
- Customizable view
- Available not only on very normal document:
  - YouTube captions
  - input elements
  - textarea
  - ...

Download it.

- [For Chrome](https://chrome.google.com/webstore/detail/mouse-dictionary/dnclbikcihnpjohihfcmmldgkjnebgnj)
- [For Firefox](https://addons.mozilla.org/ja/firefox/addon/mousedictionary/)

Use it:

- [Getting started](https://github.com/wtetsu/mouse-dictionary/wiki/Getting-started)

## Screenshots

### English-Japanese

![ss02.gif](https://github.com/wtetsu/mouse-dictionary/blob/images/ss02.gif)

### Japanese-English

![ss03.gif](https://github.com/wtetsu/mouse-dictionary/blob/images/ss03.png)

### German

Want to use for the German language? Take a look these great articles!

- [MOUSE DICTIONARY MIT WADOKU-WÖRTERBUCH](https://informationjapanforschung.blogspot.com/2019/06/mouse-dictionary-mit-wadoku-worterbuch.html)
- [MOUSE DICTIONARY 2](https://informationjapanforschung.blogspot.com/2019/06/mouse-dictionary-2.html)

## How to develop

### Preparation

Use npm 6+.

```sh
npm install
```

### Build

#### Debug build
For Chrome:

```sh
npm run build-chrome
```

For Firefox:

```sh
npm run build-firefox
```


#### Release build

For Chrome:

```sh
npm run release-chrome
```

For Firefox:

```sh
npm run release-firefox
```

### Watch

If you want to keep building every time after you edit source code, watch would be quite useful.

For Chrome:

```sh
npm run watch-chrome
```

For Firefox:

```sh
npm run watch-firefox
```


## Contribution

For the moment, Mouse Dictionary project doesn't have any strict rule about contribution. Feel free to create any issues and pull requests.

Some guides:

* Editor: the main developer uses VSCode
* Before you commit: try running `npm run test` and `npm run lint`

## Cross-extension messaging

Mouse Dictionary supports receiving [cross-extension messages](https://developer.chrome.com/extensions/messaging). One example of an extension that implements sending message to this extension is [Mouse Dictionary iframe support](https://github.com/wtetsu/mouse-dictionary-iframe).

Here is a code example for sending a message to Mouse Dictionary. You can make Mouse Dictionary look up words/expressions from other extensions.

```js
const MD_EXTENSION_ID = "dnclbikcihnpjohihfcmmldgkjnebgnj";

chrome.runtime.sendMessage(MD_EXTENSION_ID, {
  type: "text",
  text: "rained cats and dogs"
});
```

Parameters:

| name | type   | value                    |
| ---- | ------ | ------------------------ |
| type | string | must be "text"           |
| text | string | text you want to look up |

## License

Mouse Dictionary is published under the MIT license.

## Third-party data

This project includes some third-party data:

### Dictionary data

ejdic-hand

- https://github.com/kujirahand/EJDict
- License: Public domain

### Images

bookmark icon, gear icon

- https://www.iconfinder.com/iconsets/wpzoom-developer-icon-set
- License: [Creative Commons (Attribution-Share Alike 3.0 Unported)](https://creativecommons.org/licenses/by-sa/3.0/)

### Build-in PDF viewer

[A build-in PDF viewer](https://github.com/wtetsu/pdf.js) based on [PDF.js](https://github.com/mozilla/pdf.js).

### Great JavaScript libraries

See [package.json](https://github.com/wtetsu/mouse-dictionary/blob/master/package.json)

## See also

[Chrome 拡張の高速な英語辞書ツールをつくりました](https://qiita.com/wtetsu/items/c43232c6c44918e977c9)(a Japanese tutorial)
