export type PkgsTestPublish = (cmdText: string) => void
export const testGlobal: {
  pkgsTestPublish?: PkgsTestPublish
} = {}
export function testEmit (arrs: any[]) {
  arrs.forEach(item => {
    if (testGlobal.pkgsTestPublish) {
      testGlobal.pkgsTestPublish(item)
    }
  })
}
