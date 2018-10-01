[![Build Status](https://travis-ci.org/wtetsu/mouse-dictionary.svg?branch=master)](https://travis-ci.org/wtetsu/mouse-dictionary)
[![Code Climate](https://codeclimate.com/github/wtetsu/mouse-dictionary/badges/gpa.svg)](https://codeclimate.com/github/wtetsu/mouse-dictionary)

# Mouse Dictionary

A dictionary for Google Chrome and Firefox.

- Blazing fast
- Can show collocations
- Divide a string like "camelCase" into "camel" and "case" and look up them at once

Download it.

- Chrome: https://chrome.google.com/webstore/detail/mouse-dictionary/dnclbikcihnpjohihfcmmldgkjnebgnj
- Firefox: https://addons.mozilla.org/ja/firefox/addon/mousedictionary/

## Screenshots

![ss01.gif](https://github.com/wtetsu/mouse-dictionary/blob/images/ss01.gif)

## How to develop

Use npm 6+.

Preparation:

```sh
npm install
```

For Chrome:

```sh
npm run build-chrome
```

For Firefox:

```sh
npm run build-firefox
```

## License

Mouse Dictionary is published under the MIT license.

## Third-party data

This project includes some third-party data:

- dictionary data

  - ejdic-hand
  - https://kujirahand.com/web-tools/
  - License: Public domain

- Images
  - bookmark icon, gear icon
  - https://www.iconfinder.com/iconsets/wpzoom-developer-icon-set
  - License: [Creative Commons (Attribution-Share Alike 3.0 Unported)](https://creativecommons.org/licenses/by-sa/3.0/)
