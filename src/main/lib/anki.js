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
  "Syllables",
  "Examples",
  "Url",
];
const DEFAULT_CSS =
  ".card { font-family: 'Hiragino Kaku Gothic Pro', Meiryo, sans-serif; font-size: 18px; color: #222; }";
const DEFAULT_TEMPLATES = [
  {
    Name: "Card 1",
    Front: "{{Expression}}",
    Back:
      "{{FrontSide}}<hr id=answer>{{Meaning}}<br><br>{{#Synonyms}}<div style='font-size:0.85em;color:#555;'>Synonyms: {{Synonyms}}</div>{{/Synonyms}}{{#Pronunciation}}<div style='font-size:0.85em;color:#555;'>Pronunciation: {{Pronunciation}}</div>{{/Pronunciation}}{{#Etymology}}<div style='font-size:0.85em;color:#555;'>Etymology: {{Etymology}}</div>{{/Etymology}}{{#Inflection}}<div style='font-size:0.85em;color:#555;'>Inflection: {{Inflection}}</div>{{/Inflection}}{{#Syllables}}<div style='font-size:0.85em;color:#555;'>Syllables: {{Syllables}}</div>{{/Syllables}}{{#Examples}}<div style='font-size:0.85em;color:#555;'>Examples: {{Examples}}</div>{{/Examples}}{{#Notes}}<div style='font-size:0.85em;color:#555;'>Notes: {{Notes}}</div>{{/Notes}}{{#Url}}<div style='font-size:0.85em;color:#555;'>{{Url}}</div>{{/Url}}",
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

export default {
  request,
  deckNames,
  modelNames,
  modelFieldNames,
  addNote,
  createDefaultModel,
  DEFAULT_MODEL_NAME,
  DEFAULT_FIELDS,
};
