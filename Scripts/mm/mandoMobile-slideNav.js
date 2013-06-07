(function (window, $, Modernizr) {
    "use strict";

    /**************************************************************

    Script		: MandoMobile - SlideNav
    Version		: 1.1
    Authors		: Matt Robinson

    **************************************************************/

    var MMSlideNav = window["MMSlideNav"] = function (options) {

        this.OPEN = 'open';
        this.CLOSED = 'closed';

        this.getOptions = function () {

            var options = {
                openWidth: '260px',
                transitionDuration: 0.5
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.useTransforms = Modernizr.csstransitions && Modernizr.csstransforms;
            this.locked = false;

            if (this.options.openWidth.indexOf('%') >= 0 || this.options.openWidth.indexOf('em') >= 0 || this.options.openWidth.indexOf('px') >= 0) {

                this.inverseOpenWidth = '-' + this.options.openWidth;
            }
            else {
                this.inverseOpenWidth = this.options.openWidth * -1;
            }

            this.container = $('[data-slide-nav]');

            if (this.container.length > 0) {

                this.build();
                this.addEvents();
            }
        };

        this.build = function () {

            this.container.css({
                'position': 'fixed',
                'top': 0,
                'width': this.options.openWidth,
                'height': '100%',
                'overflow': 'hidden',
                'z-index': 0
            });

            if ($('[data-slide-nav-activator]').length == 0) {
                // TODO: Add tab...
            }

            this.activator = $('[data-slide-nav-activator]');

            this.appWrapper = $('[data-app-wrapper]');
            $('[data-view-wrapper], [data-header], [data-footer]').wrapAll('<div data-content-wrapper />');

            this.viewWrapper = $('[data-content-wrapper]');

            this.appWrapper.css({
                'overflow': 'hidden'
            });

            this.viewWrapper.css({
                'position': 'relative',
                'left': 0,
                'width': '100%',
                'overflow': 'hidden',
                'z-index': 1
            });

            this.close();

            if (this.useTransforms) {

                this.transEndEventName = mm.utils.css3.getTransEndEventName();

                this.wrapperTransition = String(mm.utils.css3.getTransformStyle() + ' ' + this.options.transitionDuration + 's ease-in-out 0s');
                this.containerTransition = String(mm.utils.css3.getTransformStyle() + ' ' + this.options.transitionDuration + 's ease-in-out 0s');

                this.setTransitions();
            }
        };

        this.addEvents = function () {

            mm.events.addViewManagerEvent('viewbeforeload', function () {
                if (this.state == this.OPEN) this.close();
            }.bind(this));

            this.activator.on('tap', function (evt) {

                evt.preventDefault();
                evt.stopPropagation();
                this.toggle();
            }.bind(this));

            this.appWrapper.on('swipe', function (evt) {

                if ((evt.swipeDirection == 'left') && (this.state == this.OPEN)) {
                    this.close();
                }
                else if ((evt.swipeDirection == 'right') && (this.state == this.CLOSED)) {
                    this.open();
                }
            } .bind(this));
        };

        this.open = function () {

            if (!this.locked) {

                this.state = this.OPEN;

                var viewWrapperTrans = this.useTransforms ? this.getTransform('translateX(' + this.options.openWidth.toString() + ')') : { 'left': this.options.openWidth.toString() };
                var containerTrans = this.useTransforms ? this.getTransform('translateX(0)') : { 'left': 0 };

                if (this.useTransforms) {

                    this.viewWrapper.css(viewWrapperTrans);
                    this.container.css(containerTrans);
                }
                else {

                    this.viewWrapper.animate(viewWrapperTrans, this.options.transitionDuration * 1000);
                    this.container.animate(containerTrans, this.options.transitionDuration * 1000);
                }

                /*this.viewWrapper.on('swipe', function (evt) {
                    if ((evt.swipeDirection == 'left') && (this.state == this.OPEN)) this.close();
                }.bind(this));*/
            }
        };

        this.close = function () {

            if (!this.locked) {

                this.state = this.CLOSED;

                var viewWrapperTrans = this.useTransforms ? this.getTransform('translateX(0)') : { 'left': 0 };
                var containerTrans = this.useTransforms ? this.getTransform('translateX(' + this.inverseOpenWidth.toString() + ')') : { 'left': this.inverseOpenWidth.toString() };

                if (this.useTransforms) {

                    this.viewWrapper.css(viewWrapperTrans);
                    this.container.css(containerTrans);
                }
                else {

                    this.viewWrapper.animate(viewWrapperTrans, this.options.transitionDuration * 1000);
                    this.container.animate(containerTrans, this.options.transitionDuration * 1000);
                }

                //this.viewWrapper.off('swipe');
            }
        };

        this.toggle = function () {

            if (this.state == this.OPEN) {
                this.close();
            }
            else {
                this.open();
            }
        };

        this.setLock = function (lockState, viewState) {

            if (viewState && (viewState == this.OPEN || viewState == this.CLOSED)) {
                this.state = viewState;
                if (viewState == this.OPEN) this.open();
                else if (viewState == this.CLOSED) this.close();
            }

            this.locked = lockState;
        };

        this.getTransform = function (transform) {

            var transObj = {}
            transObj[mm.utils.css3.getTransformStyle()] = transform;

            return transObj;
        };

        this.setTransitions = function () {

            var wrapperTransObj = {};
            wrapperTransObj[mm.utils.css3.getTransitionStyle()] = this.wrapperTransition;

            var containerTransObj = {};
            containerTransObj[mm.utils.css3.getTransitionStyle()] = this.containerTransition;

            this.viewWrapper.css(wrapperTransObj);
            this.container.css(containerTransObj);

            this.viewWrapper[0].offsetWidth;
            this.container[0].offsetWidth;
        };

        this.clearTransitions = function () {

            var transObj = {};
            transObj[mm.utils.css3.getTransitionStyle()] = 'none';

            this.viewWrapper.css(transObj);
            this.container.css(transObj);

            this.viewWrapper[0].offsetWidth;
            this.container[0].offsetWidth;
        };
    };

}(window, jQuery, Modernizr));