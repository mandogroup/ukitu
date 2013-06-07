(function ($) {

    "use strict";

    /**************************************************************

    Script		: ShowToggle
    Version		: 1.2
    Authors		: Matt Robinson

    **************************************************************/

    var ShowToggle = window["ShowToggle"] = function (container, options) {

        this.getOptions = function () {

            var options = {
                direction: 'down',
                hideText: 'Hide',
                showText: 'Show',
                zIndex: 1,
                showHideSpeed: 0.5,
                showHideEase: 'linear',
                showDim: 'auto',
                hideDim: 'auto',
                enableHandle: true,
                altToggleButton: null,
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.container = container;
            this.visible = true;
            this.grabPos = 0;
            this.showDim = 0;
            this.hideDim = 0;

            this.startPos = {
                x: 0,
                y: 0
            };
            this.endPos = {
                x: 0,
                y: 0
            };

            this.build();
            this.addEvents();

            this.hide();
        };

        this.build = function () {

            if (this.container.attr('data-show-direction')) this.options.direction = this.container.attr('data-show-direction');

            if (this.options.showDim == 'auto') {
                this.showDim = ((this.options.direction == 'up') || (this.options.direction == 'down')) ? this.container.outerHeight() : this.container.outerWidth();
            }
            else {
                this.showDim = Number(this.options.showDim);
            }

            this.hideDim = (this.options.hideDim == 'auto') ? this.hideDim : Number(this.options.hideDim);

            this.container.wrap('<div data-show-mask />');
            this.mask = this.container.parent('[data-show-mask]');

            this.mask.append('<div style="height: 0px; clear: both;"/>');

            this.mask.wrap('<div data-show-port />');
            this.port = this.mask.parent('[data-show-port]');

            this.port.wrap('<div data-port-container />');
            this.portContainer = this.port.parent('[data-port-container]');

            this.portContainer.css({
                'position': 'relative',
                'z-index': this.options.zIndex
            });

            this.port.css({
                'position': 'relative',
                'width': '100%'
            });

            this.mask.css({
                'overflow': 'hidden'
            });

            this.container.css({
                'position': 'relative'
            });

            if (this.options.enableHandle) {

                if (this.options.direction == 'down' || this.options.direction == 'right') {
                    this.port.append('<a href="#" data-show-toggle-button>' + this.options.showText + '</a>');
                }
                else {
                    this.port.prepend('<a href="#" data-show-toggle-button>' + this.options.showText + '</a>');
                }

                this.toggleHandle = $(this.port.find('[data-show-toggle-button]')[0]);

                this.toggleHandle.css({
                    'z-index': this.options.zIndex + 1
                });

                switch (this.options.direction) {
                    case 'left':
                        this.mask.css('float', 'left');
                        this.toggleHandle.css('float', 'left');
                        break;
                    case 'right':
                        this.mask.css('float', 'left');
                        this.toggleHandle.css('float', 'left');
                        break;
                    default: // do nothing
                        break;
                }

                this.toggleHandleDimensions = {
                    width: this.toggleHandle.width(),
                    height: this.toggleHandle.height()
                }
            }

            if (this.options.altToggleButton) {

                this.options.altToggleButton.css('cursor', 'pointer');
            }
        };

        this.addEvents = function () {

            if (this.toggleHandle) {

                if (Modernizr.touch) {

                    this.toggleHandle[0].addEventListener('touchstart', this.startDrag.bind(this), false);
                    this.toggleHandle[0].addEventListener('touchmove', this.drag.bind(this), false);
                    this.toggleHandle[0].addEventListener('touchend', this.endDrag.bind(this), false);
                }
                else {

                    this.toggleHandle.on('tap', this.toggleVisibility.bind(this));

                    /*this.toggleHandle.on('mousedown', this.startDrag.bind(this));
                    this.toggleHandle.on('mouseup', this.endDrag.bind(this));
                    $(document).on('mousemove', this.drag.bind(this));*/
                }
            }

            if (this.options.altToggleButton) {

                this.options.altToggleButton.on('tap', this.toggleVisibility.bind(this));
            }
        };

        this.startDrag = function (evt) {

            evt.preventDefault();

            this.startPos = {
                x: evt.pageX,
                y: evt.pageY
            }

            this.clearTransitions();

            switch (this.options.direction) {
                case 'left': this.grabPos = evt.pageX - (this.toggleHandle.offset().left) - this.toggleHandleDimensions.width;
                    break;
                case 'right': this.grabPos = evt.pageX - this.toggleHandle.offset().left;
                    break;
                case 'up': this.grabPos = evt.pageY - (this.toggleHandle.offset().top) - this.toggleHandleDimensions.height;
                    break;
                case 'down': this.grabPos = evt.pageY - this.toggleHandle.offset().top;
                    break;
                default: mm.utils.log('ERROR: The direction "' + this.options.direction + '" is not supported.');
                    break;
            }

            this.dragging = true;
        };

        this.endDrag = function (evt) {

            this.dragging = false;

            switch (this.options.direction) {
                case 'left':
                    if (this.endPos.x < this.startPos.x) this.show();
                    else this.hide();
                    break;
                case 'right':
                    if (this.endPos.x > this.startPos.x) this.show();
                    else this.hide();
                    break;
                case 'up':
                    if (this.endPos.y < this.startPos.y) this.show();
                    else this.hide();
                    break;
                case 'down':
                    if (this.endPos.y > this.startPos.y) this.show();
                    else this.hide();
                    break;
                default: alert('ERROR: The direction "' + this.options.direction + '" is not supported.');
                    break;
            }

            this.endPos = {
                x: 0,
                y: 0
            }
        };

        this.drag = function (evt) {

            var pos;

            if (this.dragging) {

                this.endPos = {
                    x: evt.pageX,
                    y: evt.pageY
                }

                switch (this.options.direction) {
                    case 'left': pos = evt.pageX - (this.portContainer.offset().left + this.portContainer.width()) - this.grabPos;
                        break;
                    case 'right': pos = evt.pageX - this.portContainer.offset().left - this.grabPos;
                        break;
                    case 'up': pos = evt.pageY - (this.portContainer.offset().top + this.portContainer.height()) - this.grabPos;
                        break;
                    case 'down': pos = evt.pageY - this.portContainer.offset().top - this.grabPos;
                        break;
                    default: mm.utils.log('ERROR: The direction "' + this.options.direction + '" is not supported.');
                        break;
                }

                this.movePanel(pos);
            }
        };

        this.movePanel = function (pos) {

            var containerWidth = this.container.outerWidth();
            var containerHeight = this.container.outerHeight();

            if (this.options.direction == "up" || this.options.direction == "left") pos = pos * -1;

            if (pos < 0) pos = 0;

            if (this.options.direction == "left" || this.options.direction == "right") {
                if (pos > containerWidth) pos = containerWidth;
            }
            else {
                if (pos > containerHeight) pos = containerHeight;
            }

            switch (this.options.direction) {
                case 'down':
                    this.mask.css('height', pos);
                    this.applyTransform(this.container, { 'top': (0 - containerHeight) + pos });
                    //this.container.css('top', (0 - containerHeight) + pos);
                    break;
                case 'up':
                    this.mask.css('height', pos);
                    this.applyTransform(this.port, { 'bottom': 0 });
                    //this.port.css('bottom', 0);
                    break;
                case 'right':
                    this.mask.css('width', pos);
                    this.applyTransform(this.container, { 'left': (0 - containerWidth) + pos });
                    //this.container.css('left', (0 - containerWidth) + pos);
                    break;
                case 'left':
                    this.applyTransform(this.port, { 'right': 0 });
                    //this.port.css('right', 0);
                    this.mask.css('width', pos);
                    break;
                default: mm.utils.log('ERROR: The direction "' + this.options.direction + '" is not supported.');
                    break;
            }
        };

        this.toggleVisibility = function (evt) {

            if (evt) evt.preventDefault();

            if (this.visible) {
                this.hide();
            }
            else {
                this.show();
            }
        };

        this.show = function () {

            if (!this.visible) {

                this.visible = true;

                if (Modernizr.csstransitions) this.setTransitions();

                if (this.options.enableHandle) this.toggleHandle.text(this.options.hideText);

                var containerObj = {};
                var maskObj = {};
                var portObj = {};

                switch (this.options.direction) {
                    case 'down':
                        containerObj.top = 0;
                        maskObj.height = this.showDim;
                        break;
                    case 'up':
                        portObj.bottom = 0;
                        maskObj.height = this.showDim;
                        break;
                    case 'left':
                        portObj.right = 0;
                        maskObj.width = this.showDim;
                        break;
                    case 'right':
                        containerObj.left = 0;
						maskObj.width = this.showDim;
                        break;
                    default: mm.utils.log('ERROR: The direction "' + this.options.direction + '" is not supported.');
                        break;
                };

                this.animatePanel(containerObj, maskObj, portObj);

            }
        };

        this.hide = function () {

            if (this.visible) {

                this.visible = false;

                if (Modernizr.csstransitions) this.setTransitions();

                if (this.options.enableHandle) this.toggleHandle.text(this.options.showText);

                var showDim = ((this.options.direction == 'up') || (this.options.direction == 'down')) ? 0 - this.container.outerHeight() : 0 - this.showDim;

                var containerObj = {};
                var maskObj = {};
                var portObj = {};

                switch (this.options.direction) {
                    case 'down':
                        containerObj.top = showDim + this.hideDim;
                        maskObj.height = this.hideDim;
                        break;
                    case 'up':
                        portObj.bottom = this.hideDim;
                        maskObj.height = this.hideDim;
                        break;
                    case 'left':
                        portObj.right = this.hideDim;
                        maskObj.width = this.hideDim;
                        break;
                    case 'right':
                        maskObj.width = this.hideDim;
                        containerObj.left = showDim + this.hideDim;
                        break;
                    default: mm.utils.log('ERROR: The direction "' + this.options.direction + '" is not supported.');
                        break;
                };

                this.animatePanel(containerObj, maskObj, portObj);
            }
        };

        this.animatePanel = function (containerObj, maskObj, portObj) {

            if (Modernizr.csstransitions) {

                this.applyTransform(this.mask, maskObj);
                this.applyTransform(this.container, containerObj);
                this.applyTransform(this.port, portObj);
            }
            else {

                if (this.getObjectLength(maskObj) > 0) {
                    this.mask.stop();
                    this.mask.animate(maskObj, this.options.showHideSpeed * 1000);
                }

                if (this.getObjectLength(containerObj) > 0) {
                    this.container.stop();
                    this.container.animate(containerObj, this.options.showHideSpeed * 1000);
                }

                if (this.getObjectLength(portObj) > 0) {
                    this.port.stop();
                    this.port.animate(portObj, this.options.showHideSpeed * 1000);
                }
            }
        };

        this.applyTransform = function (elem, transObj) {

            if (Modernizr.csstransforms) {
                
                var translateX = 0;
                var translateY = 0;
                
                if(transObj.left) translateX = transObj.left + 'px';
                if(transObj.right) translateX = transObj.right + 'px';
                if(transObj.top) translateX = transObj.top + 'px';
                if(transObj.bottom) translateX = transObj.bottom + 'px';
                
                var convTransObj = this.getTransform('translate(' + translateX + ', ' + translateY + ')');
                if (transObj.width) convTransObj.width = transObj.width;
                if (transObj.height) convTransObj.height = transObj.height;

                elem.css(convTransObj);
            }
            else {

                elem.css(transObj);
            }
        };

        this.getTransform = function (transform) {

            var transObj = {}
            transObj[mm.utils.css3.getTransformStyle()] = transform;

            return transObj;
        };

        this.setTransitions = function () {

            var transition = String('all ' + this.options.showHideSpeed + 's ' + this.options.showHideEase);

            var transObj = {};
            transObj[mm.utils.css3.getTransitionStyle()] = transition;

            this.port.css(transObj);
            this.mask.css(transObj);
            this.container.css(transObj);

            this.port[0].outerWidth;
            this.mask[0].outerWidth;
            this.container[0].outerWidth;
        };

        this.clearTransitions = function () {

            var transObj = {};
            transObj[mm.utils.css3.getTransitionStyle()] = 'none';

            this.port.css(transObj);
            this.mask.css(transObj);
            this.container.css(transObj);
        };

        this.getObjectLength = function (obj) {

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

        this.init();
    };

} (jQuery));