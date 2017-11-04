let faker = require('faker');
let moment = require('moment');

exports.createTaskDurations = function(taskCount){
  return Array.from(Array(taskCount)).map(() => {
    return [faker.random.number(10) * 4, faker.random.number(10) * 4];
  });
}

exports.createHolidays = function(holidayCount, startDate){
  startDate = moment(startDate, 'MM/DD/YYYY', true);
  return Array.from(Array(holidayCount)).map(() => {
    console.log('holidayCount', holidayCount);
    let interval = faker.random.number(3) + faker.random.number(2);
    let duration = faker.random.number(5);
    startDate.add(interval, 'days');
    let holidayStartDate = startDate.format('MM/DD/YYYY');
    let holidayEndDate = undefined;
    if(duration){
      startDate.add(duration, 'days');
      holidayEndDate = startDate.format('MM/DD/YYYY');
    }
    return [holidayStartDate, holidayEndDate];
  });
}