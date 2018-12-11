"use strict";

var Network = (function() {
  //
  const _baseURL = "https://api.impactsolar.co.th/";
  const _signIn = "signIn";
  const _siteInfo = "siteInfo/";
  const _plotData = "plotData/";

  const _tickerMsec = 20; // time between each processXhr tick
  const _twoDaysMsec = 1000 * 3600 * 48; // msec in 2 days

  // internals
  var _minDelayMsec = 0;  // min delay between xhr requests in msec
  var _lastXhrSentTime;  // last xhr sent out
  var _xhrInfo;

  // callbacks
  var _startXhrCallback;

  var init = (callbacks) => {
    _startXhrCallback = callbacks.startXhrCallback;

    _startTicker();
  };

  var getMinDelayMsec = () => { return _minDelayMsec; };
  var setMinDelayMsec = (value) => { console.log("Network.setMinDelayMsec "+value+"ms"); _minDelayMsec = value; };
  var getLastXhrSentTime = () => { return _lastXhrSentTime; };

  var _startTicker = () => {
    _lastXhrSentTime = Date.now() - _twoDaysMsec;
    setInterval(function() { _processXhr(); }, _tickerMsec);
  };

  var _processXhr = () => {
    var now = Date.now();
    if (now - _lastXhrSentTime < _minDelayMsec) return;
    if (typeof _xhrInfo !== "object") return;
    _lastXhrSentTime = now;
    _startXhrCallback(_lastXhrSentTime, _xhrInfo.info);
    $.ajax({url: _xhrInfo.url, headers: _xhrInfo.headers, method: _xhrInfo.method, success: _xhrInfo.success});
    _xhrInfo = "";
  };

  var _queueXhr = (obj) => {
    _xhrInfo = {};
    _xhrInfo.url = obj.url; _xhrInfo.headers = obj.headers;
    _xhrInfo.method = obj.method; _xhrInfo.success = obj.success;
    _xhrInfo.info = obj.info; // extra information for display
  };

  var signIn = (username, password, callback) => {
    var userpass = '{"user":"'+username+'","pass":"'+password+'"}';
    $.post(_baseURL+_signIn, 'value='+encodeURIComponent(userpass), callback);
  };

  var siteInfo = (token, site, totalGenToDate, callback) => {
    var head = {'token':token};
    if (!!totalGenToDate) head.totalGenToDate = totalGenToDate;
    $.ajax({url: _baseURL+_siteInfo+site, headers: head, method: 'GET', success: callback});
  };

  var plotDataDay = (token, site, dateString, resolution, callback) => {
    var head = {'token':token};
    var val  = {};
    val.fromDate = dateString;
    val.toDate = dateString;
    val.resolution = resolution;
    head.value = JSON.stringify(val);

    // we use _queueXhr to honor _minDelayMsec here: This is the equivalent jquery ajax call:
    // $.ajax({url: _baseURL+_plotData+site, headers: head, method: 'GET', success: callback});
    _queueXhr({url: _baseURL+_plotData+site, headers: head, method: 'GET', success: callback, info: val});
  };

  return {
    init: init,
    getMinDelayMsec: getMinDelayMsec,
    setMinDelayMsec: setMinDelayMsec,
    getLastXhrSentTime: getLastXhrSentTime,
    signIn: signIn,
    siteInfo: siteInfo,
    plotDataDay: plotDataDay
  };
})();
