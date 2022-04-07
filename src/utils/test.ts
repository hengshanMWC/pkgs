export type PkgsTestPublish = (cmdText: string) => void
const testGlobal: {
  pkgsTestPublish?: PkgsTestPublish
} = {}
export default testGlobal
export function testEmit (arrs: any[]) {
  arrs.forEach(item => {
    if (testGlobal.pkgsTestPublish) {
      testGlobal.pkgsTestPublish(item)
    }
  })
}
