(function (window, $) {
    "use strict";

    /**************************************************************

    Script		: Ukitu - SlideNav
    Authors		: Matt Robinson

    **************************************************************/

    var MMSlideNav = window["MMSlideNav"] = function (options) {

        var self = this;

        // Constants
        self.OPEN = 'open';
        self.CLOSED = 'closed';

        // Private vars
        var _useTransforms;
        var _inverseOpenWidth;

        var _container;

        var _appWrapper;
        var _viewWrapper;

        var _wrapperTransition;
        var _containerTransition;

        var state;

        // Options
        var getOptions = function () {

            var options = {
                openWidth: '260px',
                transitionDuration: 0.5
            };

            return options;
        };

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            _useTransforms = uk.utils.css3.useTransitions() && uk.utils.css3.useTransforms();

            if (self.options.openWidth.indexOf('%') >= 0 || self.options.openWidth.indexOf('em') >= 0 || self.options.openWidth.indexOf('px') >= 0) {

                _inverseOpenWidth = '-' + self.options.openWidth;
            }
            else {
                _inverseOpenWidth = self.options.openWidth * -1;
            }

            _container = $('[data-slide-nav]');

            if (_container.length > 0) {

                build();
                addEvents();
            }
        };

        // Private Functions
        var build = function () {

            _container.css({
                'position': 'fixed',
                'top': 0,
                'width': self.options.openWidth,
                'height': '100%',
                'overflow': 'hidden',
                'z-index': 0
            });

            if ($('[data-slide-nav-activator]').length == 0) {
                // TODO: Add tab...
            }

            _appWrapper = $('[data-app-wrapper]');
            $('[data-view-wrapper], [data-header], [data-footer]').wrapAll('<div data-content-wrapper />');

            _viewWrapper = $('[data-content-wrapper]');

            _appWrapper.css({
                'overflow': 'hidden'
            });

            _viewWrapper.css({
                'position': 'relative',
                'left': 0,
                'width': '100%',
                'overflow': 'hidden',
                'z-index': 1
            });

            self.close();

            if (_useTransforms) {

                _wrapperTransition = String(uk.utils.css3.getTransformStyle() + ' ' + self.options.transitionDuration + 's ease-in-out 0s');
                _containerTransition = String(uk.utils.css3.getTransformStyle() + ' ' + self.options.transitionDuration + 's ease-in-out 0s');

                setTransitions();
            }
        };

        var addEvents = function () {

            uk.events.addViewManagerEvent('viewbeforeload', function () {
                if (state == self.OPEN) self.close();
            });

            $(document).on('tap', '[data-slide-nav-activator]', function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                self.toggle();
            });

            _appWrapper.on('swipe', function (evt) {

                if ((evt.swipeDirection == 'left') && (state == self.OPEN)) {
                    self.close();
                }
                else if ((evt.swipeDirection == 'right') && (state == self.CLOSED)) {
                    self.open();
                }
            });
        };

        var setTransitions = function () {

            var wrapperTransObj = {};
            wrapperTransObj[uk.utils.css3.getTransitionStyle()] = _wrapperTransition;

            var containerTransObj = {};
            containerTransObj[uk.utils.css3.getTransitionStyle()] = _containerTransition;

            _viewWrapper.css(wrapperTransObj);
            _container.css(containerTransObj);

            _viewWrapper[0].offsetWidth;
            _container[0].offsetWidth;
        };

        var clearTransitions = function () {

            var transObj = {};
            transObj[uk.utils.css3.getTransitionStyle()] = 'none';

            _viewWrapper.css(transObj);
            _container.css(transObj);

            _viewWrapper[0].offsetWidth;
            _container[0].offsetWidth;
        };

        // Public Functions
        self.open = function () {

            state = self.OPEN;

            var viewWrapperTrans = _useTransforms ? uk.utils.css3.getTransform('translateX(' + self.options.openWidth.toString() + ')') : { 'left': self.options.openWidth.toString() };
            var containerTrans = _useTransforms ? uk.utils.css3.getTransform('translateX(0)') : { 'left': 0 };

            if (_useTransforms) {

                _viewWrapper.css(viewWrapperTrans);
                _container.css(containerTrans);
            }
            else {

                _viewWrapper.animate(viewWrapperTrans, self.options.transitionDuration * 1000);
                _container.animate(containerTrans, self.options.transitionDuration * 1000);
            }
        };

        self.close = function () {

            state = self.CLOSED;
 
            var viewWrapperTrans = _useTransforms ? uk.utils.css3.getTransform('translateX(0)') : { 'left': 0 };
            var containerTrans = _useTransforms ? uk.utils.css3.getTransform('translateX(' + _inverseOpenWidth.toString() + ')') : { 'left': _inverseOpenWidth.toString() };

            if (_useTransforms) {

                _viewWrapper.css(viewWrapperTrans);
                _container.css(containerTrans);
            }
            else {

                _viewWrapper.animate(viewWrapperTrans, self.options.transitionDuration * 1000);
                _container.animate(containerTrans, self.options.transitionDuration * 1000);
            }
        };

        self.toggle = function () {

            if (state == self.OPEN) {
                self.close();
            }
            else {
                self.open();
            }
        };
    };

}(window, jQuery));