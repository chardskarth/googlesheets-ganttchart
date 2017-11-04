let {join} = require('path');
const MAIN_MODULE_ID = join(process.cwd(), 'lib', 'generate.googlesheets_ganttchart_spec.js');

let {expect} = require('chai');
let clearRequire = require('clear-require');
let requireFromString = require('require-from-string');
let util = require('./util');

describe('main project module', function(){
  afterEach(function(){
    clearRequire(MAIN_MODULE_ID);
  });
  describe("GetStartDates", function(){
    let testModule = requireFromString(require(MAIN_MODULE_ID));
    it("returns an expected format", function(){
      let sampleTaskDurations = [ [ 8, 12 ], [ 28, 8 ], [ 16, 20 ] ]; //util.createTaskDurations(3);
      let retVal = testModule.GetStartDates('06/15/1993', sampleTaskDurations);
      expect(retVal).to.deep.equal([ [ '06/17/1993' ], [ '06/24/1993' ], [ '06/30/1993' ] ]);
    });
    it("considers holidays", function(){
      let sampleTaskDurations = [ [ 8, 12 ], [ 28, 8 ], [ 16, 20 ] ]; //util.createTaskDurations(3);
      let sampleHolidays = [ [ '06/18/1993', '06/22/1993' ],
        [ '06/25/1993', '06/29/1993' ],
        [ '07/01/1993', undefined ] ]; //util.createHolidays(3, '06/15/1993');
      console.log(sampleHolidays);
      let retVal = testModule.GetStartDates('06/15/1993', sampleTaskDurations, sampleHolidays);
      expect(retVal).to.deep.equal([ [ '06/17/1993' ], [ '06/24/1993' ], [ '06/30/1993' ] ]);
    });
  });
})