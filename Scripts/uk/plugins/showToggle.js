(function ($) {

    "use strict";

    /**************************************************************

    Script		: ShowToggle
    Authors		: Matt Robinson

    **************************************************************/

    var ShowToggle = window["ShowToggle"] = function (container, options) {

        var self = this;

        // Private vars
        var _container;
        var _mask;
        var _port;
        var _portContainer;

        var _visible;
        var _grabPos;
        var _showDim;
        var _toggleHandle;

        var _dragging = false;

        var _startPos = {
            x: 0,
            y: 0
        };

        var _endPos = {
            x: 0,
            y: 0
        };

        // Options
        var getOptions = function () {

            var options = {
                direction: 'down',
                hideText: 'Hide',
                showText: 'Show',
                zIndex: 1,
                showHideSpeed: 0.5,
                enableHandle: true,
                altToggleButton: null
            };

            return options;
        };

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            _container = container;
            _visible = true;
            _grabPos = 0;
            _showDim = 0;

            _startPos = {
                x: 0,
                y: 0
            };
            _endPos = {
                x: 0,
                y: 0
            };

            build();
            addEvents();

            hide();
        };

        // Private Functions
        var build = function () {

            if (_container.attr('data-show-direction')) self.options.direction = _container.attr('data-show-direction');

            _showDim = ((self.options.direction == 'up') || (self.options.direction == 'down')) ? _container.outerHeight() : _container.outerWidth();

            _container.wrap('<div data-show-mask />');
            _mask = _container.parent('[data-show-mask]');

            _mask.append('<div style="height: 0px; clear: both;"/>');

            _mask.wrap('<div data-show-port />');
            _port = _mask.parent('[data-show-port]');

            _port.wrap('<div data-port-container />');
            _portContainer = _port.parent('[data-port-container]');

            _portContainer.css({
                'position': 'relative',
                'z-index': self.options.zIndex
            });

            _port.css({
                'position': 'relative',
                'width': '100%'
            });

            _mask.css({
                'overflow': 'hidden'
            });

            _container.css({
                'position': 'relative'
            });

            if (self.options.enableHandle) {

                if (self.options.direction == 'down' || self.options.direction == 'right') {
                    _port.append('<a href="#" data-show-toggle-button>' + self.options.showText + '</a>');
                }
                else {
                    _port.prepend('<a href="#" data-show-toggle-button>' + self.options.showText + '</a>');
                }

                _toggleHandle = $(_port.find('[data-show-toggle-button]')[0]);

                _toggleHandle.css({
                    'z-index': self.options.zIndex + 1
                });

                switch (self.options.direction) {
                    case 'left':
                        _mask.css('float', 'left');
                        _toggleHandle.css('float', 'left');
                        break;
                    case 'right':
                        _mask.css('float', 'left');
                        _toggleHandle.css('float', 'left');
                        break;
                    default: // do nothing
                        break;
                }

                _toggleHandleDimensions = {
                    width: _toggleHandle.width(),
                    height: _toggleHandle.height()
                }
            }

            if (self.options.altToggleButton) {

                self.options.altToggleButton.css('cursor', 'pointer');
            }
        };

        var addEvents = function () {

            if (_toggleHandle) {

                if (uk.utils.detect.touch()) {

                    _toggleHandle.on('touchstart', startDrag);
                    _toggleHandle.on('touchmove', drag);
                    _toggleHandle.on('touchend', endDrag);
                }
                else {

                    _toggleHandle.on('tap', toggleVisibility);

                    /*_toggleHandle.on('mousedown', startDrag);
                    _toggleHandle.on('mouseup', endDrag);
                    $(document).on('mousemove', drag);*/
                }
            }

            if (self.options.altToggleButton) {

                self.options.altToggleButton.on('tap', toggleVisibility);
            }
        };

        var setTransitions = function () {

            var transition = String('all ' + self.options.showHideSpeed + 's ease-out');

            uk.utils.css3.setTransitions(_port, transition);
            uk.utils.css3.setTransitions(_mask, transition);
            uk.utils.css3.setTransitions(_container, transition);
        };

        var clearTransitions = function () {

            uk.utils.css3.clearTransitions(_port, transition);
            uk.utils.css3.clearTransitions(_mask, transition);
            uk.utils.css3.clearTransitions(_container, transition);
        };

        var startDrag = function (evt) {

            evt.preventDefault();

            _startPos = {
                x: evt.pageX,
                y: evt.pageY
            }

            clearTransitions();

            switch (self.options.direction) {
                case 'left': _grabPos = evt.pageX - (_toggleHandle.offset().left) - _toggleHandleDimensions.width;
                    break;
                case 'right': _grabPos = evt.pageX - _toggleHandle.offset().left;
                    break;
                case 'up': _grabPos = evt.pageY - (_toggleHandle.offset().top) - _toggleHandleDimensions.height;
                    break;
                case 'down': _grabPos = evt.pageY - _toggleHandle.offset().top;
                    break;
                default: uk.utils.log('ERROR: The direction "' + self.options.direction + '" is not supported.');
                    break;
            }

            _dragging = true;
        };

        var endDrag = function (evt) {

            _dragging = false;

            switch (self.options.direction) {
                case 'left':
                    if (_endPos.x < _startPos.x) self.show();
                    else self.hide();
                    break;
                case 'right':
                    if (_endPos.x > _startPos.x) self.show();
                    else self.hide();
                    break;
                case 'up':
                    if (_endPos.y < _startPos.y) self.show();
                    else self.hide();
                    break;
                case 'down':
                    if (_endPos.y > _startPos.y) self.show();
                    else self.hide();
                    break;
                default: alert('ERROR: The direction "' + self.options.direction + '" is not supported.');
                    break;
            }

            _endPos = {
                x: 0,
                y: 0
            }

        };

        var drag = function (evt) {

            var pos;

            if (_dragging) {

                _endPos = {
                    x: evt.pageX,
                    y: evt.pageY
                }

                switch (self.options.direction) {
                    case 'left': pos = evt.pageX - (_portContainer.offset().left + _portContainer.width()) - _grabPos;
                        break;
                    case 'right': pos = evt.pageX - _portContainer.offset().left - _grabPos;
                        break;
                    case 'up': pos = evt.pageY - (_portContainer.offset().top + _portContainer.height()) - _grabPos;
                        break;
                    case 'down': pos = evt.pageY - _portContainer.offset().top - _grabPos;
                        break;
                    default: uk.utils.log('ERROR: The direction "' + self.options.direction + '" is not supported.');
                        break;
                }

                movePanel(pos);
            }
        };

        var movePanel = function (pos) {

            var containerWidth = _container.outerWidth();
            var containerHeight = _container.outerHeight();

            if (self.options.direction == "up" || self.options.direction == "left") pos = pos * -1;

            if (pos < 0) pos = 0;

            if (self.options.direction == "left" || self.options.direction == "right") {
                if (pos > containerWidth) pos = containerWidth;
            }
            else {
                if (pos > containerHeight) pos = containerHeight;
            }

            switch (self.options.direction) {
                case 'down':
                    _mask.css('height', pos);
                    _container.css('top', (0 - containerHeight) + pos);
                    break;
                case 'up':
                    _mask.css('height', pos);
                    _port.css('bottom', 0);
                    break;
                case 'right':
                    _mask.css('width', pos);
                    _container.css('left', (0 - containerWidth) + pos);
                    break;
                case 'left':
                    _port.css('right', 0);
                    _mask.css('width', pos);
                    break;
                default: uk.utils.log('ERROR: The direction "' + self.options.direction + '" is not supported.');
                    break;
            }
        };

        var toggleVisibility = function (evt) {

            if (evt) evt.preventDefault();

            if (_visible) {
                self.hide();
            }
            else {
                self.show();
            }
        };

        var animatePanel = function (containerObj, maskObj, portObj) {

            if (uk.utils.css3.detectProperty('transition')) {

                _container.css(containerObj);
                _mask.css(maskObj);
                _port.css(portObj);
            }
            else {

                if (getObjectLength(containerObj) > 0) {
                    _container.stop();
                    _container.animate(containerObj, self.options.showHideSpeed * 1000);
                }

                if (getObjectLength(maskObj) > 0) {
                    _mask.stop();
                    _mask.animate(maskObj, self.options.showHideSpeed * 1000);
                }

                if (getObjectLength(portObj) > 0) {
                    _port.stop();
                    _port.animate(portObj, self.options.showHideSpeed * 1000);
                }
            }
        };

        var getObjectLength = function (obj) {

            if (Object.keys) {

                return Object.keys(obj).length;
            }
            else {

                var count = 0;

                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        count++;
                    }
                }

                return count;
            }
        };

        // Public Functions
        self.show = function () {

            if (!_visible) {

                _visible = true;

                if (uk.utils.css3.detectProperty('transition')) setTransitions();

                if (self.options.enableHandle) _toggleHandle.text(self.options.hideText);

                var containerObj = {};
                var maskObj = {};
                var portObj = {};

                switch (self.options.direction) {
                    case 'down':
                        containerObj.top = 0;
                        maskObj.height = _showDim;
                        break;
                    case 'up':
                        portObj.bottom = 0;
                        maskObj.height = _showDim;
                        break;
                    case 'left':
                        portObj.right = 0;
                        maskObj.width = _showDim;
                        break;
                    case 'right':
                        containerObj.left = 0;
                        maskObj.width = _showDim;
                        break;
                    default: uk.utils.log('ERROR: The direction "' + self.options.direction + '" is not supported.');
                        break;
                };

                animatePanel(containerObj, maskObj, portObj);

            }
        };

        self.hide = function () {

            if (_visible) {

                _visible = false;

                if (uk.utils.css3.detectProperty('transition')) setTransitions();

                if (self.options.enableHandle) _toggleHandle.text(self.options.showText);

                var showDim = ((self.options.direction == 'up') || (self.options.direction == 'down')) ? 0 - _container.outerHeight() : 0 - _showDim;

                var containerObj = {};
                var maskObj = {};
                var portObj = {};

                switch (self.options.direction) {
                    case 'down':
                        containerObj.top = showDim;
                        maskObj.height = 0;
                        break;
                    case 'up':
                        portObj.bottom = 0;
                        maskObj.height = 0;
                        break;
                    case 'left':
                        portObj.right = 0;
                        maskObj.width = 1;
                        break;
                    case 'right':
                        maskObj.width = 1;
                        containerObj.left = showDim + 1;
                        break;
                    default: uk.utils.log('ERROR: The direction "' + self.options.direction + '" is not supported.');
                        break;
                };

                animatePanel(containerObj, maskObj, portObj);

            }
        };

        self.init();
    };

} (jQuery));