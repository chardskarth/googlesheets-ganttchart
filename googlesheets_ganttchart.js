let HOUR_IN_A_DAY = 8;
let MINIMUM_HOUR_INTERVAL = 4;

let _oldAddWeekDays = momentBusiness.addWeekDays;
momentBusiness.addWeekDays = function(moment, daysToAdd){
  return _oldAddWeekDays.call(momentBusiness, moment, daysToAdd);
}

momentBusiness.addWeekDayHours = function(moment, hoursToAdd){
  if(hoursToAdd > HOUR_IN_A_DAY){
    throw new Error('hoursToAdd in addWeekDayHours cannot be greater than HOUR_IN_A_DAY');
  }
  moment.add(hoursToAdd, 'hours');
  let hoursSince = _hoursPassed(moment);
  let overlappingHours = hoursSince - HOUR_IN_A_DAY
  if(overlappingHours > 0){
    momentBusiness.addWeekDays(moment, 1);
    moment.startOf('day');
    momentBusiness.addWeekDayHours(moment, overlappingHours);
  }
  if(_hoursPassed(moment) == HOUR_IN_A_DAY){
    moment.startOf('day');
    momentBusiness.addWeekDays(moment, 1);
  }
}

momentBusiness.checkAddHolidays = function(before, after, holidays){
  let taskRange = moment.range(before, after);
  let daysToAdd = 0;
  holidays.forEach((holidayRange) =>{
    let intersectRange = holidayRange.intersect(taskRange);
    if(intersectRange){
      for (let day of intersectRange.by('day')) {
        if(momentBusiness.isWeekDay(day)){
          daysToAdd++;
        }
      }
    }
  });
  return momentBusiness.addWeekDays(after, daysToAdd);
}

function GetStartDates(startDate, taskDurations, holidays){
  let latestDate = _toMoment(startDate);
  holidays = _parseHolidays(holidays);
  return taskDurations.map((taskDuration) => {
    let {days, total,
        dayHourRemainder} = _parseTaskDuration(taskDuration);
    let momentBefore = latestDate.clone();
    momentBusiness.addWeekDays(latestDate, days);
    momentBusiness.addWeekDayHours(latestDate, dayHourRemainder);
    momentBusiness.checkAddHolidays(momentBefore, latestDate, holidays);
    
    return [`${latestDate.format('MM/DD/YYYY')}`];
  });
}

function GetChartHeader(){

}

function GetChart(){

}

function _hoursPassed(moment){
  let startOfDayMoment = moment.clone().startOf('day');
  return moment.diff(startOfDayMoment, 'hours');
}

function _toMoment(toMoment){
  var retVal = moment(toMoment, 'MM/DD/YYYY', true);
  retVal.startOf('day');
  return retVal;
}

function _parseHolidays(holidays){
  return (holidays || []).map(([from, to]) => {
    from = _toMoment(from);
    if(to){
      to = _toMoment(to);
    } else {
      to = from;
    }
    return moment.range(from, to);
  });
}

/**
 * a taskDuration should be in the format of [hr, offset]
 * where hr and offset are integers and should be both divisible by MINIMUM_HOUR_INTERVAL
 * @param {*} taskDuration 
 */
function _parseTaskDuration(taskDuration){
  let [duration, offset] = taskDuration.map((x) => x || 0);
  let total = duration + offset;
  let days = Math.floor(total / HOUR_IN_A_DAY);
  let dayHourRemainder = total % HOUR_IN_A_DAY;
  return {total, days, dayHourRemainder}
}
