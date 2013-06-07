(function ($) {

    "use strict";

    /**************************************************************

    Script		: Calendar
    Authors		: Matt Robinson

    **************************************************************/

    var Calendar = window["Calendar"] = function (container, options) {

        var self = this;

        // Private vars
        var _container;
        var _dateField;
        var _label;

        var _currentDate;
        var _currentDay;
        var _currentDayName;
        var _currentMonth;
        var _currentYear;

        var _dayArr;
        var _monthArr;

        var _dayName;
        var _dayNameText;
        var _dayNamePrev;
        var _dayNameNext;

        var _day;
        var _dayText;
        var _dayPrev;
        var _dayNext;

        var _month;
        var _monthText;
        var _monthPrev;
        var _monthNext;

        var _year;
        var _yearText;
        var _yearPrev;
        var _yearNext;

        // Options
        var getOptions = function () {

            var options = {
                includeDayName: true,
                includeDay: true,
                includeYear: true,
                useShortDayName: true,
                useShortMonthName: true,
                //defaultDate: '1/12/2012' // DD/MM/YYYY
                //defaultDate: 'today' // DD/MM/YYYY
                defaultDate: null,
                setInitialDate: false
            };

            return options;
        };

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            _container = container;
            _dateField = container.find('input');
            _label = container.find('label');

            _currentDate = null;
            _currentDay = null;
            _currentMonth = null;
            _currentYear = null;

            _dayArr = [
				{ name: 'Sunday', shortName: 'Sun' },
				{ name: 'Monday', shortName: 'Mon' },
				{ name: 'Tuesday', shortName: 'Tues' },
				{ name: 'Wednesday', shortName: 'Weds' },
				{ name: 'Thursday', shortName: 'Thur' },
				{ name: 'Friday', shortName: 'Fri' },
				{ name: 'Saturday', shortName: 'Sat' }
			];

            _monthArr = [
				{ name: 'January', shortName: 'Jan' },
				{ name: 'February', shortName: 'Feb' },
				{ name: 'March', shortName: 'Mar' },
				{ name: 'April', shortName: 'Apr' },
				{ name: 'May', shortName: 'May' },
                { name: 'June', shortName: 'Jun' },
				{ name: 'July', shortName: 'Jul' },
				{ name: 'August', shortName: 'Aug' },
				{ name: 'September', shortName: 'Sept' },
				{ name: 'October', shortName: 'Oct' },
				{ name: 'November', shortName: 'Nov' },
				{ name: 'December', shortName: 'Dec' }
			];

            build();
            addEvents();

            if (self.options.setInitialDate) {
				setInitialDate();
			}
            else { 
				_dateField.val('');
				_dateField.change();
			}
        };

        // Private Functions
        var build = function () {

            _dateField.css('display', 'none');
            _label.css('display', 'none');

            var elemArr = new Array();

            if (self.options.includeDayName) {

                _container.append('<div data-calendar-elem="dayname"><a href="#" data-next>Next Day</a><span></span><a href="#" data-prev>Previous Day</a></div>');
                _dayName = $(_container.find('[data-calendar-elem="dayname"]')[0]);
                _dayNameText = $(_dayName.find('span')[0]);
                _dayNamePrev = $(_dayName.find('[data-prev]')[0]);
                _dayNameNext = $(_dayName.find('[data-next]')[0]);

                elemArr.push(_dayName);
            }

            if (self.options.includeDay) {

                _container.append('<div data-calendar-elem="day"><a href="#" data-next>Next Day</a><span></span><a href="#" data-prev>Previous Day</a></div>');
                _day = $(_container.find('[data-calendar-elem="day"]')[0]);
                _dayText = $(_day.find('span')[0]);
                _dayPrev = $(_day.find('[data-prev]')[0]);
                _dayNext = $(_day.find('[data-next]')[0]);

                elemArr.push(_day);
            }

            _container.append('<div data-calendar-elem="month"><a href="#" data-next>Next Month</a><span></span><a href="#" data-prev>Previous Month</a></div>');
            _month = $(_container.find('[data-calendar-elem="month"]')[0]);
            _monthText = $(_month.find('span')[0]);
            _monthPrev = $(_month.find('[data-prev]')[0]);
            _monthNext = $(_month.find('[data-next]')[0]);

            elemArr.push(_month);

            if (self.options.includeYear) {

                _container.append('<div data-calendar-elem="year"><a href="#" data-next>Next Year</a><span></span><a href="#" data-prev>Previous Year</a></div>');
                _year = $(_container.find('[data-calendar-elem="year"]')[0]);
                _yearText = $(_year.find('span')[0]);
                _yearPrev = $(_year.find('[data-prev]')[0]);
                _yearNext = $(_year.find('[data-next]')[0]);

                elemArr.push(_year);
            }

            $(elemArr).css({
                float: 'left',
                width: (100 / elemArr.length) + '%'
            });

            _dateField.on('change', function (evt) {

                evt.preventDefault();

                if (_dateField.val() && _dateField.val() != '') {
                    setCurrentDate(_dateField.val());
                } else {
                    resetDateField();
                }

            } );
        };

        var addEvents = function () {

            if (self.options.includeDayName) {

                _dayNamePrev.on('tap', function (evt) { evt.preventDefault(); adjustDay(-1); } );
                _dayNameNext.on('tap', function (evt) { evt.preventDefault(); adjustDay(1); } );

                if (uk.utils.detect.touch()) _dayNameText.on('swipe', function (evt) { adjustDay(getAdjustment(evt.swipeDirection)); });
            }

            if (self.options.includeDay) {
                _dayPrev.on('tap', function (evt) { evt.preventDefault(); adjustDay(-1); });
                _dayNext.on('tap', function (evt) { evt.preventDefault(); adjustDay(1); });

                if (uk.utils.detect.touch()) _dayText.on('swipe', function (evt) { adjustDay(getAdjustment(evt.swipeDirection)); });
            }

            _monthPrev.on('tap', function (evt) { evt.preventDefault(); adjustMonth(-1); });
            _monthNext.on('tap', function (evt) { evt.preventDefault(); adjustMonth(1); });

            if (uk.utils.detect.touch()) _monthText.on('swipe', function (evt) { adjustMonth(getAdjustment(evt.swipeDirection)); });

            if (self.options.includeYear) {
                _yearPrev.on('tap', function (evt) { evt.preventDefault(); adjustYear(-1); });
                _yearNext.on('tap', function (evt) { evt.preventDefault(); adjustYear(1); });

                if (uk.utils.detect.touch()) _yearText.on('swipe', function (evt) { adjustYear(getAdjustment(evt.swipeDirection)); });
            }
        };

        var resetDateField = function () {

            if (_dayNameText) if (_dayNameText) _dayNameText.text('Day');
            if (_dayText) if (_dayText) _dayText.text('Day');
            if (_monthText) if (_monthText) _monthText.text('Month');
            if (_yearText) if (_yearText) _yearText.text('Year');
        };

        var adjustDay = function (adjustment) {

            if (_currentDate) {

                var currentDay = _currentDate.getDate();
                currentDay += adjustment;

                _currentDate.setDate(currentDay);

                setCurrentDate(_currentDate);
                setDateField();
            }
            else {
                setInitialDate();
            }
        };

        var adjustMonth = function (adjustment) {

            if (_currentDate) {

                var currentMonth = _currentDate.getMonth();
                currentMonth += adjustment;

                _currentDate.setMonth(currentMonth);

                setCurrentDate(_currentDate);
                setDateField();
            }
            else {
                setInitialDate();
            }
        };

        var adjustYear = function (adjustment) {

            if (_currentDate) {

                var currentYear = _currentDate.getFullYear();
                currentYear += adjustment;

                _currentDate.setFullYear(currentYear);

                setCurrentDate(_currentDate);
                setDateField();
            }
            else {
                setInitialDate();
            }
        };

        var clearDate = function () {

            _dateField.val(null);
            _dateField.change();
        };

        var getDefaultDate = function () {

            var date = new Date();

            if (!self.options.includeDayName && !self.options.includeDay) {
                date.setDate(1);
            }

            return date;
        };

        var getAdjustment = function (swipeDirection) {

            switch (swipeDirection) {
                case 'up': return 1;
                    break;
                case 'right': return 1;
                    break;
                case 'down': return -1;
                    break;
                case 'left': return -1;
                    break;
                default: // do nothing. 
                    break;
            };
        }

        var setInitialDate = function () {

            if (self.options.defaultDate) {

                if (self.options.defaultDate == 'today') self.options.defaultDate = getDefaultDate();
                setCurrentDate(self.options.defaultDate);
            }
            else if (_dateField.val()) {
                setCurrentDate(_dateField.val());
            }
            else {
                setCurrentDate(getDefaultDate());
            }

            setDateField(true);
        }

        var setCurrentDate = function (dateObj) {

            var date = new Date();

            if (typeof dateObj === "string") {

                if (dateObj != 'today') {
                    var dateArr = dateObj.split('/');

                    date.setFullYear(dateArr[2], dateArr[1] - 1, dateArr[0]);
                }
                else if (!dateObj) {

                    date.setFullYear(1970, 0, 1);
                }
            }
            else if (date instanceof Date) {

                date = dateObj;
            }

            _currentDate = date;

            _currentDay = _currentDate.getDate();
            _currentDayName = _currentDate.getDay();
            _currentYear = _currentDate.getFullYear();
            _currentMonth = _currentDate.getMonth();

            setDateDisplay();
        };

        var setDateField = function (cancelChange) {

            _dateField.val(_currentDay + '/' + (_currentMonth + 1) + '/' + _currentYear);
            if (!cancelChange) _dateField.change();
        };

        var setDateDisplay = function () {

            if (_dayNameText) {
                if (self.options.useShortDayName) _dayNameText.text(_dayArr[_currentDayName].shortName);
                else _dayNameText.text(_dayArr[_currentDayName].name);
            }

            if (_dayText) if (_dayText) _dayText.text(_currentDay);

            if (_monthText) {
                if (self.options.useShortMonthName) _monthText.text(_monthArr[_currentMonth].shortName);
                else _monthText.text(_monthArr[_currentMonth].name);
            }

            if (_yearText) _yearText.text(_currentYear);
        };

        self.init();
    };

} (jQuery));