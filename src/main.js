import './index.html'
import './style.scss'
import { select,selectAll } from 'd3-selection'


selectAll('div').on('mouseover', function() {
  select(this)
    //.transition()
    //.duration(200)
    .style('background-color','orange')
}).on('mouseout', function() {
  var _pos = makeNewPosition()
  select(this)
    .style('background-color','steelblue')
    .style('top',_pos[0]+'px')
    .style('left',_pos[1]+'px')
})

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


function makeNewPosition(){
  // Get viewport dimensions (remove the dimension of the div)
  var width = window.innerWidth
  var height = window.innerHeight
  var h = height- 50
  var w = width - 50
  var nh = Math.floor(Math.random() * h)
  var nw = Math.floor(Math.random() * w)
  return [nh,nw]
}
