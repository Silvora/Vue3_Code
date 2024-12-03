import { build } from 'esbuild';
import minimist from 'minimist';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from "module"

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 兼容 require 引入
const require = createRequire(import.meta.url);

const args = minimist(process.argv.slice(2));

const target = args._[0] || 'reactivity';
const format = args.f || 'iife';

// 要打包那个模块
const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`);

const pkg = require(`../packages/${target}/package.json`);
// 或者
// const pkg =  path.resolve(__dirname, `../packages/${target}/package.json`);

console.log(`🚀 start build: @my-vue/${target}`, );
await build({
    entryPoints: [entry],
    outfile: path.resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    platform: 'browser',
    format: format,
    bundle: true,
    minify: true,
    sourcemap: true,
    target: 'es2016',
    globalName: pkg.buildOptions?.name,
})
console.log(`✅ start dev: @my-vue/${target}`);
