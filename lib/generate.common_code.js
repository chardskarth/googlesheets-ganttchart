module.exports = `
const INTERVALS = {
  year: true,
  quarter: true,
  month: true,
  week: true,
  day: true,
  hour: true,
  minute: true,
  second: true
};

function extendMoment(moment) {
  /**
   * Build a date range.
   */
  moment.range = function range(start, end) {
    const m = this;

    if (INTERVALS.hasOwnProperty(start)) {
      return new DateRange(moment(m).startOf(start), moment(m).endOf(start));
    }

    return new DateRange(start, end);
  };

  /**
   * Alias of static constructor.
   */
  moment.fn.range = moment.range;

  /**
   * Expose constructor
   */
  moment.range.constructor = DateRange;

  return moment;
}

class DateRange {
  constructor(start, end) {
    let s = start;
    let e = end;

    if (arguments.length === 1 || end === undefined) {
      if (typeof start === 'object' && start.length === 2) {
        [s, e] = start;
      }
      else if (typeof start === 'string') {
        [s, e] = start.split('/');
      }
    }

    this.start = (s === null) ? moment(-8640000000000000) : moment(s);
    this.end = (e === null) ? moment(8640000000000000) : moment(e);
  }

  by(interval, options = { exclusive: false, step: 1 }) {
    const range = this;

    return {
      [Symbol.iterator]() {
        const exclusive = options.exclusive || false;
        const step = options.step || 1;
        const diff = Math.abs(range.start.diff(range.end, interval)) / step;
        let iteration = 0;

        return {
          next() {
            const current = range.start.clone().add((iteration * step), interval);
            const done = exclusive
              ? !(iteration < diff)
              : !(iteration <= diff);

            iteration++;

            return {
              done,
              value: (done ? undefined : current)
            };
          }
        };
      }
    };
  }

  intersect(other) {
    const start = this.start.valueOf();
    const end = this.end.valueOf();
    const oStart = other.start.valueOf();
    const oEnd = other.end.valueOf();

    if ((start <= oStart) && (oStart < end) && (end < oEnd)) {
      return new this.constructor(oStart, end);
    }
    else if ((oStart < start) && (start < oEnd) && (oEnd <= end)) {
      return new this.constructor(start, oEnd);
    }
    else if ((oStart < start) && (start <= end) && (end < oEnd)) {
      return this;
    }
    else if ((start <= oStart) && (oStart <= oEnd) && (oEnd <= end)) {
      return other;
    }

    return null;
  }

  diff(unit, rounded) {
    return this.end.diff(this.start, unit, rounded);
  }

  toDate() {
    return [this.start.toDate(), this.end.toDate()];
  }
}

extendMoment(moment);
`;