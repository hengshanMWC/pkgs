export type PkgsTestPublish = (cmdText: string) => void
const testGlobal: {
  pkgsTestPublish?: PkgsTestPublish
} = {}
export default testGlobal
