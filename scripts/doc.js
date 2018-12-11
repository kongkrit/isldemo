"use strict";

var Doc = (function() {
  // local
  var _JQ;
  var _callbacks;

  var init = (JQ, callbacks) => {

    _JQ = {};

    // views
    _JQ.token = JQ.token;
    _JQ.siteList = JQ.siteList;
    _JQ.siteInfoText = JQ.siteInfoText;
    _JQ.delayDisplay = JQ.delayDisplay;

    _JQ.requestTime = JQ.requestTime; _JQ.requestURL = JQ.requestURL;
    _JQ.deltaSentRequestTime = JQ.deltaSentRequestTime;
    _JQ.sentTime = JQ.sentTime; _JQ.sentURL = JQ.sentURL;
    _JQ.deltaSentTimes = JQ.deltaSentTimes;
    _JQ.lastSentTime = JQ.lastSentTime; _JQ.lastSentURL = JQ.lastSentURL;
    _JQ.serverDelayTime = JQ.serverDelayTime; _JQ.serverTime = JQ.serverTime;

    _JQ.scaleDisplay = JQ.scaleDisplay;
    _JQ.dateDisplay = JQ.dateDisplay; _JQ.data = JQ.data;

    // view sections
    _JQ.loginSection = JQ.loginSection;
    _JQ.siteSelectorSection = JQ.siteSelectorSection;
    _JQ.siteInfoSection = JQ.siteInfoSection;
    _JQ.dataSection = JQ.dataSection;

    // inputs
    _JQ.delay = JQ.delay;
    _JQ.username = JQ.username; _JQ.password = JQ.password;
    _JQ.buttonLogin = JQ.buttonLogin;
    _JQ.buttonSelectSite = JQ.buttonSelectSite;
    _JQ.buttonPrevDay = JQ.buttonPrevDay;
    _JQ.buttonToday = JQ.buttonToday;
    _JQ.buttonNextDay = JQ.buttonNextDay;
    _JQ.buttonScaleDown = JQ.buttonScaleDown; _JQ.buttonScaleUp = JQ.buttonScaleUp;

    // input callbacks
    _callbacks = {};
    _callbacks.clickLogin = callbacks.clickLogin;
    _callbacks.clickSelectSite = callbacks.clickSelectSite;
    _callbacks.changeDelay = callbacks.changeDelay;
    _callbacks.clickPrevDay = callbacks.clickPrevDay;
    _callbacks.clickToday = callbacks.clickToday;
    _callbacks.clickNextDay = callbacks.clickNextDay;
    _callbacks.clickScaleDown = callbacks.clickScaleDown;
    _callbacks.clickScaleUp = callbacks.clickScaleUp;

    // bind callback functions
    _JQ.buttonLogin.click(function() { _callbacks.clickLogin(); });
    _JQ.buttonSelectSite.click(function() { _callbacks.clickSelectSite(); });
    _JQ.delay.change(function() { _callbacks.changeDelay(); });
    _JQ.buttonPrevDay.click(function() { _callbacks.clickPrevDay(); });
    _JQ.buttonToday.click(function() { _callbacks.clickToday(); });
    _JQ.buttonNextDay.click(function() { _callbacks.clickNextDay(); });
    _JQ.buttonScaleDown.click(function() { _callbacks.clickScaleDown(); });
    _JQ.buttonScaleUp.click(function() { _callbacks.clickScaleUp(); });

    // highlight key parameters
    _JQ.delayDisplay.css('background-color','#ffff80');
    _JQ.deltaSentTimes.css('background-color','#ffff80');
  };

  // inputs methods

  var delay = () => { return _JQ.delay.val(); };
  var username = () => { return _JQ.username.val(); };
  var password = () => { return _JQ.password.val(); };
  var site = () => { return _JQ.siteList.val(); };

  // view methods

  var updateToken = (token) => { _JQ.token.html(token.substr(0,16)+"..."+token.substr(token.length-16)); };
  var updateSiteList = (siteList, selectedSite) => {
    var optionHTML = "";
    var i, matchPos;
    var selectedText;

    var upperSelectedSite = selectedSite.toUpperCase();
    var foundMatch = false;
    for (matchPos = 0; matchPos < siteList.length; matchPos++) {
      if (upperSelectedSite === siteList[matchPos].toUpperCase()) {
        foundMatch = true; break;
      }
    }

    for (i = 0; i < siteList.length; i++) {
      selectedText = (foundMatch && i === matchPos)? ' selected="selected"' : '';
      optionHTML += '<option'+selectedText+'>'+siteList[i]+"</option>";
    }
    _JQ.siteList.html(optionHTML);
  };

  var updateSiteInfoText = (username, site, codString, stepSize, yMax) => {
    _JQ.siteInfoText.html("username:<b>"+username+"</b> site:<b>"+site+"</b> COD:<b>"+codString.substr(0,10)+"</b> stepSize: <b>"+stepSize+"</b>w(h) yMax: <b>"+yMax+"</b>w(h)");
  };
  var updateDelayDisplay = (delayMsec) => {
    _JQ.delayDisplay.html("min delay between xhr plotData requests: "+delayMsec+"ms");
  };

  var updateRequestTime = (text) => { _JQ.requestTime.html(text); };
  var updateRequestURL = (url) => { _JQ.requestURL.html(url); };
  var updateDeltaSentRequestTime = (text) => { _JQ.deltaSentRequestTime.html(text); };
  var updateSentTime = (text) => { _JQ.sentTime.html(text); };
  var updateSentURL = (url) => { _JQ.sentURL.html(url); };
  var updateDeltaSentTimes = (text) => { _JQ.deltaSentTimes.html(text); };
  var updateLastSentTime = (text) => { _JQ.lastSentTime.html(text); };
  var updateLastSentURL = (url) => { _JQ.lastSentURL.html(url); };
  var updateServerDelayTime = (text) => { _JQ.serverDelayTime.html(text); };
  var updateServerTime = (text) => { _JQ.serverTime.html(text); };

  var updateScaleDisplay = (text) => { _JQ.scaleDisplay.html(text); };
  var updateDate = (dateTimeText) => { _JQ.dateDisplay.html(dateTimeText); };
  var updateData = (data) => {
    if (typeof data !== "string") data = JSON.stringify(data);
    _JQ.data.html(data); //_JQ.data.html(encodeURIComponent(data));
  };

  // show+hide sections

  var hideLoginSection = () => { _JQ.loginSection.hide(); };
  var showSiteInfoSection = () => { _JQ.siteInfoSection.show(); };
  var hideSiteInfoSection = () => { _JQ.siteInfoSection.hide(); };
  var showSiteSelectorSection = () => { _JQ.siteSelectorSection.show(); };
  var hideSiteSelectorSection = () => { _JQ.siteSelectorSection.hide(); };
  var showDataSection = () => { _JQ.dataSection.show(); };
  var hideDataSection = () => { _JQ.dataSection.hide(); };
  var hideRawData = () => { _JQ.data.hide(); };

  return {
    init: init,
    // inputs methods
    delay: delay,
    username: username,
    password: password,
    site: site,
    // view methods
    updateSiteList: updateSiteList,
    updateDelayDisplay: updateDelayDisplay,
    updateToken: updateToken,
    updateSiteInfoText: updateSiteInfoText,

    updateRequestTime: updateRequestTime,
    updateRequestURL: updateRequestURL,
    updateDeltaSentRequestTime: updateDeltaSentRequestTime,
    updateSentTime: updateSentTime,
    updateSentURL: updateSentURL,
    updateDeltaSentTimes: updateDeltaSentTimes,
    updateLastSentTime: updateLastSentTime,
    updateLastSentURL: updateLastSentURL,
    updateServerDelayTime: updateServerDelayTime,
    updateServerTime: updateServerTime,

    updateScaleDisplay: updateScaleDisplay,
    updateDate: updateDate,
    updateData: updateData,
    // show+hide document sections
    hideLoginSection: hideLoginSection,
    showSiteInfoSection: showSiteInfoSection,
    hideSiteInfoSection: hideSiteInfoSection,
    showSiteSelectorSection: showSiteSelectorSection,
    hideSiteSelectorSection: hideSiteSelectorSection,
    showDataSection: showDataSection,
    hideDataSection: hideDataSection,
    hideRawData: hideRawData
  };

})();