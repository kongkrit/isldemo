"use strict";

var Mychart = (() => {

  var _ctx;
  var _chart;
  var _chartObject;

  var _chartStartTime;
  var _chartEndTime;

  var _numberShiftAmount;
  var _numberDecimalPoints;
  var _numberUnits;

  var _shownChart;

  var init = (obj) => {
    _ctx = obj.ctx;

    _chart = {};
    _chart.type = 'line';
    _chart.data = {};
    _chart.data.labels = 'foo';
    _chart.data.datasets = [];
    // need addDataSets

    _chart.options = {};
    _chart.options.animation = { duration: 250 };
    _chart.options.tooltips ={};
    _chart.options.tooltips.callbacks = {};
    _chart.options.tooltips.callbacks.label = _dataPointLabelFunc;
    _chart.options.tooltips.callbacks.title = _dataPointTitleFunc;

    _chart.options.scales = {};

    _addNumberPrototypes();
    _shownChart = false;
  };

  var _calcNumberFormat = (max) => {
    if      (max <= 1000)           { _numberShiftAmount = 0; _numberDecimalPoints = 0; _numberUnits =  ""; }
    else if (max <= 10000)          { _numberShiftAmount = 3; _numberDecimalPoints = 2; _numberUnits = "k"; }
    else if (max <= 100000)         { _numberShiftAmount = 3; _numberDecimalPoints = 1; _numberUnits = "k"; }
    else if (max <= 1000000)        { _numberShiftAmount = 3; _numberDecimalPoints = 0; _numberUnits = "k"; }
    else if (max <= 10000000)       { _numberShiftAmount = 6; _numberDecimalPoints = 2; _numberUnits = "M"; }
    else if (max <= 100000000)      { _numberShiftAmount = 6; _numberDecimalPoints = 1; _numberUnits = "M"; }
    else if (max <= 1000000000)     { _numberShiftAmount = 6; _numberDecimalPoints = 0; _numberUnits = "M"; }
    else if (max <= 10000000000)    { _numberShiftAmount = 9; _numberDecimalPoints = 2; _numberUnits = "G"; }
    else if (max <= 100000000000)   { _numberShiftAmount = 9; _numberDecimalPoints = 1; _numberUnits = "G"; }
    else if (max <= 1000000000000)  { _numberShiftAmount = 9; _numberDecimalPoints = 0; _numberUnits = "G"; }
    else if (max <= 10000000000000) { _numberShiftAmount = 9; _numberDecimalPoints = 2; _numberUnits = "T"; }
    else if (max <= 100000000000000){ _numberShiftAmount = 9; _numberDecimalPoints = 1; _numberUnits = "T"; }
    else                            { _numberShiftAmount = 9; _numberDecimalPoints = 0; _numberUnits = "T"; }
  };

  var _toCustomString = (number) => { return number.scaleToString(_numberShiftAmount, _numberDecimalPoints); };
  var _toCustomStringWithSymbol = (number) => { return _toCustomString(number)+_numberUnits; };

  var _addNumberPrototypes = () => {

    Number.prototype.scaleToString = // jshint ignore:line

    /**
     * base10 right shift a number and round to specified decimal points
     * @param {number} shiftAmount   - The amount of digits to shift left, 0=no change in avalue, 1=divide by 10, 2=divide by 100, ...
     * @param {number} decimalPoints - Number of decimal points to have\
     * @return {string} The number formatted in {string} as specified by the inputs
     * @example
     * 123678.scaleToString(3,1); // returns "123.7"
     * @example
     * 123678.scaleToString(3,0); // returns "124"
     */

    function scaleToString (shiftAmount, decimalPoints) {
      var m = Math.pow(10, -(shiftAmount-decimalPoints));
      var s = Math.round(this *m).toString();
      var n = decimalPoints-s.length+1;
      for (var i=0; i < n; i++) s = "0"+s;
      return decimalPoints <1? s : s.slice(0,-decimalPoints)+'.'+s.substr(-decimalPoints);
    };

    Number.prototype.scalePower10 = // jshint ignore:line
    function scalePower10 (scale) { return parseInt(this.scaleToString(-scale,0)); };
  };

  var _yAxesLabelFunc = _toCustomString;

  var _dataPointLabelFunc = function(item) { //}, data) {
    return ': ' + _toCustomStringWithSymbol(item.yLabel) + 'W'; // item.xLabel is also available
  };

  var _dataPointTitleFunc = function(item) {
    // Pick first xLabel for now
    var title = '';

    if (item.length > 0) {
      if (item[0].xLabel) title = 'Production: '+ item[0].xLabel;
    }
    return title;
  };

  var _newChart = () => { _chartObject = new Chart (_ctx, _chart); _shownChart = true; };
  var getChart = () => { return _chart; };
  var _update = () => { _chartObject.update(); };
  var show = () => { if (_shownChart) _update(); else _newChart(); };

  var _parsePlotData = (plotData, options) => {
    var data = [];
    var obj;
    if (!Array.isArray(plotData)) return data;
    if (plotData.length < 2) return data;

    _chartStartTime = moment(plotData[0].timeServer).startOf('date').add(5, 'h');
    _chartEndTime   = moment(plotData[0].timeServer).startOf('date').add(20, 'h');

    if (options.doAxes) {
      var xObj = {};
      xObj.type = 'time';
      xObj.time = {};
      xObj.time.displayFormats = {};
      xObj.time.displayFormats.hour = 'HH:mm';
      //xAxesObj.time.displayFormats.minute = 'HH:mm';
      xObj.time.min = _chartStartTime;
      xObj.time.max = _chartEndTime;
      xObj.distribution = 'linear';
      _chart.options.scales.xAxes = [];
      _chart.options.scales.xAxes.push(xObj);
    }

    for (var i = 0; i < plotData.length-1; i++) {
      obj = {};
      obj.x = moment(plotData[i].timeServer);
      if ("scalePower10" in options) {
        obj.y = plotData[i].totalExportWInterval.scalePower10(options.scalePower10);
      } else {
        obj.y = plotData[i].totalExportWInterval;
      }
      if (obj.y >= 0 && obj.x >= _chartStartTime && obj.x <= _chartEndTime) data.push(obj);
    }
    if (data.length < 1) data.push({}); // make sure the data object is not empty
    return data;
  };

  var setPlotData = (plotData, options) => {
    var data = _parsePlotData(plotData, options);
    if (data.length < 1) return;

    var yMax;
    if ("scalePower10" in options) yMax = options.yMax.scalePower10(options.scalePower10);
    else yMax = options.yMax;
    _calcNumberFormat(yMax);

    if (options.doAxes) {
      // configure y-axis
      var yObj = {};

      yObj.scaleLabel = {};
//      yObj.scaleLabel.display = true;
//      yObj.scaleLabel.labelString = 'Production ('+_numberUnits+'W)';
      yObj.scaleLabel.fontSize = 14;

      yObj.ticks = {};
      yObj.ticks.min = 0;
      if ("scalePower10" in options) {
        yObj.ticks.stepSize = options.stepSize.scalePower10(options.scalePower10);
        yObj.ticks.max = options.yMax.scalePower10(options.scalePower10);
      } else {
        yObj.ticks.stepSize = options.stepSize;
        yObj.ticks.max = options.yMax;
      }
      yObj.ticks.callback = _yAxesLabelFunc;

      _chart.options.scales.yAxes = [];
      _chart.options.scales.yAxes.push(yObj);
    }

    var obj = {};
    if ("text" in options) obj.label = options.text + ' (' +_numberUnits +'W)' ;
    obj.backgroundColor = 'rgba(0,128,255,0.5)'; // fill color under the line
    obj.borderColor = 'rgba(0,128,255,1.0)'; // color of the line
    obj.fill = false; // fill under the line?
    obj.data = data;

    _chart.data.datasets = [];
    _chart.data.datasets.push(obj);
  };

  return {
    init: init,
    getChart: getChart,
    show: show,
    setPlotData: setPlotData
  };

})();