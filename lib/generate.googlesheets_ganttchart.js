let {read} = require('fs-jetpack');  
let {join} = require('path');
let {js_beautify} = require('js-beautify');

const INSERT_AT = '{{GanttChartModule}}';

const TEMPLATE = `
loadMoment();
${INSERT_AT}

function loadMoment(){
  eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js').getContentText());
  eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/jmeas/moment-business/master/dist/moment-business.min.js').getContentText());
}`
;

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
