<p align="center">
  <img width="400" src="https://github.com/wtetsu/mouse-dictionary/blob/images/logo.png" alt="Mouse Dictionary logo" />
  <br/>
</p>

<p align="center">
  <a href="https://github.com/wtetsu/mouse-dictionary/actions?query=workflow%3ATest"><img src="https://github.com/wtetsu/mouse-dictionary/workflows/Test/badge.svg" alt="Test" /></a>
  <a href="https://qlty.sh/gh/wtetsu/projects/mouse-dictionary"><img src="https://qlty.sh/gh/wtetsu/projects/mouse-dictionary/maintainability.svg" alt="Maintainability" /></a>
  <a href="https://codecov.io/gh/wtetsu/mouse-dictionary"><img src="https://codecov.io/gh/wtetsu/mouse-dictionary/branch/master/graph/badge.svg" alt="codecov" /></a>
</p>


Mouse Dictionary is a super fast browser dictionary.

<img src="https://user-images.githubusercontent.com/515948/200157867-400b7090-159c-471a-82b2-c4769df318e4.gif" />

Features:

- ⚡ Super quick response time (1/60 second)
- 💡 Smart phrase detection
- 🔍 Automatic word separation (e.g. camelCase -> camel case)
- 📝 Option to add your own data
- 🎨 Customizable view

Available for various documents:

- HTML
- PDF
- YouTube captions
- Notion
- Evernote (Use with [Mouse Dictionary iframe support](https://chrome.google.com/webstore/detail/mouse-dictionary-iframe-s/nigglogmamjbcnljijokibobpcfgmdfn))
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

Use [Node.js](https://nodejs.org/en/download/) 22+.

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

- Editor: the main developer uses VSCode
- Before you commit: try running `npm run test` and `npm run lint`

## Cross-extension messaging

Mouse Dictionary supports receiving [cross-extension messages](https://developer.chrome.com/extensions/messaging). [Mouse Dictionary iframe support](https://github.com/wtetsu/mouse-dictionary-iframe) is a good example that implements message sending to this extension.

Here is a code example for sending a message to Mouse Dictionary. You can make Mouse Dictionary look up words/expressions from other extensions.

```js
const MD_EXTENSION_ID = "dnclbikcihnpjohihfcmmldgkjnebgnj";

chrome.runtime.sendMessage(MD_EXTENSION_ID, {
  type: "text",
  text: "rained cats and dogs",
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

- [ejdict-hand](https://github.com/kujirahand/EJDict) (Public Domain)

### Images

- [WPZOOM Developer Icon Set](https://www.iconfinder.com/iconsets/wpzoom-developer-icon-set) ([CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/))
- [Heroicons UI icon set](https://www.iconfinder.com/iconsets/heroicons-ui) ([MIT](https://opensource.org/licenses/MIT))

### Built-in PDF viewer

- [Mouse Dictionary's built-in PDF viewer](https://github.com/wtetsu/pdf.js) is based on [PDF.js](https://github.com/mozilla/pdf.js) ([Apache-2.0](https://github.com/mozilla/pdf.js/blob/master/LICENSE))

### Great JavaScript libraries

- See [package.json](./package.json) and [license.html](https://github.com/wtetsu/mouse-dictionary/releases)

## See also

[Chrome 拡張の高速な英語辞書ツールをつくりました](https://qiita.com/wtetsu/items/c43232c6c44918e977c9)(a Japanese tutorial)
