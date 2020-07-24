# Source code

## Outline

|                | main                | options            |
| -------------- | ------------------- | ------------------ |
| Responsibility | Core features       | Options screen     |
| Priority       | Speed and lightness | Functionality      |
| Implementation | TypeScript + React  | Pure JavaScript    |
| Dependency     | Many libraries      | No dependency (\*) |
| Module         | named               | default            |

(\*) Hogan.js is the only exception.

## Dependency

```
main <- (extern) <- options
```

Always go through `extern` in order to access `main`.
