import fs from 'fs'
import path from 'path'
import zlib from 'zlib' // 用于使用gzip算法进行文件压缩
import { rollup } from 'rollup'
import type { RollupOptions, InternalModuleFormat, OutputOptions } from 'rollup'
import { minify } from 'terser' // 用于Javascript代码压缩和美化
// 判断是否合法的npm包
import validateNpmPackageName from 'validate-npm-package-name'
import camelcase from 'camelcase' // 转驼峰拼写
import typescript from 'rollup-plugin-typescript2'
// 解析 node_modules 中的模块
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { name } from './package.json'
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

type Builds = Partial<Record<InternalModuleFormat, RollupOptions>>
// rollup 配置
const builds: Builds = {
  es: {
    input: 'scripts/index.ts',
    output: {
      // 当文件名包含 .min 时将会自动启用 terser 进行压缩
      file: `dist/${moduleName}.esm.min.js`,
      format: 'es',
      banner,
    },
  },
  cjs: {
    input: 'scripts/index.ts',
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
      nodeResolve(),
      commonjs(),
      typescript(),
      ...plugins,
    ],
    external: ['globby'],
    // 监听
    watch: {
      include: 'src/**',
    },
  }
  return config
}

// 以下代码取自 vue 官方仓库
// 通过 rollup api 打包所有 builds 中的配置
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
    }).catch(logError)
  }
  next()
}

function buildEntry (config: RollupOptions) {
  const output = config.output as OutputOptions
  const { file, banner } = output
  const isProd = file ? /(min|prod)\.js$/.test(file) : false
  return rollup(config)
    .then(bundle => bundle.generate(output))
    .then(code => {
      if (isProd) {
        return minify(code.output[0].code, {
          toplevel: true,
          output: {
            ascii_only: true,
          },
          compress: {
            pure_funcs: ['makeMap'],
          },
        }).then(({ code }) => {
          return write(
            file as string,
            (banner ? `${banner}\n` : '') + code,
            true,
          )
        })
      }
      else {
        return write(file as string, code.output[0].code)
      }
    })
}

function write (dest: string, code: Buffer | string, zip?: boolean) {
  return new Promise((resolve, reject) => {
    function report (extra?: string) {
      const destPath = blue(path.relative(process.cwd(), dest))
      const size = getSize(code)
      console.log(`${destPath} ${size}${extra || ''}`)
      resolve(size)
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(` (gzipped: ${getSize(zipped)})`)
        })
      }
      else {
        report()
      }
    })
  })
}

function getSize (code: Buffer | string) {
  return `${(code.length / 1024).toFixed(2)}kb`
}

function logError (e: Error) {
  console.error(e)
}

function blue (str: string) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`
}
