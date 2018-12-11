"use strict";

var MyDateTime = (function() {
  // var _dateMsec;
  var _offsetMsec;
  var _IsoDateTimeRegEx = /([0-9]{4})-([0-9]{2})-([0-9]{2})T.+/;
  var _oneDayMsec = 3600 * 24 * 1000;

  var init = () => {
    var d = new Date();
    _offsetMsec = d.getTimezoneOffset() * -60000;
  };

  var now = () => { return Date.now(); };

  var toYYYYMMDD = (dateTime) => {
    var d = new Date();
    dateTime = dateTime + _offsetMsec;
    d.setTime(dateTime);
    return d.toISOString().replace(_IsoDateTimeRegEx, "$1$2$3");
  };

  var toYYYY_MM_DD = (dateTime) => {
    var d = new Date();
    dateTime = dateTime + _offsetMsec;
    d.setTime(dateTime);
    return d.toISOString().substr(0,10);
  };

  var toISOString = (dateTime) => {
    var d = new Date();
    dateTime = dateTime + _offsetMsec;
    d.setTime(dateTime);
    var s = d.toISOString();
    return s.substr(0,s.length-1);
  };

  var addDays = (dateTime, daysToAdd) => {
    return dateTime + _oneDayMsec * daysToAdd;
  };

  return {
    init: init,
    now: now,
    toYYYYMMDD: toYYYYMMDD,
    toYYYY_MM_DD: toYYYY_MM_DD,
    toISOString: toISOString,
    addDays: addDays
  };
})();