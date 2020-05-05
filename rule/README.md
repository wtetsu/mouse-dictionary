Note:

These JSON5 files are transformed into one "data/rule.json" file in build time. And Mouse Dictionary loads this rule.js when its start-up process.

Advantages of this mechanism:
* For better UX. The load process is asynchronous. Mouse Dictionary can show its window before finishing to load and process rule.json
* [JSON can be parsed more efficiently than JavaScript.](https://v8.dev/blog/cost-of-javascript-2019)
* Can decouple settings and processes.