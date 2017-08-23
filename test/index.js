/* eslint no-useless-escape: "off" */
import 'babel-polyfill'
import 'es6-promise/auto'

const testsContext = require.context('./', true, /.+\.test\.js$/)
testsContext.keys().forEach(testsContext)
