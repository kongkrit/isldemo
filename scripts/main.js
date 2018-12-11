"use strict";

var Doc, Network, MyDateTime, Controller, Mychart;

$(document).ready(function(){
  // Doc interface init
  Doc.init({ // jQuery objects
      // view
      token: $("#tokenValue"),
      siteList: $("#siteList"), siteInfoText: $("#siteInfoText"),
      delayDisplay: $("#delayDisplay"),

      requestTime: $("#requestTime"), requestURL: $("#requestURL"),
      deltaSentRequestTime: $("#deltaSentRequestTime"),
      sentTime: $("#sentTime"), sentURL: $("#sentURL"),
      deltaSentTimes: $("#deltaSentTimes"),
      lastSentTime: $("#lastSentTime"), lastSentURL: $("#lastSentURL"),
      serverDelayTime: $("#serverDelayTime"), serverTime: $("#serverTime"),

      scaleDisplay: $("#scaleDisplay"),
      dateDisplay: $("#dateDisplay"), data: $("#divData"),

      // view sections
      loginSection: $("#loginSection"),
      siteSelectorSection: $("#siteSelectorSection"),
      siteInfoSection: $("#siteInfoSection"),
      dataSection: $("#dataSection"),

      // inputs
      delay: $("#delay"),
      username: $("#username"), password: $("#password"),
      buttonLogin: $("#buttonLogin"),
      buttonSelectSite: $("#buttonSelectSite"),
      buttonPrevDay: $("#buttonPrevDay"), buttonToday: $("#buttonToday"), buttonNextDay: $("#buttonNextDay"),
      buttonScaleDown: $("#buttonScaleDown"), buttonScaleUp: $("#buttonScaleUp")
    },
    { // callbacks
      clickLogin: Controller.clickLogin,
      clickSelectSite: Controller.clickSelectSite,
      changeDelay: Controller.changeDelay,
      clickPrevDay: Controller.clickPrevDay,
      clickToday: Controller.clickToday,
      clickNextDay: Controller.clickNextDay,
      clickScaleDown: Controller.clickScaleDown,
      clickScaleUp: Controller.clickScaleUp
  });
  // Network init
  Network.init({startXhrCallback: Controller.startXhrCallBack});
  // MyDateTime init
  MyDateTime.init();
  // Mychart init
  Mychart.init({ctx:$("#chart0")});
  // Controller init
  Controller.init(Doc, Network, MyDateTime, Mychart);

});
