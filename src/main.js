import './index.html'
import './style.scss'
import { select } from 'd3-selection'

setInterval(() => {
  select('body').style('background-color', `rgb(${
    [...Array(3).keys()].map(() => Math.floor(Math.random() * 256)).join(', ')
  })`)
}, 500)

const result = Object.entries({ w: 20, i: 30, n: 50 })
  .reduce((acc, [k, v]) => {
    const split = acc.split(':')
    return `${split[0] + k}: ${parseInt(split[1]) + v}`
  }, ':0')

console.log(`Testing es6 syntax: ${result}`)
