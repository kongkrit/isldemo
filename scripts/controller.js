"use strict";

var Controller = (function() {
  // state
  var _haveToken;
  var _token;
  var _dateTimeMsec; //, _dateTimeNow;
  var _msecInOneDay = 1000 * 3600 * 24;
  // var _haveSiteInfo;
  var _Doc;  // Doc module
  var _Network; // Network module
  var _MyDateTime; // MyDateTime module
  var _Mychart; // Mychart module

  // internal values
  var _delayMsec;
  var _username, _password;
  var _siteList = [];
  var _site;
  const _resolution = 'fifteenMinutes';

  var _requestTime = false;
  var _sentTime = false;
  var _lastSentTime = false;
  var _serverTime = false;
  var _requestText = "";
  var _sentText = "";
  var _lastSentText = "";
  var _data, _dataValid;

  var _dataScalePower10;
  const _dataScalePower10min = -2;
  const _dataScalePower10max = 4;

  // chartJS options
  var _chartStepSize;
  var _chartYMax;

  var init = (doc, network, myDateTime, myChart) => {
    _haveToken = false;
    // _haveSiteInfo = false;
    _Doc = doc;
    _Network = network;
    _MyDateTime = myDateTime;
    _Mychart = myChart;

    _dataValid = false;
    _dataScalePower10 = 0;
    _updateScaleDisplayAndRedraw();

    _Doc.hideSiteSelectorSection();
    _Doc.hideSiteInfoSection();
    _Doc.hideRawData();
    _Doc.hideDataSection();
  };

  var clickLogin = () => {
    _username = _Doc.username();
    _password = _Doc.password();
    _Network.signIn(_username,_password, function(data, status, xhr) { _handleLogin(data, status, xhr); });
  };

  var _handleLogin = (data) => { // (data, status, xhr)
    if (typeof data !== "object") {
      // bad login, got no data
      console.log("_handleLogin: bad login");
      _updateToken("");
      _updateSiteList([]);
    } else {
      _updateToken(data.token);
      _updateSiteList(data.availableSites);
    }
    if (_haveToken) _Doc.showSiteSelectorSection();
  };

  var _updateToken = (token) => {
    _haveToken = !!token;
    _token = token;
    _Doc.updateToken(_token);
  };

  var _updateSiteList = (siteList) => {
    _siteList = siteList;
    _Doc.updateSiteList(_siteList, _username);
  };

  var clickSelectSite = () => {
    _site = _Doc.site();
    console.log("Controller:clickSelectSite:"+_site);
    var genToDateString = _MyDateTime.toYYYYMMDD(_MyDateTime.now());
    genToDateString = "";
    _Network.siteInfo(_token, _site, genToDateString, _siteInfoSuccess);
  };

  function _siteInfoSuccess (result) { // (result,status,xhr) {
    console.log("siteInfo success result=",result);

    _chartStepSize = result[0].options.chartjsStepSizeWhour;
    _chartYMax = result[0].options.chartjsYmaxWhour;

    _Doc.updateSiteInfoText(_username, _site, result[0].cod, _chartStepSize, _chartYMax);
    _Doc.showSiteInfoSection();
    changeDelay();
    _Doc.showDataSection();
    _Doc.hideLoginSection();
    _Doc.hideSiteSelectorSection();

    _dateTimeMsec = _MyDateTime.now();

    clickToday();
  }

  var changeDelay = () => {
    _delayMsec = _Doc.delay() * 1000;
    console.log("Controller:changeDelay to "+_delayMsec+"ms");
    _Doc.updateDelayDisplay(_delayMsec);
    _Network.setMinDelayMsec(_delayMsec);
  };

  var _updateScaleDisplayAndRedraw =() => {
    var s = Math.pow(10, _dataScalePower10);
    if (_dataScalePower10 > 0) s = Math.round(s);
    _Doc.updateScaleDisplay('raw data scaled by '+s+"x");
    if (_dataValid) {
      _Mychart.setPlotData(_data, {text:'production', stepSize: _chartStepSize, yMax: _chartYMax, scalePower10: _dataScalePower10, doAxes: true});
      _Mychart.show();
    }
  };

  var clickScaleDown = () => {
    if (_dataScalePower10 <= _dataScalePower10min) _dataScalePower10 = _dataScalePower10min;
    else _dataScalePower10--;
    _updateScaleDisplayAndRedraw();
  };
  var clickScaleUp = () => {
    if (_dataScalePower10 >= _dataScalePower10max) _dataScalePower10 = _dataScalePower10max;
    else _dataScalePower10++;
    _updateScaleDisplayAndRedraw();
  };

  var clickPrevDay = () => {
    _dateTimeMsec -= _msecInOneDay;
    clickToday();
  };
  var clickToday = () => {
    var reqFromDate = _MyDateTime.toYYYYMMDD(_dateTimeMsec);
    console.log("clickToday: "+reqFromDate);

    _Doc.updateDate(_MyDateTime.toYYYY_MM_DD(_dateTimeMsec));

    _requestTime = _MyDateTime.now();
    _requestText = reqFromDate + " " + _resolution;
    _Doc.updateRequestTime( _MyDateTime.toISOString(_requestTime) );
    _Doc.updateRequestURL(_requestText);
    _updateDelta( _Doc.updateDeltaSentRequestTime, 'updating', _sentTime, _requestTime);

    _Network.plotDataDay(_token, _site, reqFromDate, _resolution, _plotDataSuccess);
  };
  var clickNextDay = () => {
    var datePlusOne = _dateTimeMsec + _msecInOneDay;
    if (datePlusOne > _MyDateTime.now()) {
      console.log("clickNextDay: can't go beyond today!");
      return;
    }
    _dateTimeMsec = datePlusOne;
    clickToday();
  };

  var _plotDataSuccess = (result) => { // (result,status,xhr)
    _serverTime = _MyDateTime.now();
    _Doc.updateServerTime( _MyDateTime.toISOString(_serverTime) );
    _updateDelta( _Doc.updateServerDelayTime, 'waiting', _serverTime, _sentTime);

    _data = result; _dataValid = true;
    _Mychart.setPlotData(_data, {text:'production', stepSize: _chartStepSize, yMax: _chartYMax, scalePower10: _dataScalePower10, doAxes: true});
    _Mychart.show();
    console.log("_data", _data);
    // _data = JSON.stringify(_data,null,'\t');
    // _Doc.updateData(_data);
  };

  var startXhrCallBack = (lastXhrSentTime, info) => {
    _lastSentTime = _sentTime;
    _lastSentText = _sentText;

    _sentTime = _MyDateTime.now();
    _sentText = info.fromDate + " " + info.resolution;

    _Doc.updateLastSentTime( _MyDateTime.toISOString(_lastSentTime) );
    _Doc.updateLastSentURL(_lastSentText);
    _Doc.updateSentTime( _MyDateTime.toISOString(_sentTime) );
    _Doc.updateSentURL(_sentText);

    _updateDelta( _Doc.updateDeltaSentRequestTime, 'updating', _sentTime, _requestTime);
    _updateDelta( _Doc.updateDeltaSentTimes, 'unavailable', _sentTime, _lastSentTime);
    _updateDelta( _Doc.updateServerDelayTime, 'waiting', _serverTime, _sentTime);

    console.log("Controller: startXhrCallBack "+_MyDateTime.toISOString(lastXhrSentTime)+" "+info.fromDate+' '+info.resolution);
  };

  var _updateDelta = (updateFunction, lessThanZeroText, laterTime, earlierTime) => {
    if (typeof earlierTime === "boolean" || typeof laterTime === "boolean") return;
    var delta = laterTime - earlierTime;
    var text = delta < 0 ? '('+lessThanZeroText+')': delta + "ms";
    updateFunction( text );
  };

  return {
    init: init,
    clickLogin: clickLogin,
    clickSelectSite: clickSelectSite,
    changeDelay: changeDelay,
    clickScaleDown: clickScaleDown,
    clickScaleUp: clickScaleUp,
    clickPrevDay: clickPrevDay,
    clickToday: clickToday,
    clickNextDay: clickNextDay,
    startXhrCallBack: startXhrCallBack
  };

})();