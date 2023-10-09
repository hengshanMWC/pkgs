import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index.ts',
    'src/bin/index.ts',
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
    esbuild: {},
  },
})
