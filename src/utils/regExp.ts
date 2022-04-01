export const versionNumberText = '(\\d+)\\.(\\d+)\\.(\\d+)'
export const versionTailText = '(-.+)'
export const range = '([~^])?'
// 正式版本+预发布版本
export const versionText = `${versionNumberText + versionTailText}?$`
// 版本范围+正式版本+预发布版本
export const versionRangeText = range + versionText
// 正式版本
export const versionFormal = `${versionNumberText}$`
// 组织包
export const organization = '^@[^/]+\\/[^/]+'
// npm tag
export const npmTag = '^.+-(\\w+)\\.'
