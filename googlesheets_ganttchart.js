let HOUR_IN_A_DAY = 8;
let MINIMUM_HOUR_INTERVAL = 4;

momentBusiness.addWeekDayHours = function(moment, hoursToAdd, holidayRanges){
  while(hoursToAdd){
    if(isMomentWithinRanges(moment, holidayRanges)){
      addOneDayCheckHoliday(moment);
    }
    if(hoursToAdd >= HOUR_IN_A_DAY){
      hoursToAdd -= HOUR_IN_A_DAY;
      addOneDayCheckHoliday(moment);
    } else {
      moment.add(hoursToAdd, 'hours');
      let hoursSince = _hoursPassed(moment);
      let overlappingHours = hoursSince - HOUR_IN_A_DAY
      if(overlappingHours > 0){
        addOneDayCheckHoliday(moment);
      }
      if(_hoursPassed(moment) == HOUR_IN_A_DAY){
        addOneDayCheckHoliday(moment);
        moment.startOf('day');
      }
      hoursToAdd = 0;
    }
  }

  function isMomentWithinRanges(moment, ranges){
    return ranges.some((range) => {
        let retVal = range.contains(moment);
        if(retVal){
        }
        return retVal;
    });
  }

  function addOneDayCheckHoliday(moment){
    momentBusiness.addWeekDays(moment, 1);
    let isAValidDay = () => {
      let isWithinHoliday = isMomentWithinRanges(moment, holidayRanges);
      return !isWithinHoliday && momentBusiness.isWeekDay(moment);
    };
    while(!isAValidDay()){
      momentBusiness.addWeekDays(moment, 1);
    }
  }
}

function GetStartDates(startDate, taskDurations, holidays){
  let latestDate = _toMoment(startDate);
  holidays = _parseHolidays(holidays);
  return taskDurations.map((taskDuration) => {
    let {totalHours} = _parseTaskDuration(taskDuration);
    let momentBefore = latestDate.clone();
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
      to = from.clone();
    }
    return moment.range(from, to.endOf('day'));
  });
}

/**
 * a taskDuration should be in the format of [hr, offset]
 * where hr and offset are integers and should be both divisible by MINIMUM_HOUR_INTERVAL
 * @param {*} taskDuration 
 */
function _parseTaskDuration(taskDuration){
  let [duration, offset] = taskDuration.map((x) => x || 0);
  let totalHours = duration + offset;
  let hourRemainder = totalHours % HOUR_IN_A_DAY;
  return {totalHours, hourRemainder}
}
