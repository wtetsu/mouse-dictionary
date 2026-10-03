import { vi } from "vitest";

class Storage {
  constructor() {
    this.data = {};
  }

  get(keys, callback) {
    const result = {};
    // Like the real chrome.storage, missing keys are omitted
    for (const key of keys) {
      if (key in this.data) {
        result[key] = this.data[key];
      }
    }
    callback(result);
  }

  set(items, callback) {
    Object.assign(this.data, items);
    callback();
  }
}

// Mimics chrome.events.Event. Tests can fire registered listeners via dispatch().
class Event {
  constructor() {
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  dispatch(...args) {
    for (const listener of this.listeners) {
      listener(...args);
    }
  }
}

class Chrome {
  constructor() {
    this.runtime = {
      lastError: null,
      onMessage: new Event(),
      onMessageExternal: new Event(),
      getURL: (path) => `chrome-extension://test/${path}`,
      sendMessage: vi.fn((_message, callback) => callback?.()),
      openOptionsPage: vi.fn((callback) => callback?.()),
    };
    this.storage = {
      local: new Storage(),
      sync: new Storage(),
    };
    this.action = { onClicked: new Event() };
    this.browserAction = { onClicked: new Event() };
    this.commands = { onCommand: new Event() };
    this.scripting = { executeScript: vi.fn() };
    this.tabs = {
      query: vi.fn((_query, callback) => callback([])),
      sendMessage: vi.fn(),
      executeScript: vi.fn(),
    };
  }
}

export default Chrome;
