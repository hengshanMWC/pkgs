import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index.ts',
    'src/cli/bin.ts',
  ],
  clean: true,
  failOnWarn: false,
  declaration: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    dts: {
      respectExternal: false,
    }
  },
})
