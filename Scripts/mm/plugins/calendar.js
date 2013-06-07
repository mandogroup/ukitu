(function ($) {

    "use strict";

    /**************************************************************

    Script		: Calendar
    Version		: 1.0
    Authors		: Matt Robinson

    **************************************************************/

    var Calendar = window["Calendar"] = function (container, options) {

        this.getOptions = function () {

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

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.container = container;
            this.dateField = container.find('input');
            this.label = container.find('label');

            this.currentDate = null;
            this.currentDay = null;
            this.currentMonth = null;
            this.currentYear = null;

            this.dayArr = [
				{ name: 'Sunday', shortName: 'Sun' },
				{ name: 'Monday', shortName: 'Mon' },
				{ name: 'Tuesday', shortName: 'Tues' },
				{ name: 'Wednesday', shortName: 'Weds' },
				{ name: 'Thursday', shortName: 'Thur' },
				{ name: 'Friday', shortName: 'Fri' },
				{ name: 'Saturday', shortName: 'Sat' }
			];

            this.monthArr = [
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

            this.build();
            this.addEvents();

            if (this.options.setInitialDate) {
				this.setInitialDate();
			}
            else { 
				this.dateField.val('');
				this.dateField.change();
			}
        };

        this.build = function () {

            this.dateField.css('display', 'none');
            this.label.css('display', 'none');

            var elemArr = new Array();

            if (this.options.includeDayName) {

                this.container.append('<div data-calendar-elem="dayname"><a href="#" data-next>Next Day</a><span></span><a href="#" data-prev>Previous Day</a></div>');
                this.dayName = $(this.container.find('[data-calendar-elem="dayname"]')[0]);
                this.dayNameText = $(this.dayName.find('span')[0]);
                this.dayNamePrev = $(this.dayName.find('[data-prev]')[0]);
                this.dayNameNext = $(this.dayName.find('[data-next]')[0]);

                elemArr.push(this.dayName);
            }

            if (this.options.includeDay) {

                this.container.append('<div data-calendar-elem="day"><a href="#" data-next>Next Day</a><span></span><a href="#" data-prev>Previous Day</a></div>');
                this.day = $(this.container.find('[data-calendar-elem="day"]')[0]);
                this.dayText = $(this.day.find('span')[0]);
                this.dayPrev = $(this.day.find('[data-prev]')[0]);
                this.dayNext = $(this.day.find('[data-next]')[0]);

                elemArr.push(this.day);
            }

            this.container.append('<div data-calendar-elem="month"><a href="#" data-next>Next Month</a><span></span><a href="#" data-prev>Previous Month</a></div>');
            this.month = $(this.container.find('[data-calendar-elem="month"]')[0]);
            this.monthText = $(this.month.find('span')[0]);
            this.monthPrev = $(this.month.find('[data-prev]')[0]);
            this.monthNext = $(this.month.find('[data-next]')[0]);

            elemArr.push(this.month);

            if (this.options.includeYear) {

                this.container.append('<div data-calendar-elem="year"><a href="#" data-next>Next Year</a><span></span><a href="#" data-prev>Previous Year</a></div>');
                this.year = $(this.container.find('[data-calendar-elem="year"]')[0]);
                this.yearText = $(this.year.find('span')[0]);
                this.yearPrev = $(this.year.find('[data-prev]')[0]);
                this.yearNext = $(this.year.find('[data-next]')[0]);

                elemArr.push(this.year);
            }

            $(elemArr).css({
                float: 'left',
                width: (100 / elemArr.length) + '%'
            });

            this.dateField.on('change', function (evt) {

                evt.preventDefault();

                if (this.dateField.val() && this.dateField.val() != '') {
                    this.setCurrentDate(this.dateField.val());
                } else {
					this.resetDateField();
                }

            } .bind(this));
        };

        this.addEvents = function () {

            if (this.options.includeDayName) {

                this.dayNamePrev.on('tap', function (evt) { evt.preventDefault(); this.adjustDay(-1); } .bind(this));
                this.dayNameNext.on('tap', function (evt) { evt.preventDefault(); this.adjustDay(1); } .bind(this));

                if (mm.utils.detect.touch()) this.dayNameText.on('swipe', function (evt) { this.adjustDay(this.getAdjustment(evt.swipeDirection)); } .bind(this));
            }

            if (this.options.includeDay) {
                this.dayPrev.on('tap', function (evt) { evt.preventDefault(); this.adjustDay(-1); } .bind(this));
                this.dayNext.on('tap', function (evt) { evt.preventDefault(); this.adjustDay(1); } .bind(this));

                if (mm.utils.detect.touch()) this.dayText.on('swipe', function (evt) { this.adjustDay(this.getAdjustment(evt.swipeDirection)); }.bind(this));
            }

            this.monthPrev.on('tap', function (evt) { evt.preventDefault(); this.adjustMonth(-1); } .bind(this));
            this.monthNext.on('tap', function (evt) { evt.preventDefault(); this.adjustMonth(1); } .bind(this));

            if (mm.utils.detect.touch()) this.monthText.on('swipe', function (evt) { this.adjustMonth(this.getAdjustment(evt.swipeDirection)); }.bind(this));

            if (this.options.includeYear) {
                this.yearPrev.on('tap', function (evt) { evt.preventDefault(); this.adjustYear(-1); } .bind(this));
                this.yearNext.on('tap', function (evt) { evt.preventDefault(); this.adjustYear(1); } .bind(this));

                if (mm.utils.detect.touch()) this.yearText.on('swipe', function (evt) { this.adjustYear(this.getAdjustment(evt.swipeDirection)); }.bind(this));
            }
        };

        this.getAdjustment = function (swipeDirection) {

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

        this.setInitialDate = function () {

            if (this.options.defaultDate) {

                if (this.options.defaultDate == 'today') this.options.defaultDate = this.getDefaultDate();
                this.setCurrentDate(this.options.defaultDate);
            }
            else if (this.dateField.val()) {
                this.setCurrentDate(this.dateField.val());
            }
            else {
                this.setCurrentDate(this.getDefaultDate());
            }

            this.setDateField(true);
        }

        this.setCurrentDate = function (dateObj) {

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

            this.currentDate = date;

            this.currentDay = this.currentDate.getDate();
            this.currentDayName = this.currentDate.getDay();
            this.currentYear = this.currentDate.getFullYear();
            this.currentMonth = this.currentDate.getMonth();

            this.setDateDisplay();
        };

        this.setDateField = function (cancelChange) {

            this.dateField.val(this.currentDay + '/' + (this.currentMonth + 1) + '/' + this.currentYear);
            if (!cancelChange) this.dateField.change();
        };

        this.resetDateField = function () {

            if (this.dayNameText) if (this.dayNameText) this.dayNameText.text('Day');
            if (this.dayText) if (this.dayText) this.dayText.text('Day');
            if (this.monthText) if (this.monthText) this.monthText.text('Month');
            if (this.yearText) if (this.yearText) this.yearText.text('Year');
        };

        this.setDateDisplay = function () {

            if (this.dayNameText) {
                if (this.options.useShortDayName) this.dayNameText.text(this.dayArr[this.currentDayName].shortName);
                else this.dayNameText.text(this.dayArr[this.currentDayName].name);
            }

            if (this.dayText) if (this.dayText) this.dayText.text(this.currentDay);

            if (this.monthText) {
                if (this.options.useShortMonthName) this.monthText.text(this.monthArr[this.currentMonth].shortName);
                else this.monthText.text(this.monthArr[this.currentMonth].name);
            }

            if (this.yearText) this.yearText.text(this.currentYear);
        };

        this.adjustDay = function (adjustment) {

            if (this.currentDate) {

                var currentDay = this.currentDate.getDate();
                currentDay += adjustment;

                this.currentDate.setDate(currentDay);

                this.setCurrentDate(this.currentDate);
                this.setDateField();
            }
            else {
                this.setInitialDate();
            }
        };

        this.adjustMonth = function (adjustment) {

            if (this.currentDate) {

                var currentMonth = this.currentDate.getMonth();
                currentMonth += adjustment;

                this.currentDate.setMonth(currentMonth);

                this.setCurrentDate(this.currentDate);
                this.setDateField();
            }
            else {
                this.setInitialDate();
            }
        };

        this.adjustYear = function (adjustment) {

            if (this.currentDate) {

                var currentYear = this.currentDate.getFullYear();
                currentYear += adjustment;

                this.currentDate.setFullYear(currentYear);

                this.setCurrentDate(this.currentDate);
                this.setDateField();
            }
            else {
                this.setInitialDate();
            }
        };

        this.clearDate = function () {

            this.dateField.val(null);
            this.dateField.change();
        };

        this.getDefaultDate = function () {

            var date = new Date();

            if (!this.options.includeDayName && !this.options.includeDay) {
                date.setDate(1);
            }

            return date;
        };

        this.init();

    };

} (jQuery));