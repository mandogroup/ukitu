(function ($) {

    "use strict";

    /**************************************************************

    Script		: RangeSelector
    Authors		: Matt Robinson

    **************************************************************/

    var RangeSelector = window["RangeSelector"] = function (containerElem, options) {

        var self = this;

        // Private vars
        var _container;
        var _wrapper;
        var _area;
        var _track;
        var _bar;

        var _direction;

        var _minField;
        var _maxField;

        var _minMarker;
        var _minMarkerTextSpan;
        var _maxMarker;
        var _maxMarkerTextSpan;
        var _intervalMarkers;

        var _rangeSpan;
        var _singlePoint;
        var _singleIntervalWidth;
        var _currentMarker;
        var _built;

        var _dragging = false;

        // Options
        var getOptions = function () {

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

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            _container = containerElem;

            if (!_container.attr('data-range-direction')) {
                _container.attr('data-range-direction', 'horizontal')
            }

            _direction = _container.attr('data-range-direction');

            _minField = _container.find('input[data-min-range]');
            _maxField = _container.find('input[data-max-range]');

            if (_minField.length == 0) self.options.maxOnly = true;

            _minField.data('control', self);
            _maxField.data('control', self);

            if (_minField.val()) self.options.defaultMin = _minField.val();
            if (_maxField.val()) self.options.defaultMax = _maxField.val();

            _minField.val((self.options.defaultMin && (self.options.defaultMin >= self.options.minRange) && (self.options.defaultMin < self.options.maxRange)) ? self.options.defaultMin : self.options.minRange);
            _maxField.val((self.options.defaultMax && (self.options.defaultMax <= self.options.maxRange) && (self.options.defaultMax > self.options.minRange)) ? self.options.defaultMax : self.options.maxRange);

            _minField.change();
            _maxField.change();

            _rangeSpan = (self.options.maxRange - self.options.minRange);
            _singlePoint = 100 / _rangeSpan;
            _built = false;

            build();
            addEvents();

            setRange();
        };

        // Private Functions
        var build = function () {

            _container.append('<div data-range-wrapper></div>');
            _wrapper = $(_container.find('[data-range-wrapper]'));

            _wrapper.append('<div data-range-area></div>');
            _area = $(_wrapper.find('[data-range-area]'));

            _area.append('<div data-range-track></div>');
            _track = $(_area.find('[data-range-track]'));

            _track.append('<div data-range-bar></div>');
            _bar = $(_area.find('[data-range-bar]'));

            if (isHorizontal()) {
                _area.css({ 'float': 'left', 'width': '100%' });
            }
            else {

                _wrapper.css({ 'height': '100%' });
                _track.css({
                    'float': 'left',
                    'width': '100%',
                    'height': '100%'
                });

                if (self.options.showInterval) _area.css({ 'float': 'left', 'width': '50%', 'height': '100%' });
                else _area.css({ 'height': '100%' });
            }

            _bar.css({
                'position': 'relative'
            });

            if (isHorizontal()) {

                _bar.css({
                    'height': (self.options.barSize == 'auto') ? self.options.markerSize : self.options.barSize
                });
            }
            else {

                _bar.css({
                    'width': (self.options.barSize == 'auto') ? '100%' : self.options.barSize
                });
            }

            if (!self.options.maxOnly) {

                _bar.append('<a href="#" data-range-marker="min"><span></span></a>');
                _minMarker = $(_bar.find('[data-range-marker="min"]'));
                _minMarker.css({ 'display': 'block' });
                _minMarkerTextSpan = $(_minMarker.find('span'));

                _minMarker.css({
                    'position': 'absolute',
                    'z-index': 1
                });

                if (isHorizontal()) {

                    _minMarker.css({
                        'left': 0 - (self.options.markerSize / 2),
                        'bottom': 0,
                        'width': self.options.markerSize,
                        'height': '100%'
                    });
                }
                else {

                    _minMarker.css({
                        'right': 0,
                        'bottom': 0 - (self.options.markerSize / 2),
                        'height': self.options.markerSize,
                        'width': '100%'
                    });
                }
            }

            if (isHorizontal()) {
                _bar.append('<a href="#" data-range-marker="max"><span></span></a>');
            }
            else {
                _bar.prepend('<a href="#" data-range-marker="max"><span></span></a>');
            }

            _maxMarker = $(_bar.find('[data-range-marker="max"]'));
            _maxMarker.css({ 'display': 'block' });
            _maxMarkerTextSpan = $(_maxMarker.find('span'));

            _maxMarker.css({
                'position': 'absolute',
                'z-index': 2
            });

            if (isHorizontal()) {

                _maxMarker.css({
                    'right': 0 - (self.options.markerSize / 2),
                    'bottom': 0,
                    'width': self.options.markerSize,
                    'height': '100%'
                });
            }
            else {

                _maxMarker.css({
                    'right': 0,
                    'top': 0 - (self.options.markerSize / 2),
                    'height': self.options.markerSize,
                    'width': '100%'
                });
            }

            if (self.options.showScale) {

                _area.append('<ul data-range-intervals></ul>');
                _intervalMarkers = $(_wrapper.find('ul'));

                _intervalMarkers.css({ 'list-style': 'none' });

                if (isHorizontal()) {
                    _intervalMarkers.css({ 'float': 'left', 'width': '100%' });
                }
                else {
                    _intervalMarkers.css({ 'float': 'left', 'width': '50%', 'height': '100%' });
                    _track.css({ 'width': '50%' });
                }

                var intervals = (self.options.maxRange - self.options.minRange) / self.options.interval;

                var text = '';

                for (var i = 0; i <= intervals; i++) {

                    text = (isHorizontal()) ? (i * self.options.interval) + self.options.minRange : self.options.maxRange - (i * self.options.interval);
                    _intervalMarkers.append('<li>' + text + '</li>');
                };

                _singleIntervalWidth = (100 / (intervals + 1));
                _intervalOffset = _singleIntervalWidth / 2;

                if (isHorizontal()) {

                    _track.css({
                        'margin-left': _intervalOffset + '%',
                        'margin-right': _intervalOffset + '%'
                    });

                    _intervalMarkers.find('li').css({
                        'float': 'left',
                        'text-align': 'center',
                        'width': _singleIntervalWidth + '%'
                    });
                }
                else {

                    _track.css({
                        'height': '100%'
                    });

                    _intervalMarkers.find('li').css({
                        'text-align': 'center',
                        'height': _singleIntervalWidth + '%'
                    });
                }

            }

            _built = true;
        };

        var addEvents = function () {

            if (_minField) {

                _minField.on('change', function (evt) {

                    var value = validateInputRange(_minField.val(), 'min');

                    if (value.valid) setRange();
                    else setMinFieldValue(value.number);

                } );
            }

            if (_maxField) {

                _maxField.on('change', function (evt) {

                    var value = validateInputRange(_maxField.val(), 'max');

                    if (value.valid) setRange();
                    else setMaxFieldValue(value.number);

                } );
            }

            if (!self.options.maxOnly) {

                _minMarker.click(function (evt) { evt.preventDefault() });

                if (uk.utils.detect.touch()) {

                    _minMarker.on('touchstart', function (evt) {
                        startDrag(evt);
                    } );
                }
                else {

                    _minMarker.mousedown(function (evt) {
                        startDrag(evt);
                    } );
                }
            }

            _maxMarker.click(function (evt) { evt.preventDefault() });

            if (uk.utils.detect.touch()) {

                _maxMarker.on('touchstart', function (evt) {
                    startDrag(evt);
                } );
            }
            else {

                _maxMarker.mousedown(function (evt) {
                    startDrag(evt);
                } );
            }

            if (uk.utils.detect.touch()) {

                _area.on('touchend', function (evt) {
                    endDrag(evt);
                } );

                _area.on('touchmove', function (evt) {
                    drag(evt);
                } );
            }
            else {

                _area.mouseup(function (evt) {
                    endDrag(evt);
                } );

                _area.mouseleave(function (evt) {
                    endDrag(evt);
                } );

                _area.mousemove(function (evt) {
                    drag(evt);
                } );
            }
        };

        var update = function (evt) {

            if (_built) setBar();
        };

        var startDrag = function (evt) {

            evt.preventDefault();

            _currentMarker = $(evt.currentTarget);

            setZOrder();

            _dragging = true;

            $(this).trigger('rangechange');
        };

        var drag = function (evt) {

            evt.preventDefault();

            if (uk.utils.detect.touch()) evt = evt.originalEvent.touches[0];

            if (_dragging) {

                var pixelPos = evt.pageX - _track.offset().left;
                var decPos = pixelPos / _track.width();

                if (!isHorizontal()) {

                    pixelPos = evt.pageY - _track.offset().top;
                    decPos = 1 - (pixelPos / _track.height());
                }

                var target = Math.round((decPos * _rangeSpan) + self.options.minRange);

                if (self.options.snapToInterval) {
                    target = Math.round(target / self.options.interval) * self.options.interval;
                }

                //target = validateInputRange(target, _currentMarker.attr('data-range-marker')).number;

                setValue(target, _currentMarker.attr('data-range-marker'));
            }
        };

        var endDrag = function (evt) {

            evt.preventDefault();

            if (_dragging) {

                _dragging = false;

                setRange();

                setZOrder();

                _currentMarker = null;
            }
        };

        var setRange = function () {

            setBar();

            $(this).trigger('rangechanged');
            if (!_dragging) $(this).trigger('rangestatic');
        };

        var setValue = function (target, type) {

            if (type == 'min') {
                _setMinFieldValue(target);
            }
            else if (type == 'max') {
                _setMaxFieldValue(target);
            }

            setBar();
        };

        var validateInputRange = function (number, type) {

            number = Number(number);

            var min = _minField.val();
            var max = _maxField.val();

            var valid = true;

            if (type == 'min') {

                if (self.options.maxOnly) {
                    number = self.options.minRange;
                    //valid = false;
                }
                else if (number > max) {
                    number = max;
                    valid = false;
                }
                else if (number < self.options.minRange) {
                    number = self.options.minRange;
                    valid = false;
                }
            }
            else if (type == 'max') {

                if (self.options.maxOnly) {

                    if (number < self.options.minRange) {
                        number = self.options.minRange;
                        valid = false;
                    }
                    else if (number > self.options.maxRange) {
                        number = self.options.maxRange;
                        valid = false;
                    }
                }
                else if (number < min) {
                    number = min;
                    valid = false;
                }
                else if (number > self.options.maxRange) {
                    number = self.options.maxRange;
                    valid = false;
                }
            }

            return {
                'number': number,
                'valid': valid
            }
        };

        var setMinFieldValue = function (target) {
            _minField.val(Number(target));
            _minField.change();
        };

        var setMaxFieldValue = function (target) {
            _maxField.val(Number(target));
            _maxField.change();
        };

        var setBar = function () {

            var min = (!self.options.maxOnly) ? _minField.val() : self.options.minRange;
            var max = _maxField.val();

            var minPct = (min - self.options.minRange) * _singlePoint;
            var maxPct = (self.options.maxRange - max) * _singlePoint;

            if (isHorizontal()) {

                _bar.css({
                    'margin-left': minPct + '%',
                    'margin-right': maxPct + '%'
                });
            }
            else {

                var barHeight = 100 - maxPct - minPct;
                var conversionFactor = (_track.height() / _track.width());

                _bar.css({
                    'margin-top': (maxPct * conversionFactor) + '%',
                    'margin-bottom': (minPct * conversionFactor) + '%',
                    'height': barHeight + '%'
                });
            }

            if (!self.options.maxOnly) _minMarkerTextSpan.html(min);
            _maxMarkerTextSpan.html(max);

            if (self.options.markersToBestFit) setMarkers(minPct, maxPct);
        };

        var setMarkers = function (minPct, maxPct) {

            minPct /= 100;
            maxPct /= 100;

            var maxOffset = 0 - self.options.markerSize;

            if (isHorizontal()) {

                if (!self.options.maxOnly) {

                    _minMarker.css({
                        'left': maxOffset * minPct
                    });
                }

                _maxMarker.css({
                    'right': maxOffset * maxPct
                });
            }
            else {

                if (!self.options.maxOnly) {

                    _minMarker.css({
                        'bottom': maxOffset * minPct
                    });
                }

                _maxMarker.css({
                    'top': maxOffset * maxPct
                });
            }
        };

        var setZOrder = function () {

            if (!self.options.maxOnly) {

                if (_currentMarker.attr('data-range-marker') == 'max') {
                    _maxMarker.css('z-index', 2);
                    _minMarker.css('z-index', 1);
                }
                else {
                    _minMarker.css('z-index', 2);
                    _maxMarker.css('z-index', 1);
                }
            }

        };

        var isHorizontal = function () {
            if (_direction == "horizontal") return true;
            else return false;
        };

        self.init();
    };

} (jQuery));