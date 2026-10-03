import { vi } from "vitest";

// Promise-based like the real chrome.storage (MV3) / browser.storage
class Storage {
  constructor() {
    this.data = {};
  }

  async get(keys) {
    const result = {};
    // Like the real chrome.storage, missing keys are omitted
    for (const key of keys) {
      if (key in this.data) {
        result[key] = this.data[key];
      }
    }
    return result;
  }

  async set(items) {
    Object.assign(this.data, items);
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
    return this.listeners.map((listener) => listener(...args));
  }
}

class Chrome {
  constructor() {
    this.runtime = {
      onMessage: new Event(),
      onMessageExternal: new Event(),
      getURL: (path) => `chrome-extension://test/${path}`,
      sendMessage: vi.fn(async () => {}),
      openOptionsPage: vi.fn(async () => {}),
    };
    this.storage = {
      local: new Storage(),
      sync: new Storage(),
    };
    this.action = { onClicked: new Event() };
    this.browserAction = { onClicked: new Event() };
    this.commands = { onCommand: new Event() };
    this.scripting = { executeScript: vi.fn(async () => {}) };
    this.tabs = {
      query: vi.fn(async () => []),
      sendMessage: vi.fn(async () => {}),
      executeScript: vi.fn(async () => {}),
    };
  }
}

export default Chrome;
