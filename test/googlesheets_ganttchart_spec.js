let {join} = require('path');
const MAIN_MODULE_ID = join(process.cwd(), 'lib', 'generate.googlesheets_ganttchart_spec.js');

let {expect} = require('chai');
let requireFromString = require('require-from-string');
let util = require('./util');

describe('main project module', function(){
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
      let retVal = testModule.GetStartDates('06/15/1993', sampleTaskDurations, sampleHolidays);
      expect(retVal).to.deep.equal([ [ '06/17/1993' ], [ '06/29/1993' ], [ '07/06/1993' ] ]);
    });
  });

  describe("GetChartHeader", function(){
    let testModule = requireFromString(require(MAIN_MODULE_ID));
    it("returns an expected result", function(){
      let result = testModule.GetChartHeader('06/15/1993', '06/30/1993', 2);
      expect(result).to.deep.equal([ 
        [ 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11 ],
        [ 'Tue', 'Tue', 'Wed', 'Wed', 'Thu', 'Thu', 'Fri', 'Fri', 'Mon', 'Mon', 'Tue', 'Tue', 'Wed', 'Wed', 'Thu', 'Thu', 'Fri', 'Fri', 'Mon', 'Mon', 'Tue', 'Tue' ],
        [ '06/15', '06/15', '06/16', '06/16', '06/17', '06/17', '06/18', '06/18', '06/21', '06/21', '06/22', '06/22', '06/23', '06/23', '06/24',
          '06/24', '06/25', '06/25', '06/28', '06/28', '06/29', '06/29' ] ])
    });
  });
})