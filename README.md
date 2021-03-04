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
- Look up connected words nicely (e.g. camelCase -> camel case)
- Customizable view

Available for various documents:
- Web documents in HTML
  - normal text
  - input elements
  - textarea
- PDF documents
- Google Docs
- YouTube captions
- Local files (HTML, text, PDF)
- ...

## Install

- [For Chrome](https://chrome.google.com/webstore/detail/mouse-dictionary/dnclbikcihnpjohihfcmmldgkjnebgnj)
- [For Firefox](https://addons.mozilla.org/ja/firefox/addon/mousedictionary/)
- For Safari (See [#53](https://github.com/wtetsu/mouse-dictionary/pull/53))

See also [Getting started](https://github.com/wtetsu/mouse-dictionary/wiki/Getting-started)

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

Use npm 7+.

```sh
npm install
```

### Build

For Chrome:

```sh
npm run build-chrome   # Debug build
npm run release-chrome # Release build
```

For Firefox:

```sh
npm run build-firefox   # Debug build
npm run release-firefox # Release build
```

For Safari:

```sh
npm run build-safari   # Debug build
npm run release-safari # Release build
```


see [package.json](./package.json) for other commands.




## Contribution

For the moment, Mouse Dictionary project doesn't have any strict rule about contribution. Feel free to create any issues and pull requests.

Some guides:

* Editor: the main developer uses VSCode
* Before you commit: try running `npm run test` and `npm run lint`

## Cross-extension messaging

Mouse Dictionary supports receiving [cross-extension messages](https://developer.chrome.com/extensions/messaging). [Mouse Dictionary iframe support](https://github.com/wtetsu/mouse-dictionary-iframe) is a good example that implements message sending to this extension.

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

* [ejdic-hand](https://github.com/kujirahand/EJDict) (Public Domain)

### Images

- [WPZOOM Developer Icon Set](https://www.iconfinder.com/iconsets/wpzoom-developer-icon-set) ([CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/))
- [Heroicons UI icon set](https://www.iconfinder.com/iconsets/heroicons-ui) ([MIT](https://opensource.org/licenses/MIT))

### Build-in PDF viewer

* [Mouse Dictionary's build-in PDF viewer](https://github.com/wtetsu/pdf.js) is based on [PDF.js](https://github.com/mozilla/pdf.js) ([Apache-2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE))

### Great JavaScript libraries

* See [package.json](./package.json)

## See also

[Chrome 拡張の高速な英語辞書ツールをつくりました](https://qiita.com/wtetsu/items/c43232c6c44918e977c9)(a Japanese tutorial)
