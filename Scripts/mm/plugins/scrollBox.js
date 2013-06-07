(function ($) {
    "use strict";

    /**************************************************************

    Script		: ScrollBox
    Version		: 2.8
    Authors		: Matt Robinson

    **************************************************************/

    var ScrollBox = window["ScrollBox"] = function (targetElem, options) {

        this.getOptions = function () {

            var options = {
                // Basic Settings
                direction: 'vertical',
                directionControls: true,
                portHeight: 'auto',
                portWidth: 'auto',
                contentWidth: 'auto',
                contentHeight: 'auto',
                scrollShift: 20,
                scrollSpeed: 0.5,
                scrollBehaviour: 'tween',
                /* Possible Values: 
                'shift' - simply shifts by the scrollShift in pixels in the given direction. 
                'tween' - tweens in the given direction by the scrollShift in pixels.
                */
                // Advanced Settings
                useParentDimensions: false,
                enableContentDrag: false,
                contentDragInverted: true,
				contentDragElem: $(document),
				contentDragOnChildren: false,
				enableScrollBars: true,
                enableScrollBarDrag: true,
                enableResizeMonitor: true,
                horizontalProps: {
                    altScrollMoreControl: null,
                    altScrollLessControl: null,
                    altScrollTrack: null,
                    altScrollHandle: null
                },
                verticalProps: {
                    altScrollMoreControl: null,
                    altScrollLessControl: null,
                    altScrollTrack: null,
                    altScrollHandle: null
                },
                scrollControlSize: 10,
                scrollBarWeight: 10,
                scrollBoxGutter: 0,
                scrollContentPadding: 0
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.scrollBoxOuter = targetElem;
            this.dragging = false;
            this.contentDragging = false;
            this.grabPos = { x: 0, y: 0 };
            this.pos = { x: 0, y: 0 };
            this.built = false;

            this.previousHeight = 0;
            this.previousWidth = 0;

            if (this.scrollBoxOuter[0]) this.build();
        };

        this.build = function () {

            this.createScrollBox();

            this.horizontalProps = {
                direction: 'horizontal',
                options: this.options.horizontalProps,
                scrollBarTrack: null,
                scrollBarHandle: null,
                scrollBarContainer: null,
                visibleSection: 0
            };

            this.verticalProps = {
                direction: 'vertical',
                options: this.options.verticalProps,
                scrollBarTrack: null,
                scrollBarHandle: null,
                scrollBarContainer: null,
                visibleSection: 0
            };

            if (this.options.enableScrollBars) this.createScrollBars();

            this.resizeElements();

            this.addEvents();

            this.built = true;
        };

        this.createScrollBox = function () {

            var portWidth;
            var portHeight;

            this.scrollBoxOuter.append('<div style="height: 0px; clear: both;"/>');

            this.scrollBoxOuter.wrapInner('<div class="' + this.options.direction + '" data-scroll-box/>');
            this.scrollBoxContent = $(this.scrollBoxOuter.find('[data-scroll-box]')[0]);
            this.scrollBoxContent.wrap('<div data-scroll-port/>');
            this.scrollBoxPort = $(this.scrollBoxOuter.find('[data-scroll-port]')[0]);

            this.controlReduction = (this.options.enableScrollBars && (!this.options.horizontalAltScrollTrack && !this.options.horizontalAltScrollHandle)) ? this.options.scrollBarWeight + this.options.scrollBoxGutter + this.options.scrollContentPadding : 0;

            this.scrollBoxOuter.css({
                'position': 'relative'
            });

            var contentWidth = 0;
            var contentHeight = 0;

            if (this.options.direction == 'both') {

                var widthNumeric = $.isNumeric(this.options.contentWidth);
                var heightNumeric = $.isNumeric(this.options.contentHeight);

                contentWidth = (!widthNumeric) ? this.scrollBoxOuter.outerWidth() : this.options.contentWidth;
                contentHeight = (!heightNumeric) ? this.scrollBoxOuter.outerHeight() : this.options.contentHeight;
            }
            else {
                contentWidth = this.options.contentWidth;
                contentHeight = this.options.contentHeight;
            }

            this.scrollBoxContent.css({
                'position': 'relative',
                'width': contentWidth,
                'height': contentHeight
            });

            // Get numeric values
            contentWidth = this.scrollBoxContent.outerWidth();
            contentHeight = this.scrollBoxContent.outerHeight();

            switch (String(this.options.portWidth)) {
                case 'auto': portWidth = (this.options.direction == 'horizontal' || this.options.direction == 'both') ? 'auto' : this.scrollBoxOuter.outerWidth() - this.controlReduction;
                    break;
                case 'fluid': portWidth = '100%';
                    break;
                default: portWidth = this.options.portWidth;
                    break;
            }

            switch (String(this.options.portHeight)) {
                case 'auto': portHeight = (this.options.direction == 'horizontal' || this.options.direction == 'both') ? 'auto' : this.scrollBoxOuter.outerHeight() - this.controlReduction;
                    break;
                case 'fluid': portHeight = '100%';
                    break;
                default: portHeight = this.options.portHeight;
                    break;
            }

            if ((this.options.direction == 'horizontal') && this.options.enableScrollBars) {

                this.scrollBoxOuter.css({
                    'padding-bottom': this.controlReduction
                });
            }

            this.scrollBoxPort.css('overflow', 'hidden');

            this.scrollBoxPort.css({
                'position': 'relative',
                'width': portWidth,
                'height': portHeight
            });
        };

        this.createScrollBars = function () {

            this.controlWidthModifier = (this.options.directionControls) ? (this.options.scrollControlSize * 2) : 0;

            switch (this.options.direction) {
                case 'horizontal': this.createScrollBar(this.horizontalProps);
                    break;
                case 'vertical': this.createScrollBar(this.verticalProps);
                    break;
                case 'both':
                    this.createScrollBar(this.horizontalProps);
                    this.createScrollBar(this.verticalProps);
                    break;
                default: // Do nothing.
                    break;
            }
        };

        this.createScrollBar = function (props) {

            var portWidth = this.scrollBoxPort.outerWidth();
            var portHeight = this.scrollBoxPort.outerHeight();

            var contentWidth = this.scrollBoxContent.outerWidth();
            var contentHeight = this.scrollBoxContent.outerHeight();

            if (props.options.altScrollTrack && props.options.altScrollHandle) {

                props.scrollBarTrack = props.options.altScrollTrack;
                props.scrollBarHandle = props.options.altScrollHandle;
            }
            else {

                this.scrollBoxOuter.append('<div class="' + props.direction + '" data-scroll-bar data-direction="' + props.direction + '"/>');
                props.scrollBarContainer = $(this.scrollBoxOuter.children('[data-scroll-bar][data-direction='+ props.direction + ']')[0]);

                if (props.direction == 'horizontal') {
                    props.scrollBarContainer.css({
                        'position': 'absolute',
                        'left': 0,
                        'bottom': this.options.scrollBoxGutter,
                        'width': '100%',
                        'height': this.options.scrollBarWeight
                    });
                }
                else {
                    props.scrollBarContainer.css({
                        'position': 'absolute',
                        'right': this.options.scrollBoxGutter,
                        'top': 0,
                        'width': this.options.scrollBarWeight
                    });
                }

                if (this.options.directionControls) {

                    var controlWidth = (props.direction == 'horizontal') ? this.options.scrollControlSize : this.options.scrollBarWeight;
                    var controlHeight = (props.direction == 'horizontal') ? this.options.scrollBarWeight : this.options.scrollControlSize;
                    var controlFloat = (props.direction == 'horizontal') ? 'left' : 'none';

                    var controlStyles =
					{
					    'display': 'block',
					    'width': controlWidth,
					    'height': controlHeight,
					    'float': controlFloat
					}

                    props.scrollBarContainer.append('<a href="#" data-scroll-control="less"/>');
                    props.scrollBarLess = $(props.scrollBarContainer.children('[data-scroll-control="less"]')[0]);
                    props.scrollBarLess.css(controlStyles);
                }

                props.scrollBarContainer.append('<div data-scroll-track/>');
                props.scrollBarTrack = $(props.scrollBarContainer.children('[data-scroll-track]')[0]);

                if (props.direction == 'horizontal') {
                    props.scrollBarTrack.css({
                        'width': portWidth - this.controlWidthModifier,
                        'float': 'left',
                        'height': '100%'
                    });
                }
                else {

                    props.scrollBarTrack.css({
                        'height': portHeight - this.controlWidthModifier
                    });
                }

                if (this.options.directionControls) {
                    props.scrollBarContainer.append('<a href="#" data-scroll-control="more"/>');
                    props.scrollBarMore = $(props.scrollBarContainer.children('[data-scroll-control="more"]')[0]);
                    props.scrollBarMore.css(controlStyles);
                }

                props.scrollBarTrack.append('<div data-scroll-handle/>');
                props.scrollBarHandle = $(props.scrollBarTrack.children('[data-scroll-handle]')[0]);
            }

            props.scrollBarTrack.css({
                'position': 'relative'
            });

            props.scrollBarHandle.css({
                'position': 'absolute',
                'left': 0,
                'top': 0,
                'cursor': ((this.options.enableScrollBarDrag) ? 'pointer' : 'default')
            });
        };

        this.addEvents = function () {

            switch (this.options.direction) {
                case 'horizontal': this.addScrollBarEvents(this.horizontalProps);
                    break;
                case 'vertical': this.addScrollBarEvents(this.verticalProps);
                    break;
                case 'both':
                    this.addScrollBarEvents(this.horizontalProps);
                    this.addScrollBarEvents(this.verticalProps);
                    break;
                default: // Do nothing.
                    break;
            }

            if (mm.utils.detect.touch()) {

                if (this.options.enableContentDrag) {

                    if (this.options.contentDragOnChildren) {

                        this.scrollBoxContent.children().on('touchstart', function (evt) {

                            this.preventDefaultContentDrag(evt);
                            //evt.stopPropagation();

                            evt = evt.originalEvent.touches[0];

                            this.startContentDrag(evt);

                        } .bind(this));
                    }
                    else {

                        this.scrollBoxContent.on('touchstart', function (evt) {

                            this.preventDefaultContentDrag(evt);
                            evt = evt.originalEvent.touches[0];

                            this.startContentDrag(evt);

                        } .bind(this));
                    }

                    this.options.contentDragElem.on('touchmove', function (evt) {

                        this.preventDefaultContentDrag(evt);
                        evt = evt.originalEvent.touches[0];

                        this.drag(evt);

                    } .bind(this));

                    this.options.contentDragElem.on('touchend', function (evt) {

                        this.preventDefaultContentDrag(evt);
                        evt = evt.originalEvent.touches[0];

                        this.endDrag(evt);

                    } .bind(this));
                }
            }
            else {

                if(this.options.enableScrollBars || this.options.enableContentDrag) {
				
					this.options.contentDragElem.on('mouseup', function (evt) {
						evt.preventDefault();
						this.endDrag(evt);
					}.bind(this));

					this.options.contentDragElem.on('mouseleave', function (evt) {
					    this.endDrag(evt);
					}.bind(this));

					this.options.contentDragElem.on('mousemove', function (evt) {
						evt.preventDefault();
						this.drag(evt);
					} .bind(this));
				}

                if (this.options.enableContentDrag) {

                    if (this.options.contentDragOnChildren) {

                        this.scrollBoxContent.children().on('mousedown', function (evt) {

                            this.preventDefaultContentDrag(evt);
                            evt.stopPropagation();

                            this.startContentDrag(evt);
                        } .bind(this));
                    }
                    else {

                        this.scrollBoxContent.on('mousedown', function (evt) {
                            this.preventDefaultContentDrag(evt);
                            this.startContentDrag(evt);
                        } .bind(this));
                    }
                }
            }

            if (this.options.enableResizeMonitor) {

                $(window).on('resize', this.resize.bind(this));
            }
        };

        this.addScrollBarEvents = function (props) {

            if (this.options.enableScrollBars && this.options.enableScrollBarDrag) {

                if (mm.utils.detect.touch()) {

                    props.scrollBarHandle.on('touchstart', function (evt) {

                        evt.stopPropagation();
                        evt = evt.originalEvent.touches[0];
                        this.startDrag(evt);

                    } .bind(this));

                    props.scrollBarTrack.on('touchmove', function (evt) {

                        evt = evt.originalEvent.touches[0];
                        this.drag(evt);

                    } .bind(this));

                    props.scrollBarTrack.on('touchend', function (evt) {

                        evt = evt.originalEvent.touches[0];
                        this.endDrag(evt);

                    } .bind(this));
                }
                else {

                    props.scrollBarHandle.on('mousedown', function (evt) {
                        evt.preventDefault();
                        this.startDrag(evt);
                    } .bind(this));

                    /*props.scrollBarTrack.on('mouseup', function (evt) {
                        this.endDrag(evt);
                    } .bind(this));*/

                    /*props.scrollBarTrack.on('mousemove', function (evt) {
                        this.drag(evt);
                    } .bind(this));*/

                    /*props.scrollBarTrack.on('mouseleave', function (evt) {
                        this.endDrag(evt);
                    } .bind(this));*/
                }
            }

            if (this.options.directionControls && (this.options.enableScrollBars || (props.options.altScrollMoreControl && props.options.altScrollLessControl))) {

                if (props.options.altScrollMoreControl) props.scrollBarMore = props.options.altScrollMoreControl;
                if (props.options.altScrollLessControl) props.scrollBarLess = props.options.altScrollLessControl;

                if (props.scrollBarMore && props.scrollBarLess) {

                    if (mm.utils.detect.touch()) {

                        props.scrollBarMore.on('tap', function (evt) {

                            evt.preventDefault();
                            evt = evt.originalEvent.touches[0];

                            this.scrollMore(evt);

                        } .bind(this));

                        props.scrollBarLess.on('tap', function (evt) {

                            evt.preventDefault();
                            evt = evt.originalEvent.touches[0];

                            this.scrollLess(evt);

                        } .bind(this));
                    }
                    else {

                        props.scrollBarMore.on('click', function (evt) {
                            evt.preventDefault();
                            this.scrollMore(evt);

                        } .bind(this));

                        props.scrollBarLess.on('click', function (evt) {
                            evt.preventDefault();
                            this.scrollLess(evt);

                        } .bind(this));
                    }
                }
            }
        };

        this.resize = function (contentWidth, contentHeight, reset, forceResize) {
		
            this.resizeElements(contentWidth, contentHeight, forceResize);
            if (reset) this.reset();
        };
		
        this.resizeElements = function (contentWidth, contentHeight, forceResize) {

            switch (this.options.direction) {
                case 'horizontal':
                    if (contentWidth) this.scrollBoxContent.css('width', contentWidth);
                    if (contentHeight) this.scrollBoxContent.css('height', contentHeight);

                    this.resizeHorizontalScrollBar();

                    this.adjustScroll(this.pos);
                    break;
                case 'vertical':
                    if (this.options.portWidth == 'auto') this.scrollBoxPort.css({ 'width': this.scrollBoxOuter.outerWidth() - this.controlReduction });
                    if (contentHeight) this.scrollBoxContent.css('height', contentHeight);

                    this.resizeVerticalScrollBar();

                    this.adjustScroll(this.pos);
                    break;
                case 'both':

                    if (contentWidth) this.scrollBoxContent.css('width', contentWidth);
                    if (contentHeight) this.scrollBoxContent.css('height', contentHeight);

                    this.resizeHorizontalScrollBar();
                    this.resizeVerticalScrollBar();

                    this.adjustScroll(this.pos);
                    break;
                default: // Do nothing.
                    break;
            }

        };

        this.resizeHorizontalScrollBar = function () {

            if (this.options.enableScrollBars && !this.options.horizontalProps.altScrollTrack) this.horizontalProps.scrollBarTrack.css({ 'width': this.scrollBoxPort.outerWidth() - this.controlWidthModifier });
            this.horizontalProps.visibleSection = (this.scrollBoxContent.outerWidth() > this.scrollBoxPort.outerWidth()) ? (this.scrollBoxPort.outerWidth() / this.scrollBoxContent.outerWidth()) : 1;

            this.resizeScrollBar(this.horizontalProps);
        };

        this.resizeVerticalScrollBar = function () {

            if (this.options.enableScrollBars && !this.options.verticalProps.altScrollTrack) this.verticalProps.scrollBarTrack.css({ 'height': this.scrollBoxPort.outerHeight() - this.controlWidthModifier });
            this.verticalProps.visibleSection = (this.scrollBoxContent.outerHeight() > this.scrollBoxPort.outerHeight()) ? (this.scrollBoxPort.outerHeight() / this.scrollBoxContent.outerHeight()) : 1;

            this.resizeScrollBar(this.verticalProps);
        };

        this.resizeScrollBar = function (props) {

            if (this.options.enableScrollBars) {

                this.previousHeight = this.scrollBoxContent.outerHeight();
                this.previousWidth = this.scrollBoxContent.outerWidth();

                var handleDim = String((props.visibleSection * 100) + '%');

                var handleWidth = (props.direction == 'horizontal') ? handleDim : '100%';
                var handleHeight = (props.direction == 'horizontal') ? '100%' : handleDim;

                if (this.options.enableScrollBars) {

                    props.scrollBarHandle.css({
                        'width': handleWidth,
                        'height': handleHeight
                    });
                }
            }
        };

        this.reset = function () {

            this.scrollBoxContent.css({
                top: 0,
                left: 0
            });

            if (this.options.enableScrollBars) {

                if(this.horizontalProps.scrollBarHandle) {
					
					this.horizontalProps.scrollBarHandle.css({
						'top': 0,
						'left': 0
					});
				}

				if(this.verticalProps.scrollBarHandle) {
				
					this.verticalProps.scrollBarHandle.scrollBarHandle.css({
						'top': 0,
						'left': 0
					});
				}
            }

            this.grabPos = { x: 0, y: 0 };
            this.pos = { x: 0, y: 0 };
        };

        this.startDrag = function (evt) {

            this.haltTweens();

            var targetHandle = $(evt.target);
            this.targetScroll = targetHandle.parents('[data-direction]');

            this.grabPos = {
                x: (evt.pageX - targetHandle.offset().left),
                y: (evt.pageY - targetHandle.offset().top)
            }

            if (this.horizontalProps.scrollBarLess) this.grabPos.x -= this.options.scrollControlSize;
            if (this.verticalProps.scrollBarLess) this.grabPos.y -= this.options.scrollControlSize;

            this.dragging = true;

            this.scrollBoxOuter.addClass('dragging');

            $(this.scrollBoxOuter).trigger('startdrag');
            $(this).trigger('startdrag');
        };

        this.startContentDrag = function (evt) {

            this.haltTweens();

			var pos = this.pos;
			
			if(this.options.contentDragInverted) {
				
				pos = { 
					x: 1 - pos.x,
					y: 1 - pos.y
				};
			}
			
            this.grabPos = {
                x: (evt.pageX - this.scrollBoxPort.offset().left) - (pos.x * this.scrollBoxPort.outerWidth()),
                y: (evt.pageY - this.scrollBoxPort.offset().top) - (pos.y * this.scrollBoxPort.outerHeight())
            }

            this.contentDragging = true;

            this.scrollBoxOuter.addClass('dragging');

            $(this.scrollBoxOuter).trigger('startdrag');
            $(this).trigger('startdrag');
            $(this.scrollBoxOuter).trigger('startcontentdrag');
            $(this).trigger('startcontentdrag');
        };

        this.endDrag = function (evt) {

            if (this.dragging || this.contentDragging) {

                this.dragging = false;
                this.contentDragging = false;

                this.scrollBoxOuter.removeClass('dragging');

                $(this.scrollBoxOuter).trigger('enddrag');
                $(this).trigger('enddrag');
            }
        };

        this.drag = function (evt) {

            var pos = this.pos;

            if (this.dragging) {

                if (this.targetScroll.attr('data-direction') == 'horizontal') {
                    pos.x = ((evt.pageX - this.horizontalProps.scrollBarTrack.offset().left - this.grabPos.x) / this.horizontalProps.scrollBarTrack.outerWidth());
                }
                else {
                    pos.y = ((evt.pageY - this.verticalProps.scrollBarTrack.offset().top - this.grabPos.y) / this.verticalProps.scrollBarTrack.outerHeight());
                }

                this.adjustScroll(pos);
            }
            else if (this.contentDragging) {
				
				switch (this.options.direction) {
                    case 'horizontal':
                        pos.x = (evt.pageX - this.scrollBoxPort.offset().left - this.grabPos.x) / this.scrollBoxPort.outerWidth();
                        break;
                    case 'vertical':
                        pos.y = (evt.pageY - this.scrollBoxPort.offset().top - this.grabPos.y) / this.scrollBoxPort.outerHeight();
                        break;
                    case 'both':
                        pos.x = (evt.pageX - this.scrollBoxPort.offset().left - this.grabPos.x) / this.scrollBoxPort.outerWidth();
                        pos.y = (evt.pageY - this.scrollBoxPort.offset().top - this.grabPos.y) / this.scrollBoxPort.outerHeight();
                        break;
                    default: // Do nothing.
                        break;
                }
				
				if(this.options.contentDragInverted) {
				
					pos = { 
						x: 1 - pos.x,
						y: 1 - pos.y
					};
				}

                this.adjustScroll(pos);
            }
        };

        this.haltTweens = function () {

            if (this.options.scrollBehaviour == 'tween' && !mm.utils.css3.detectProperty('transition')) {
                if (this.options.enableScrollBars) {
                    if (this.horizontalProps.scrollBarHandle) this.horizontalProps.scrollBarHandle.stop();
                    if (this.verticalProps.scrollBarHandle) this.verticalProps.scrollBarHandle.stop();
                }

                this.scrollBoxContent.stop();
            }
        };

        this.adjustScroll = function (pos, animate) {
		
			pos.x = (pos.x < 0) ? 0 : pos.x;
            pos.x = ((pos.x + this.horizontalProps.visibleSection) > 1) ? 1 - this.horizontalProps.visibleSection : pos.x;

            pos.y = (pos.y < 0) ? 0 : pos.y;
            pos.y = ((pos.y + this.verticalProps.visibleSection) > 1) ? 1 - this.verticalProps.visibleSection : pos.y;

            this.pos = pos;

            var trans;

            if ((this.options.scrollBehaviour == 'tween') && animate) {

                if (mm.utils.css3.detectProperty('transition')) {

                    var transition = String('all ' + this.options.scrollSpeed + 's ease-in-out');

                    if (this.options.enableScrollBars) {

                        if (this.horizontalProps.scrollBarHandle) mm.utils.css3.setTransitions(this.horizontalProps.scrollBarHandle, transition);
                        if (this.verticalProps.scrollBarHandle) mm.utils.css3.setTransitions(this.verticalProps.scrollBarHandle, transition);
                    }

                    mm.utils.css3.setTransitions(this.scrollBoxContent, transition);

                    this.performScroll();
                }
                else {

                    this.performScroll(true);
                }
            }
            else {

                if (this.options.enableScrollBars) {

                    if (this.horizontalProps.scrollBarHandle) mm.utils.css3.clearTransitions(this.horizontalProps.scrollBarHandle);
                    if (this.verticalProps.scrollBarHandle) mm.utils.css3.clearTransitions(this.verticalProps.scrollBarHandle);
                }

                mm.utils.css3.clearTransitions(this.scrollBoxContent, transition);

                this.performScroll();
            }
        };

        this.performScroll = function (jsAnimate) {

            if (this.options.enableScrollBars) {

                var hProps;
                var vProps;

                var leftPos = String((this.pos.x * 100) + '%');
                var topPos = String((this.pos.y * 100) + '%');

                // TODO: Use csstransforms if available
                //if (mm.utils.css3.detectProperty('transform')) {
                if(false) {

                    hProps = mm.utils.css3.getTransform('translateX(' + leftPos + ')');
                    vProps = mm.utils.css3.getTransform('translateY(' + leftPos + ')');
                }
                else {
                    hProps = { 'left': leftPos };
                    vProps = { 'top': topPos };
                }

                if (jsAnimate) {

                    if (this.horizontalProps.scrollBarHandle) this.horizontalProps.scrollBarHandle.animate(hProps);
                    if (this.verticalProps.scrollBarHandle) this.verticalProps.scrollBarHandle.animate(vProps);
                }
                else {

                    if (this.horizontalProps.scrollBarHandle) this.horizontalProps.scrollBarHandle.css(hProps);
                    if (this.verticalProps.scrollBarHandle) this.verticalProps.scrollBarHandle.css(vProps);
                }
            }

            var cProps;

            leftPos = (this.options.direction == 'vertical') ? '0px' : String(((0 - this.pos.x) * this.scrollBoxContent.outerWidth()) + 'px');
            topPos = (this.options.direction == 'horizontal') ? '0px' : String(((0 - this.pos.y) * this.scrollBoxContent.outerHeight()) + 'px');

            // TODO: Use csstransforms if available
            //if (mm.utils.css3.detectProperty('transform')) {
            if (false) {

                cProps = mm.utils.css3.getTransform('translateX(' + leftPos + ') translateY(' + topPos + ')');
            }
            else {
                cProps = {
                    'left': leftPos,
                    'top': topPos
                }
            }

            if (jsAnimate) this.scrollBoxContent.animate(cProps);
            else this.scrollBoxContent.css(cProps);
        }

        this.scrollMore = function (evt) {

            this.targetScroll = $(evt.target).parents('[data-direction]');

            var pos = this.pos;
            var dim;

            if (this.targetScroll.attr('data-direction') == 'horizontal') {

                dim = this.scrollBoxContent.outerWidth();
                pos.x = pos.x + (this.options.scrollShift / dim);
            }
            else {

                dim = this.scrollBoxContent.outerHeight();
                pos.y = pos.y + (this.options.scrollShift / dim);
            }

            this.adjustScroll(pos, true);
        };

        this.scrollLess = function (evt) {

            this.targetScroll = $(evt.target).parents('[data-direction]');

            var pos = this.pos;
            var dim;

            if (this.targetScroll.attr('data-direction') == 'horizontal') {

                dim = this.scrollBoxContent.outerWidth();
                pos.x = pos.x - (this.options.scrollShift / dim);
            }
            else {

                dim = this.scrollBoxContent.outerHeight();
                pos.y = pos.y - (this.options.scrollShift / dim);
            }

            this.adjustScroll(pos, true);
        };

        this.preventDefaultContentDrag = function (evt) {

            var targetType = $(evt.target)[0].tagName;

            if ((targetType != 'LABEL' && targetType != 'INPUT' && targetType != 'A' && targetType != 'BUTTON')) {
                evt.preventDefault();
            }
        };

        this.init();
    };
} (jQuery));