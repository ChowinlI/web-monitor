/**
 * @author liqiuqing
 * @created_at 2019/7/17
 * @description rollup配置文件
 */
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
    input: 'src/main.js',
    output: {
        name: 'WebMonitor',
        file: 'webMonitor.js',
        format: 'umd'
    },
    plugins: [
        json(),
        resolve(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        })
    ]
}