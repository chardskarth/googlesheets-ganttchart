let {read} = require('fs-jetpack');  
let {join} = require('path');
let {js_beautify} = require('js-beautify');

const INSERT_AT = '{{GanttChartModule}}';

const TEMPLATE = `
let moment = require('moment');
let momentBusiness = require('moment-business');

${INSERT_AT}

module.exports = {
  GetStartDates, GetChartHeader, GetChart
}
`

const MODULE_PATH = join(process.cwd(), 'googlesheets_ganttchart.js');
const MODULE = read(MODULE_PATH)

function beautify(toBeautify){
  let indent_size = 2;
  return js_beautify(toBeautify, {indent_size}).trim();
}

function main(){
  return beautify(TEMPLATE.replace(INSERT_AT, MODULE));
}

if (require.main === module) {
  console.log(main());
} else {
  module.exports = main();
}