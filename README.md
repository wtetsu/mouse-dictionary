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

## AnkiConnect integration (experimental)

Mouse Dictionary can add the currently shown entry to Anki via AnkiConnect.

### Requirements

- Anki desktop app installed and running
- AnkiConnect add-on installed and enabled
- Mouse Dictionary extension built with the AnkiConnect feature

### Quick start

1. Open a normal web page (not `chrome://`, `vivaldi://`, etc).
2. Hover a word to open the dictionary popup.
3. Click **Add to Anki**.
4. If you do not have the note type yet, click **Create "MouseDictionary" note type**.
5. Click **Add** to create a card.

### Editing and lock behavior

- The add popup starts in **Lock** state. Click **Edit** to unlock inputs.
- While **Shift** is held, the dictionary popup is **locked** (word does not change) and is highlighted.
- While **Shift** is held, you can scroll the dictionary popup even if the cursor is outside it.

### Auto fields and parsing

The integration parses the entry and fills these fields automatically:

- Expression
- Meaning
- Synonyms
- Notes
- Pronunciation (includes `【発音】` and `【＠】`)
- Etymology (`【語源】`)
- Inflection (`【変化】`)
- InflectionEn (English-only text extracted from Inflection for TTS)
- Syllables (`【分節】`)
- Examples (examples like `■ ...`)
- ExamplesEn (English-only examples for TTS)
- Url

Parsing rules (summary):

- `◆` separates notes, but `◆＝...` stays in Meaning (unit conversions, etc).
- `【類】`/`【同】` are merged into Synonyms.
- Other `【...】` tags go to Notes.
- Examples (`■`) move to Examples. When a sense label like `{副-1}` exists, it is prefixed to each example.
- `【レベル】n` is not shown in Notes; it becomes an Anki tag `level-n`.

### Tags

- The tag input is pre-filled with:
  - stored user tags
  - auto tag `level-n` when available
- Auto tags are not saved back to your stored tags.

### TTS (pronunciation button on cards)

The default note template uses Anki's built-in `{{tts}}`:

- Front: `{{tts en_US:Expression}}`
- Back: `{{tts en_US:ExamplesEn}}` and `{{tts en_US:InflectionEn}}`

Make sure Anki TTS is enabled on your system. If you want another language or voice, edit the template in Anki.

### Troubleshooting

- If **Add** hangs: ensure Anki is running and AnkiConnect is enabled.
- If **fields look outdated**: delete the old `MouseDictionary` note type and recreate it.
- If **newlines do not show in Anki**: recreate the note type or update the template with `white-space: pre-wrap;`.

## AnkiConnect連携（実験機能）

Mouse Dictionary から AnkiConnect 経由で表示中の単語を Anki に追加できます。

### 必要なもの

- Anki デスクトップアプリ（起動中）
- AnkiConnect アドオンのインストール・有効化
- AnkiConnect連携付きの Mouse Dictionary ビルド

### 使い方（最短）

1. 通常のWebページを開く（`chrome://` や `vivaldi://` は不可）。
2. 単語にホバーして辞書ポップアップを表示。
3. **Add to Anki** をクリック。
4. 初回は **Create "MouseDictionary" note type** をクリック。
5. **Add** を押してカードを追加。

### 編集とロックの挙動（便利機能）

- 追加ポップアップは **Lock** 状態で始まります。編集したい場合は **Edit** をクリック。
- **Shift** を押している間は辞書ポップアップが **固定** され、強調表示されます。
- **Shift** を押している間はカーソルが外にあっても辞書ポップアップをスクロールできます。

### 自動入力フィールドとパース

以下のフィールドを自動で埋めます：

- Expression
- Meaning
- Synonyms
- Notes
- Pronunciation（`【発音】` と `【＠】` を統合）
- Etymology（`【語源】`）
- Inflection（`【変化】`）
- InflectionEn（TTS用に英語のみ抽出）
- Syllables（`【分節】`）
- Examples（`■ ...` の例文）
- ExamplesEn（TTS用に英語のみ抽出）
- Url

パースの概要：

- `◆` は注記に分離。ただし `◆＝...` は Meaning に残す（換算など）。
- `【類】` / `【同】` は Synonyms に統合。
- それ以外の `【...】` は Notes へ。
- 例文（`■`）は Examples に移動。`{副-1}` のような語義があれば前に付与。
- `【レベル】n` は Notes に出さず、Ankiタグ `level-n` を付与。

### タグ

- タグ入力は以下を合成して初期表示：
  - 保存されているユーザータグ
  - 自動タグ `level-n`（ある場合）
- 自動タグは保存されません（次回に持ち越さない）。

### TTS（カードの発音ボタン）

テンプレートで Anki の `{{tts}}` を使っています：

- 表面: `{{tts en_US:Expression}}`
- 裏面: `{{tts en_US:ExamplesEn}}` と `{{tts en_US:InflectionEn}}`

別の言語・音声にしたい場合は Anki 側のテンプレートを編集してください。

### トラブルシュート

- **Add で止まる**: Anki が起動しているか / AnkiConnect が有効か確認。
- **フィールドが古い**: 既存の `MouseDictionary` ノートタイプを削除して再作成。
- **改行が表示されない**: テンプレートに `white-space: pre-wrap;` を追加、または再作成。
