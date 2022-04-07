import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { rollup } from 'rollup'
import type { RollupOptions, InternalModuleFormat, OutputOptions } from 'rollup'
// 判断是否合法的npm包
import validateNpmPackageName from 'validate-npm-package-name'
import camelcase from 'camelcase' // 转驼峰拼写
// 解析 node_modules 中的模块
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import esbuild from 'rollup-plugin-esbuild'
import colors from 'colors'
import { name } from '../package.json'
const timeTag = '📦'
console.time(timeTag)
let moduleName = name
// 检查是否是合法的 npm 包名
if (!validateNpmPackageName(moduleName)) {
  throw new Error(`${moduleName} 不是一个合法的 npm 包名`)
}

// 对于 npm 私有包，取 @scope 后面的部分作为包名
if (/^@.+\//g.test(moduleName)) {
  moduleName = moduleName.split('/')[1]
}

// 将其他形式的命名规则转换为驼峰命名
moduleName = camelcase(moduleName)

// 头信息
const banner = '// * Released under the MIT License.\n'

const esbuildPlugin = esbuild()

type Builds = Partial<Record<InternalModuleFormat, RollupOptions>>
// rollup 配置
const builds: Builds = {
  es: {
    input: 'index.ts',
    output: {
      // 当文件名包含 .min 时将会自动启用 terser 进行压缩
      file: `dist/${moduleName}.esm.min.js`,
      format: 'es',
      banner,
    },
  },
  cjs: {
    input: 'index.ts',
    output: {
      // 当文件名包含 .min 时将会自动启用 terser 进行压缩
      file: `dist/${moduleName}.cjs.min.js`,
      format: 'cjs',
      banner,
    },
  },
}

const genConfig = (key: keyof Builds): RollupOptions => {
  const {
    input,
    output,
    plugins = [],
  } = builds[key] as RollupOptions
  const config = {
    input,
    output,
    plugins: [
      esbuildPlugin,
      nodeResolve(),
      commonjs(),
      json(),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': 'undefined',
      }),
      ...plugins,
    ],
    // 监听
    // watch: {
    //   include: 'src/**',
    // },
  }
  return config
}

const getAllBuilds = Object.keys(builds)
  .map(key => genConfig(key as keyof Builds))

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

build(getAllBuilds)

function build (builds: RollupOptions[]) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
      else {
        console.timeEnd(timeTag)
      }
    }).catch(logError)
  }
  next()
}

function buildEntry (config: RollupOptions) {
  const output = config.output as OutputOptions
  const { file, banner } = output
  return rollup(config)
    .then(bundle => bundle.generate(output))
    .then(code => {
      return write(
        file as string,
        (banner ? `${banner}\n` : '') + code.output[0].code,
      )
    })
}

function write (dest: string, code: Buffer | string) {
  return new Promise((resolve, reject) => {
    function report (extra: string) {
      const destPath = colors.green(path.relative(process.cwd(), dest))
      const size = colors.yellow(getSize(code) + extra)
      console.log(`${destPath} ${size}`)
      resolve(size)
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      zlib.gzip(code, (err, zipped) => {
        if (err) return reject(err)
        report(` (gzipped: ${getSize(zipped)})`)
      })
    })
  })
}

function getSize (code: Buffer | string) {
  return `${(code.length / 1024).toFixed(2)}kb`
}

function logError (e: Error) {
  console.error(e)
}
