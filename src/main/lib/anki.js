/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const ANKI_CONNECT_URL = "http://127.0.0.1:8765";
const ANKI_CONNECT_VERSION = 6;
const DEFAULT_MODEL_NAME = "MouseDictionary";
const DEFAULT_FIELDS = [
  "Expression",
  "Meaning",
  "Synonyms",
  "Notes",
  "Pronunciation",
  "Etymology",
  "Inflection",
  "InflectionEn",
  "Syllables",
  "Examples",
  "ExamplesEn",
  "Url",
];
const DEFAULT_CSS =
  ".card { font-family: 'Hiragino Kaku Gothic Pro', Meiryo, sans-serif; font-size: 18px; color: #222; }";
const DEFAULT_TEMPLATES = [
  {
    Name: "Card 1",
    Front:
      "<div style='font-size:24px;font-weight:bold;'>{{Expression}}</div>{{#Pronunciation}}<div style='font-size:0.9em;color:#555;margin-top:6px;'>{{Pronunciation}}</div>{{/Pronunciation}}{{#Syllables}}<div style='font-size:0.85em;color:#777;margin-top:4px;'>{{Syllables}}</div>{{/Syllables}}<div style='margin-top:6px;'>{{tts en_US:Expression}}</div>",
    Back: "{{FrontSide}}<hr id=answer><div style='white-space:pre-wrap;'>{{Meaning}}</div>{{#Examples}}<div style='margin-top:10px;white-space:pre-wrap;'>{{Examples}}</div>{{/Examples}}{{#ExamplesEn}}<div style='margin-top:4px;'>{{tts en_US:ExamplesEn}}</div>{{/ExamplesEn}}{{#Synonyms}}<div style='margin-top:10px;font-size:0.85em;color:#555;'>Synonyms: {{Synonyms}}</div>{{/Synonyms}}{{#Notes}}<div style='margin-top:8px;font-size:0.85em;color:#555;white-space:pre-wrap;'>Notes: {{Notes}}</div>{{/Notes}}{{#Etymology}}<div style='margin-top:8px;font-size:0.85em;color:#555;'>Etymology: {{Etymology}}</div>{{/Etymology}}{{#Inflection}}<div style='margin-top:6px;font-size:0.85em;color:#555;'>Inflection（変化形）: {{Inflection}}</div>{{/Inflection}}{{#InflectionEn}}<div style='margin-top:4px;'>{{tts en_US:InflectionEn}}</div>{{/InflectionEn}}<div style='margin-top:10px;font-size:0.85em;color:#555;'><a href='https://skell.sketchengine.eu/#result?f=wordsketch&lang=en&query={{Expression}}'>SkELL</a> · <a href='https://youglish.com/pronounce/{{Expression}}/english'>YouGlish</a></div>{{#Url}}<div style='margin-top:6px;font-size:0.85em;color:#555;'><a href='{{Url}}'>{{Url}}</a></div>{{/Url}}",
  },
];

const request = (action, params = {}) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: "anki_request",
        payload: {
          url: ANKI_CONNECT_URL,
          body: { action, version: ANKI_CONNECT_VERSION, params },
        },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response) {
          reject(new Error("No response from background"));
          return;
        }
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        resolve(response.result);
      },
    );
  });

const deckNames = () => request("deckNames");
const modelNames = () => request("modelNames");
const modelFieldNames = (modelName) => request("modelFieldNames", { modelName });

const addNote = (note) => request("addNote", { note });

const createDefaultModel = () =>
  request("createModel", {
    modelName: DEFAULT_MODEL_NAME,
    inOrderFields: DEFAULT_FIELDS,
    css: DEFAULT_CSS,
    cardTemplates: DEFAULT_TEMPLATES,
  });

const updateDefaultModel = () =>
  request("updateModelTemplates", {
    model: {
      name: DEFAULT_MODEL_NAME,
      templates: templatesToMap(DEFAULT_TEMPLATES),
    },
  }).then(() =>
    request("updateModelStyling", {
      model: {
        name: DEFAULT_MODEL_NAME,
        css: DEFAULT_CSS,
      },
    }),
  );

const templatesToMap = (templates) => {
  const map = {};
  for (const tpl of templates) {
    if (!tpl?.Name) {
      continue;
    }
    map[tpl.Name] = { Front: tpl.Front, Back: tpl.Back };
  }
  return map;
};

export default {
  request,
  deckNames,
  modelNames,
  modelFieldNames,
  addNote,
  createDefaultModel,
  updateDefaultModel,
  DEFAULT_MODEL_NAME,
  DEFAULT_FIELDS,
};
