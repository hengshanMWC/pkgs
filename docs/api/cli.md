# Cli
## 简介
主要用来接收命令行参数，执行对应命令
## 类型
```ts
function cliMain(
  argv: NodeJS.Process['argv'],
  version?: string
): Promise<Context>
```
## 使用
```ts
import { cliMain } from '@abmao/pkgs'
// 运行pkgs init
cliMain(['', '', 'init'])
```
