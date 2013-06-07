(function ($, Modernizr) {

    "use strict";

    /**************************************************************

    Script		: RangeSelector
    Version		: 1.1
    Authors		: Matt Robinson

    **************************************************************/

    var RangeSelector = window["RangeSelector"] = function (containerElem, options) {

        this.getOptions = function () {

            var options = {
                minRange: 0,
                maxRange: 100,
                defaultMin: null,
                defaultMax: null,
                interval: 10,
                markerSize: 30,
                barSize: 'auto',
                maxOnly: false,
                markersToBestFit: true,
                showScale: true,
                snapToInterval: false
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.container = containerElem;

            if (!this.container.attr('data-range-direction')) {
                this.container.attr('data-range-direction', 'horizontal')
            }

            this.direction = this.container.attr('data-range-direction');

            this.minField = this.container.find('input[data-min-range]');
            this.maxField = this.container.find('input[data-max-range]');

            if (this.minField.length == 0) this.options.maxOnly = true;

            this.minField.data('control', this);
            this.maxField.data('control', this);

            if (this.minField.val()) this.options.defaultMin = this.minField.val();
            if (this.maxField.val()) this.options.defaultMax = this.maxField.val();

            this.minField.val((this.options.defaultMin && (this.options.defaultMin >= this.options.minRange) && (this.options.defaultMin < this.options.maxRange)) ? this.options.defaultMin : this.options.minRange);
            this.maxField.val((this.options.defaultMax && (this.options.defaultMax <= this.options.maxRange) && (this.options.defaultMax > this.options.minRange)) ? this.options.defaultMax : this.options.maxRange);

            this.minField.change();
            this.maxField.change();

            this.rangeSpan = (this.options.maxRange - this.options.minRange);
            this.singlePoint = 100 / this.rangeSpan;
            this.currentMarker;
            this.built = false;

            this.build();
            this.addEvents();

            this.setRange();
        };

        this.build = function () {

            this.container.append('<div data-range-wrapper></div>');
            this.wrapper = $(this.container.find('[data-range-wrapper]'));

            this.wrapper.append('<div data-range-area></div>');
            this.area = $(this.wrapper.find('[data-range-area]'));

            this.area.append('<div data-range-track></div>');
            this.track = $(this.area.find('[data-range-track]'));

            this.track.append('<div data-range-bar></div>');
            this.bar = $(this.area.find('[data-range-bar]'));

            if (this.isHorizontal()) {
                this.area.css({ 'float': 'left', 'width': '100%' });
            }
            else {

                this.wrapper.css({ 'height': '100%' });
                this.track.css({
                    'float': 'left',
                    'width': '100%',
                    'height': '100%'
                });

                if (this.options.showInterval) this.area.css({ 'float': 'left', 'width': '50%', 'height': '100%' });
                else this.area.css({ 'height': '100%' });
            }

            this.bar.css({
                'position': 'relative'
            });

            if (this.isHorizontal()) {

                this.bar.css({
                    'height': (this.options.barSize == 'auto') ? this.options.markerSize : this.options.barSize
                });
            }
            else {

                this.bar.css({
                    'width': (this.options.barSize == 'auto') ? '100%' : this.options.barSize
                });
            }

            if (!this.options.maxOnly) {

                this.bar.append('<a href="#" data-range-marker="min"><span></span></a>');
                this.minMarker = $(this.bar.find('[data-range-marker="min"]'));
                this.minMarker.css({ 'display': 'block' });
                this.minMarkerTextSpan = $(this.minMarker.find('span'));

                this.minMarker.css({
                    'position': 'absolute',
                    'z-index': 1
                });

                if (this.isHorizontal()) {

                    this.minMarker.css({
                        'left': 0 - (this.options.markerSize / 2),
                        'bottom': 0,
                        'width': this.options.markerSize,
                        'height': '100%'
                    });
                }
                else {

                    this.minMarker.css({
                        'right': 0,
                        'bottom': 0 - (this.options.markerSize / 2),
                        'height': this.options.markerSize,
                        'width': '100%'
                    });
                }
            }

            if (this.isHorizontal()) {
                this.bar.append('<a href="#" data-range-marker="max"><span></span></a>');
            }
            else {
                this.bar.prepend('<a href="#" data-range-marker="max"><span></span></a>');
            }

            this.maxMarker = $(this.bar.find('[data-range-marker="max"]'));
            this.maxMarker.css({ 'display': 'block' });
            this.maxMarkerTextSpan = $(this.maxMarker.find('span'));

            this.maxMarker.css({
                'position': 'absolute',
                'z-index': 2
            });

            if (this.isHorizontal()) {

                this.maxMarker.css({
                    'right': 0 - (this.options.markerSize / 2),
                    'bottom': 0,
                    'width': this.options.markerSize,
                    'height': '100%'
                });
            }
            else {

                this.maxMarker.css({
                    'right': 0,
                    'top': 0 - (this.options.markerSize / 2),
                    'height': this.options.markerSize,
                    'width': '100%'
                });
            }

            if (this.options.showScale) {

                this.area.append('<ul data-range-intervals></ul>');
                this.intervalMarkers = $(this.wrapper.find('ul'));

                this.intervalMarkers.css({ 'list-style': 'none' });

                if (this.isHorizontal()) {
                    this.intervalMarkers.css({ 'float': 'left', 'width': '100%' });
                }
                else {
                    this.intervalMarkers.css({ 'float': 'left', 'width': '50%', 'height': '100%' });
                    this.track.css({ 'width': '50%' });
                }

                var intervals = (this.options.maxRange - this.options.minRange) / this.options.interval;

                var text = '';

                for (var i = 0; i <= intervals; i++) {

                    text = (this.isHorizontal()) ? (i * this.options.interval) + this.options.minRange : this.options.maxRange - (i * this.options.interval);
                    this.intervalMarkers.append('<li>' + text + '</li>');
                };

                this.singleIntervalWidth = (100 / (intervals + 1));
                this.intervalOffset = this.singleIntervalWidth / 2;

                if (this.isHorizontal()) {

                    this.track.css({
                        'margin-left': this.intervalOffset + '%',
                        'margin-right': this.intervalOffset + '%'
                    });

                    this.intervalMarkers.find('li').css({
                        'float': 'left',
                        'text-align': 'center',
                        'width': this.singleIntervalWidth + '%'
                    });
                }
                else {

                    this.track.css({
                        'height': '100%'
                    });

                    this.intervalMarkers.find('li').css({
                        'text-align': 'center',
                        'height': this.singleIntervalWidth + '%'
                    });
                }

            }

            this.built = true;
        };

        this.addEvents = function () {

            if (this.minField) {

                this.minField.on('change', function (evt) {

                    //evt.preventDefault();

                    var value = this.validateInputRange(this.minField.val(), 'min');

                    if (value.valid) this.setRange();
                    else this.setMinFieldValue(value.number);

                } .bind(this));
            }

            if (this.maxField) {

                this.maxField.on('change', function (evt) {

                    //evt.preventDefault();

                    var value = this.validateInputRange(this.maxField.val(), 'max');

                    if (value.valid) this.setRange();
                    else this.setMaxFieldValue(value.number);

                } .bind(this));
            }

            if (!this.options.maxOnly) {

                this.minMarker.click(function (evt) { evt.preventDefault() });

                if (Modernizr.touch) {

                    this.minMarker[0].addEventListener('touchstart', function (evt) {
                        this.startDrag(evt);
                    } .bind(this), false);
                }
                else {

                    this.minMarker.mousedown(function (evt) {
                        this.startDrag(evt);
                    } .bind(this));
                }
            }

            this.maxMarker.click(function (evt) { evt.preventDefault() });

            if (Modernizr.touch) {

                this.maxMarker[0].addEventListener('touchstart', function (evt) {
                    this.startDrag(evt);
                } .bind(this), false);
            }
            else {

                this.maxMarker.mousedown(function (evt) {
                    this.startDrag(evt);
                } .bind(this));
            }

            if (Modernizr.touch) {

                this.area[0].addEventListener('touchend', function (evt) {
                    this.endDrag(evt);
                } .bind(this), false);

                this.area[0].addEventListener('touchmove', function (evt) {
                    this.drag(evt);
                } .bind(this), false);
            }
            else {

                this.area.mouseup(function (evt) {
                    this.endDrag(evt);
                } .bind(this));

                this.area.mouseleave(function (evt) {
                    this.endDrag(evt);
                } .bind(this));

                this.area.mousemove(function (evt) {
                    this.drag(evt);
                } .bind(this));
            }
        };

        this.update = function (evt) {

            if (this.built) this.setBar();
        };

        this.startDrag = function (evt) {

            evt.preventDefault();

            this.currentMarker = $(evt.currentTarget);

            this.setZOrder();

            this.dragging = true;

            $(this).trigger('rangechange');
        };

        this.drag = function (evt) {

            evt.preventDefault();

            if (Modernizr.touch) evt = evt.touches[0];

            if (this.dragging) {

                var pixelPos = evt.pageX - this.track.offset().left;
                var decPos = pixelPos / this.track.width();

                if (!this.isHorizontal()) {

                    pixelPos = evt.pageY - this.track.offset().top;
                    decPos = 1 - (pixelPos / this.track.height());
                }

                var target = Math.round((decPos * this.rangeSpan) + this.options.minRange);

                if (this.options.snapToInterval) {
                    target = Math.round(target / this.options.interval) * this.options.interval;
                }

                //target = this.validateInputRange(target, this.currentMarker.attr('data-range-marker')).number;

                this.setValue(target, this.currentMarker.attr('data-range-marker'));
            }
        };

        this.endDrag = function (evt) {

            evt.preventDefault();

            if (this.dragging) {

                this.dragging = false;

                this.setRange();

                this.setZOrder();

                this.currentMarker = null;
            }
        };

        this.setRange = function () {

            this.setBar();

            $(this).trigger('rangechanged');
            if (!this.dragging) $(this).trigger('rangestatic');
        };

        this.setValue = function (target, type) {

            if (type == 'min') {
                this.setMinFieldValue(target);
            }
            else if (type == 'max') {
                this.setMaxFieldValue(target);
            }

            this.setBar();
        };

        this.validateInputRange = function (number, type) {

            number = Number(number);

            var min = this.minField.val();
            var max = this.maxField.val();

            var valid = true;

            if (type == 'min') {

                if (this.options.maxOnly) {
                    number = this.options.minRange;
                    //valid = false;
                }
                else if (number > max) {
                    number = max;
                    valid = false;
                }
                else if (number < this.options.minRange) {
                    number = this.options.minRange;
                    valid = false;
                }
            }
            else if (type == 'max') {

                if (this.options.maxOnly) {

                    if (number < this.options.minRange) {
                        number = this.options.minRange;
                        valid = false;
                    }
                    else if (number > this.options.maxRange) {
                        number = this.options.maxRange;
                        valid = false;
                    }
                }
                else if (number < min) {
                    number = min;
                    valid = false;
                }
                else if (number > this.options.maxRange) {
                    number = this.options.maxRange;
                    valid = false;
                }
            }

            return {
                'number': number,
                'valid': valid
            }
        };

        this.setMinFieldValue = function (target) {
            this.minField.val(Number(target));
            this.minField.change();
        };

        this.setMaxFieldValue = function (target) {
            this.maxField.val(Number(target));
            this.maxField.change();
        };

        this.setBar = function () {

            var min = (!this.options.maxOnly) ? this.minField.val() : this.options.minRange;
            var max = this.maxField.val();

            var minPct = (min - this.options.minRange) * this.singlePoint;
            var maxPct = (this.options.maxRange - max) * this.singlePoint;

            if (this.isHorizontal()) {

                this.bar.css({
                    'margin-left': minPct + '%',
                    'margin-right': maxPct + '%'
                });
            }
            else {

                var barHeight = 100 - maxPct - minPct;
                var conversionFactor = (this.track.height() / this.track.width());

                this.bar.css({
                    'margin-top': (maxPct * conversionFactor) + '%',
                    'margin-bottom': (minPct * conversionFactor) + '%',
                    'height': barHeight + '%'
                });
            }

            if (!this.options.maxOnly) this.minMarkerTextSpan.html(min);
            this.maxMarkerTextSpan.html(max);

            if (this.options.markersToBestFit) this.setMarkers(minPct, maxPct);
        };

        this.setMarkers = function (minPct, maxPct) {

            minPct /= 100;
            maxPct /= 100;

            var maxOffset = 0 - this.options.markerSize;

            if (this.isHorizontal()) {

                if (!this.options.maxOnly) {

                    this.minMarker.css({
                        'left': maxOffset * minPct
                    });
                }

                this.maxMarker.css({
                    'right': maxOffset * maxPct
                });
            }
            else {

                if (!this.options.maxOnly) {

                    this.minMarker.css({
                        'bottom': maxOffset * minPct
                    });
                }

                this.maxMarker.css({
                    'top': maxOffset * maxPct
                });
            }
        };

        this.setZOrder = function () {

            if (!this.options.maxOnly) {

                if (this.currentMarker.attr('data-range-marker') == 'max') {
                    this.maxMarker.css('z-index', 2);
                    this.minMarker.css('z-index', 1);
                }
                else {
                    this.minMarker.css('z-index', 2);
                    this.maxMarker.css('z-index', 1);
                }
            }

        };

        this.isHorizontal = function () {
            if (this.direction == "horizontal") return true;
            else return false;
        };

        this.init();
    };

} (jQuery, Modernizr));