# Source code

## Outline

|                | main                | options            |
| -------------- | ------------------- | ------------------ |
| Responsibility | Core features       | Options screen     |
| Priority       | Speed and lightness | Functionality      |
| Implementation | Pure JavaScript     | TypeScript + React |
| Dependency     | No dependency (\*)  | Many libraries     |
| Module         | default             | named              |

(\*) Hogan.js is the only exception.

## Dependency

```
main <- (extern) <- options
```

Always go through `extern` in order to access `main`.
