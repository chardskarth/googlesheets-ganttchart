var HOUR_IN_A_DAY = 8;
var HOUR_INTERVAL = 4;

momentBusiness.addWeekDayHours = function(moment, hoursToAdd, holidayRanges){
  while(hoursToAdd){
    if(isMomentWithinRanges(moment, holidayRanges)){
      addOneDayCheckHoliday(moment, holidayRanges);
    }
    if(hoursToAdd >= HOUR_IN_A_DAY){
      hoursToAdd -= HOUR_IN_A_DAY;
      addOneDayCheckHoliday(moment, holidayRanges);
    } else {
      moment.add(hoursToAdd, 'hours');
      var hoursSince = _hoursPassed(moment);
      var overlappingHours = hoursSince - HOUR_IN_A_DAY
      if(overlappingHours > 0){
        addOneDayCheckHoliday(moment, holidayRanges);
      }
      if(_hoursPassed(moment) == HOUR_IN_A_DAY){
        addOneDayCheckHoliday(moment, holidayRanges);
        moment.startOf('day');
      }
      hoursToAdd = 0;
    }
  }
}

function GetStartDates(startDate, taskDurations, holidays){
  var latestDate = _toMoment(startDate);
  holidays = _parseHolidays(holidays);
  return taskDurations.map((taskDuration) => {
    var {totalHours} = _parseTaskDuration(taskDuration);
    momentBusiness.addWeekDayHours(latestDate, totalHours, holidays);
    return [`${latestDate.format('MM/DD/YYYY')}`];
  });
}

function GetChartHeader(startDate, endDate, repeat){
  if(!repeat){
    repeat = 2;
  }
  startDate = _toMoment(startDate);
  endDate = _toMoment(endDate);
  if(startDate.diff(endDate) > 0){
    throw new Error('startDate cannot be greater than endDate');
  }

  var retVal = [[], [], []];
  var dayNumber = 1;
  while(!startDate.isSame(endDate)){
    if(momentBusiness.isWeekDay(startDate)){
      for(var ii = 0; ii < repeat; ii++){
        retVal[0].push(dayNumber);
        retVal[1].push(startDate.format('ddd'));
        retVal[2].push(startDate.format('MM/DD'));
      }
      dayNumber++;
    }
    startDate.add(1, 'days');
  }
  return retVal;
}

function GetTotalDays(startDate, endDate, holidays){
  startDate = _toMoment(startDate);
  endDate = _toMoment(endDate);
  holidays = _parseHolidays(holidays);
  var count = 0;
  while(!startDate.isSame(endDate)){
    addOneDayCheckHoliday(startDate, holidays)
    count++;
  }
  return count;
}

function GetChart(startDate, endDate, taskDurations, taskStatus, holidays){ 
  var offset = 0;
  var today = _toMoment();
  startDate = _toMoment(startDate);
  endDate = _toMoment(endDate);
  holidays = _parseHolidays(holidays);
  var rowsToIterate = (GetTotalDays(startDate.clone(), endDate, holidays) * HOUR_IN_A_DAY) / HOUR_INTERVAL;

  return taskDurations.map((taskDuration, taskIndex) => {
    var row = [];
    var {minimumHourIntervalCount} = _parseTaskDuration(taskDuration);
    var hourIntervalCountCopy = minimumHourIntervalCount;
    for (var ii = 0; ii < rowsToIterate; ii++) {
      var currentMoment = iterationToCurrentMoment(ii, startDate);
      var currentTaskStatus = (taskStatus[taskIndex] || '').toString();
      if(isMomentWithinRanges(currentMoment, holidays)){
        toPush = 'holiday';
      } else if(ii >= offset && minimumHourIntervalCount){
        if(currentTaskStatus === 'Completed'){
          toPush = 'completed';
        } else if(currentTaskStatus === 'Issue'){
          toPush = 'issue';
        } else {
          toPush = 'pending';
        }
        minimumHourIntervalCount--;
      } else if(currentMoment.isSame(today, 'day')){
        toPush = 'today';
      } else {
        toPush = 'nothing';
      }
      row.push(toPush);
    }
    offset += hourIntervalCountCopy;
    return row;
  });

  function iterationToCurrentMoment(ii, startDate){
    var daysToAdd = parseInt((ii * HOUR_INTERVAL) / HOUR_IN_A_DAY);
    return momentBusiness.addWeekDays(startDate.clone(), daysToAdd);
  }
}

function _hoursPassed(moment){
  var startOfDayMoment = moment.clone().startOf('day');
  return moment.diff(startOfDayMoment, 'hours');
}

function _toMoment(toMoment){
  var retVal 
  if(!toMoment){
    retVal = moment();
  } else if(moment.isMoment(toMoment)){
    retVal = toMoment;
  } else {
    retVal = moment(toMoment, 'MM/DD/YYYY', true);
    retVal.startOf('day');
  }
  return retVal;
}

function _parseHolidays(holidays){
  holidays = (holidays || []);
  if(holidays.isParsedHolidays){
    return holidays;
  }
  var retVal = holidays.map(([from, to]) => {
    from = _toMoment(from);
    if(to){
      to = _toMoment(to);
    } else {
      to = from.clone();
    }
    return moment.range(from, to.endOf('day'));
  });
  retVal.isParsedHolidays = true;
  return retVal;
}

function isMomentWithinRanges(moment, ranges){
  return ranges.some((range) => {
      var retVal = range.contains(moment);
      if(retVal){
      }
      return retVal;
  });
}

function addOneDayCheckHoliday(moment, holidayRanges){
  momentBusiness.addWeekDays(moment, 1);
  var isAValidDay = () => {
    var isWithinHoliday = isMomentWithinRanges(moment, holidayRanges);
    return !isWithinHoliday && momentBusiness.isWeekDay(moment);
  };
  while(!isAValidDay()){
    momentBusiness.addWeekDays(moment, 1);
  }
}

/**
 * a taskDuration should be in the format of [hr, offset]
 * where hr and offset are integers and should be both divisible by HOUR_INTERVAL
 * @param {*} taskDuration 
 */
function _parseTaskDuration(taskDuration){
  var [duration, offset] = taskDuration.map((x) => x || 0);
  var totalHours = duration + offset;
  var hourRemainder = totalHours % HOUR_IN_A_DAY;
  if(totalHours % HOUR_INTERVAL != 0){
    throw new Error("Task duration must be by " + HOUR_INTERVAL + ' hour interval');
  }
  var minimumHourIntervalCount = totalHours / HOUR_INTERVAL;
  return {totalHours, hourRemainder, minimumHourIntervalCount}
}
