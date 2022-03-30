import stripAnsi from 'strip-ansi'
import logSymbols from 'log-symbols'

/**
   * The check symbol (✔ on Mac/Linux, √ on Windows)
   * with the ANSI color sequences removed
   */
export const check = stripAnsi(logSymbols.success)

/**
   * The check symbol (ℹ on Mac/Linux, i on Windows)
   * with the ANSI color sequences removed
   */
export const info = stripAnsi(logSymbols.info)
