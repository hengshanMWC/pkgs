import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index.ts',
    'src/cli/bin.ts',
  ],
  clean: true,
  declaration: true,
  rollup: {
    cjsBridge: true,
    emitCJS: true,
    inlineDependencies: true,
    dts: {
      respectExternal: false,
    },
    commonjs: {},
    esbuild: {}
  },
})
