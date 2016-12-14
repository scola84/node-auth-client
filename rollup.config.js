import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  dest: './dist/auth-client.js',
  entry: 'index.js',
  format: 'umd',
  moduleName: 'auth',
  external: [
    '@scola/d3'
  ],
  globals: {
    '@scola/d3': 'd3'
  },
  plugins: [
    resolve({
      jsnext: true
    }),
    commonjs(),
    buble()
  ]
};
