(function ($) {
    "use strict";

    /**************************************************************

    Script		: ScrollBox
    Authors		: Matt Robinson

    **************************************************************/

    var ScrollBox = window["ScrollBox"] = function (container, options) {

        var self = this;

        // Private vars
        var _scrollBoxOuter;
        var _scrollBoxContent;
        var _scrollBoxPort;
        var _controlReduction;

        var _dragging = false;
        var _contentDragging = false;
        var _grabPos = { x: 0, y: 0 };
        var _pos = { x: 0, y: 0 };

        var _built = false;

        var _previousHeight = 0;
        var _previousWidth = 0;
        var _controlWidthModifier;

        var _horizontalProps;
        var _verticalProps;

        var _pos;
        var _grabPos;

        var _targetScroll;

        // Options
        var getOptions = function () {

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

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            _scrollBoxOuter = container;

            if (_scrollBoxOuter[0]) build();
        };

        // Private Function
        var build = function () {

            createScrollBox();

            _horizontalProps = {
                direction: 'horizontal',
                options: self.options.horizontalProps,
                scrollBarTrack: null,
                scrollBarHandle: null,
                scrollBarContainer: null,
                visibleSection: 0
            };

            _verticalProps = {
                direction: 'vertical',
                options: self.options.verticalProps,
                scrollBarTrack: null,
                scrollBarHandle: null,
                scrollBarContainer: null,
                visibleSection: 0
            };

            if (self.options.enableScrollBars) createScrollBars();

            resizeElements();
            addEvents();

            _built = true;
        };

        var createScrollBox = function () {

            var portWidth;
            var portHeight;

            _scrollBoxOuter.append('<div style="height: 0px; clear: both;"/>');

            _scrollBoxOuter.wrapInner('<div class="' + self.options.direction + '" data-scroll-box/>');
            _scrollBoxContent = $(_scrollBoxOuter.find('[data-scroll-box]')[0]);
            _scrollBoxContent.wrap('<div data-scroll-port/>');
            _scrollBoxPort = $(_scrollBoxOuter.find('[data-scroll-port]')[0]);

            _controlReduction = (self.options.enableScrollBars && (!self.options.horizontalAltScrollTrack && !self.options.horizontalAltScrollHandle)) ? self.options.scrollBarWeight + self.options.scrollBoxGutter + self.options.scrollContentPadding : 0;

            _scrollBoxOuter.css({
                'position': 'relative'
            });

            var contentWidth = 0;
            var contentHeight = 0;

            if (self.options.direction == 'both') {

                var widthNumeric = $.isNumeric(self.options.contentWidth);
                var heightNumeric = $.isNumeric(self.options.contentHeight);

                contentWidth = (!widthNumeric) ? _scrollBoxOuter.outerWidth() : self.options.contentWidth;
                contentHeight = (!heightNumeric) ? _scrollBoxOuter.outerHeight() : self.options.contentHeight;
            }
            else {
                contentWidth = self.options.contentWidth;
                contentHeight = self.options.contentHeight;
            }

            _scrollBoxContent.css({
                'position': 'relative',
                'width': contentWidth,
                'height': contentHeight
            });

            // Get numeric values
            contentWidth = _scrollBoxContent.outerWidth();
            contentHeight = _scrollBoxContent.outerHeight();

            switch (String(self.options.portWidth)) {
                case 'auto': portWidth = (self.options.direction == 'horizontal' || self.options.direction == 'both') ? 'auto' : _scrollBoxOuter.outerWidth() - _controlReduction;
                    break;
                case 'fluid': portWidth = '100%';
                    break;
                default: portWidth = self.options.portWidth;
                    break;
            }

            switch (String(self.options.portHeight)) {
                case 'auto': portHeight = (self.options.direction == 'horizontal' || self.options.direction == 'both') ? 'auto' : _scrollBoxOuter.outerHeight() - _controlReduction;
                    break;
                case 'fluid': portHeight = '100%';
                    break;
                default: portHeight = self.options.portHeight;
                    break;
            }

            if ((self.options.direction == 'horizontal') && self.options.enableScrollBars) {

                _scrollBoxOuter.css({
                    'padding-bottom': _controlReduction
                });
            }

            _scrollBoxPort.css('overflow', 'hidden');

            _scrollBoxPort.css({
                'position': 'relative',
                'width': portWidth,
                'height': portHeight
            });
        };

        var createScrollBars = function () {

            _controlWidthModifier = (self.options.directionControls) ? (self.options.scrollControlSize * 2) : 0;

            switch (self.options.direction) {
                case 'horizontal': createScrollBar(_horizontalProps);
                    break;
                case 'vertical': createScrollBar(_verticalProps);
                    break;
                case 'both':
                    createScrollBar(_horizontalProps);
                    createScrollBar(_verticalProps);
                    break;
                default: // Do nothing.
                    break;
            }
        };

        var createScrollBar = function (props) {

            var portWidth = _scrollBoxPort.outerWidth();
            var portHeight = _scrollBoxPort.outerHeight();

            var contentWidth = _scrollBoxContent.outerWidth();
            var contentHeight = _scrollBoxContent.outerHeight();

            if (props.options.altScrollTrack && props.options.altScrollHandle) {

                props.scrollBarTrack = props.options.altScrollTrack;
                props.scrollBarHandle = props.options.altScrollHandle;
            }
            else {

                _scrollBoxOuter.append('<div class="' + props.direction + '" data-scroll-bar data-direction="' + props.direction + '"/>');
                props.scrollBarContainer = $(_scrollBoxOuter.children('[data-scroll-bar][data-direction='+ props.direction + ']')[0]);

                if (props.direction == 'horizontal') {
                    props.scrollBarContainer.css({
                        'position': 'absolute',
                        'left': 0,
                        'bottom': self.options.scrollBoxGutter,
                        'width': '100%',
                        'height': self.options.scrollBarWeight
                    });
                }
                else {
                    props.scrollBarContainer.css({
                        'position': 'absolute',
                        'right': self.options.scrollBoxGutter,
                        'top': 0,
                        'width': self.options.scrollBarWeight
                    });
                }

                if (self.options.directionControls) {

                    var controlWidth = (props.direction == 'horizontal') ? self.options.scrollControlSize : self.options.scrollBarWeight;
                    var controlHeight = (props.direction == 'horizontal') ? self.options.scrollBarWeight : self.options.scrollControlSize;
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
                        'width': portWidth - _controlWidthModifier,
                        'float': 'left',
                        'height': '100%'
                    });
                }
                else {

                    props.scrollBarTrack.css({
                        'height': portHeight - _controlWidthModifier
                    });
                }

                if (self.options.directionControls) {
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
                'cursor': ((self.options.enableScrollBarDrag) ? 'pointer' : 'default')
            });
        };

        var addEvents = function () {

            switch (self.options.direction) {
                case 'horizontal': addScrollBarEvents(_horizontalProps);
                    break;
                case 'vertical': addScrollBarEvents(_verticalProps);
                    break;
                case 'both':
                    addScrollBarEvents(_horizontalProps);
                    addScrollBarEvents(_verticalProps);
                    break;
                default: // Do nothing.
                    break;
            }

            if (uk.utils.detect.touch()) {

                if (self.options.enableContentDrag) {

                    if (self.options.contentDragOnChildren) {

                        _scrollBoxContent.children().on('touchstart', function (evt) {

                            preventDefaultContentDrag(evt);
                            //evt.stopPropagation();

                            evt = evt.originalEvent.touches[0];

                            startContentDrag(evt);

                        } );
                    }
                    else {

                        _scrollBoxContent.on('touchstart', function (evt) {

                            preventDefaultContentDrag(evt);
                            evt = evt.originalEvent.touches[0];

                            startContentDrag(evt);

                        } );
                    }

                    self.options.contentDragElem.on('touchmove', function (evt) {

                        preventDefaultContentDrag(evt);
                        evt = evt.originalEvent.touches[0];

                        drag(evt);

                    } );

                    self.options.contentDragElem.on('touchend', function (evt) {

                        preventDefaultContentDrag(evt);
                        evt = evt.originalEvent.touches[0];

                        endDrag(evt);

                    } );
                }
            }
            else {

                if(self.options.enableScrollBars || self.options.enableContentDrag) {
				
					self.options.contentDragElem.on('mouseup', function (evt) {
						evt.preventDefault();
						endDrag(evt);
					});

					self.options.contentDragElem.on('mouseleave', function (evt) {
					    endDrag(evt);
					});

					self.options.contentDragElem.on('mousemove', function (evt) {
						evt.preventDefault();
						drag(evt);
					} );
				}

                if (self.options.enableContentDrag) {

                    if (self.options.contentDragOnChildren) {

                        _scrollBoxContent.children().on('mousedown', function (evt) {

                            preventDefaultContentDrag(evt);
                            evt.stopPropagation();

                            startContentDrag(evt);
                        } );
                    }
                    else {

                        _scrollBoxContent.on('mousedown', function (evt) {
                            preventDefaultContentDrag(evt);
                            startContentDrag(evt);
                        } );
                    }
                }
            }

            if (self.options.enableResizeMonitor) {

                $(window).on('resize', self.resize);
            }
        };

        var addScrollBarEvents = function (props) {

            if (self.options.enableScrollBars && self.options.enableScrollBarDrag) {

                if (uk.utils.detect.touch()) {

                    props.scrollBarHandle.on('touchstart', function (evt) {

                        evt.stopPropagation();
                        evt = evt.originalEvent.touches[0];
                        startDrag(evt);

                    } );

                    props.scrollBarTrack.on('touchmove', function (evt) {

                        evt = evt.originalEvent.touches[0];
                        drag(evt);

                    } );

                    props.scrollBarTrack.on('touchend', function (evt) {

                        evt = evt.originalEvent.touches[0];
                        endDrag(evt);

                    } );
                }
                else {

                    props.scrollBarHandle.on('mousedown', function (evt) {
                        evt.preventDefault();
                        startDrag(evt);
                    } );

                    /*props.scrollBarTrack.on('mouseup', function (evt) {
                        endDrag(evt);
                    } );*/

                    /*props.scrollBarTrack.on('mousemove', function (evt) {
                        drag(evt);
                    } );*/

                    /*props.scrollBarTrack.on('mouseleave', function (evt) {
                        endDrag(evt);
                    } );*/
                }
            }

            if (self.options.directionControls && (self.options.enableScrollBars || (props.options.altScrollMoreControl && props.options.altScrollLessControl))) {

                if (props.options.altScrollMoreControl) props.scrollBarMore = props.options.altScrollMoreControl;
                if (props.options.altScrollLessControl) props.scrollBarLess = props.options.altScrollLessControl;

                if (props.scrollBarMore && props.scrollBarLess) {

                    if (uk.utils.detect.touch()) {

                        props.scrollBarMore.on('tap', function (evt) {

                            evt.preventDefault();
                            evt = evt.originalEvent.touches[0];

                            scrollMore(evt);

                        } );

                        props.scrollBarLess.on('tap', function (evt) {

                            evt.preventDefault();
                            evt = evt.originalEvent.touches[0];

                            scrollLess(evt);

                        } );
                    }
                    else {

                        props.scrollBarMore.on('click', function (evt) {
                            evt.preventDefault();
                            scrollMore(evt);

                        } );

                        props.scrollBarLess.on('click', function (evt) {
                            evt.preventDefault();
                            scrollLess(evt);

                        } );
                    }
                }
            }
        };
		
        var resizeElements = function (contentWidth, contentHeight, forceResize) {

            switch (self.options.direction) {
                case 'horizontal':
                    if (contentWidth) _scrollBoxContent.css('width', contentWidth);
                    if (contentHeight) _scrollBoxContent.css('height', contentHeight);

                    resizeHorizontalScrollBar();

                    adjustScroll(_pos);
                    break;
                case 'vertical':
                    if (self.options.portWidth == 'auto') _scrollBoxPort.css({ 'width': _scrollBoxOuter.outerWidth() - _controlReduction });
                    if (contentHeight) _scrollBoxContent.css('height', contentHeight);

                    resizeVerticalScrollBar();

                    adjustScroll(_pos);
                    break;
                case 'both':

                    if (contentWidth) _scrollBoxContent.css('width', contentWidth);
                    if (contentHeight) _scrollBoxContent.css('height', contentHeight);

                    resizeHorizontalScrollBar();
                    resizeVerticalScrollBar();

                    adjustScroll(_pos);
                    break;
                default: // Do nothing.
                    break;
            }

        };

        var resizeHorizontalScrollBar = function () {

            if (self.options.enableScrollBars && !self.options.horizontalProps.altScrollTrack) _horizontalProps.scrollBarTrack.css({ 'width': _scrollBoxPort.outerWidth() - _controlWidthModifier });
            _horizontalProps.visibleSection = (_scrollBoxContent.outerWidth() > _scrollBoxPort.outerWidth()) ? (_scrollBoxPort.outerWidth() / _scrollBoxContent.outerWidth()) : 1;

            resizeScrollBar(_horizontalProps);
        };

        var resizeVerticalScrollBar = function () {

            if (self.options.enableScrollBars && !self.options.verticalProps.altScrollTrack) _verticalProps.scrollBarTrack.css({ 'height': _scrollBoxPort.outerHeight() - _controlWidthModifier });
            _verticalProps.visibleSection = (_scrollBoxContent.outerHeight() > _scrollBoxPort.outerHeight()) ? (_scrollBoxPort.outerHeight() / _scrollBoxContent.outerHeight()) : 1;

            resizeScrollBar(_verticalProps);
        };

        var resizeScrollBar = function (props) {

            if (self.options.enableScrollBars) {

                _previousHeight = _scrollBoxContent.outerHeight();
                _previousWidth = _scrollBoxContent.outerWidth();

                var handleDim = String((props.visibleSection * 100) + '%');

                var handleWidth = (props.direction == 'horizontal') ? handleDim : '100%';
                var handleHeight = (props.direction == 'horizontal') ? '100%' : handleDim;

                if (self.options.enableScrollBars) {

                    props.scrollBarHandle.css({
                        'width': handleWidth,
                        'height': handleHeight
                    });
                }
            }
        };

        var startDrag = function (evt) {

            haltTweens();

            var targetHandle = $(evt.target);
            _targetScroll = targetHandle.parents('[data-direction]');

            _grabPos = {
                x: (evt.pageX - targetHandle.offset().left),
                y: (evt.pageY - targetHandle.offset().top)
            }

            if (_horizontalProps.scrollBarLess) _grabPos.x -= self.options.scrollControlSize;
            if (_verticalProps.scrollBarLess) _grabPos.y -= self.options.scrollControlSize;

            _dragging = true;

            _scrollBoxOuter.addClass('dragging');

            $(_scrollBoxOuter).trigger('startdrag');
            $(this).trigger('startdrag');
        };

        var startContentDrag = function (evt) {

            haltTweens();

			var pos = _pos;
			
			if(self.options.contentDragInverted) {
				
				pos = { 
					x: 1 - pos.x,
					y: 1 - pos.y
				};
			}
			
            _grabPos = {
                x: (evt.pageX - _scrollBoxPort.offset().left) - (pos.x * _scrollBoxPort.outerWidth()),
                y: (evt.pageY - _scrollBoxPort.offset().top) - (pos.y * _scrollBoxPort.outerHeight())
            }

            _contentDragging = true;

            _scrollBoxOuter.addClass('dragging');

            $(_scrollBoxOuter).trigger('startdrag');
            $(this).trigger('startdrag');
            $(_scrollBoxOuter).trigger('startcontentdrag');
            $(this).trigger('startcontentdrag');
        };

        var endDrag = function (evt) {

            if (_dragging || _contentDragging) {

                _dragging = false;
                _contentDragging = false;

                _scrollBoxOuter.removeClass('dragging');

                $(_scrollBoxOuter).trigger('enddrag');
                $(this).trigger('enddrag');
            }
        };

        var drag = function (evt) {

            var pos = _pos;

            if (_dragging) {

                if (_targetScroll.attr('data-direction') == 'horizontal') {
                    pos.x = ((evt.pageX - _horizontalProps.scrollBarTrack.offset().left - _grabPos.x) / _horizontalProps.scrollBarTrack.outerWidth());
                }
                else {
                    pos.y = ((evt.pageY - _verticalProps.scrollBarTrack.offset().top - _grabPos.y) / _verticalProps.scrollBarTrack.outerHeight());
                }

                adjustScroll(pos);
            }
            else if (_contentDragging) {
				
				switch (self.options.direction) {
                    case 'horizontal':
                        pos.x = (evt.pageX - _scrollBoxPort.offset().left - _grabPos.x) / _scrollBoxPort.outerWidth();
                        break;
                    case 'vertical':
                        pos.y = (evt.pageY - _scrollBoxPort.offset().top - _grabPos.y) / _scrollBoxPort.outerHeight();
                        break;
                    case 'both':
                        pos.x = (evt.pageX - _scrollBoxPort.offset().left - _grabPos.x) / _scrollBoxPort.outerWidth();
                        pos.y = (evt.pageY - _scrollBoxPort.offset().top - _grabPos.y) / _scrollBoxPort.outerHeight();
                        break;
                    default: // Do nothing.
                        break;
                }
				
				if(self.options.contentDragInverted) {
				
					pos = { 
						x: 1 - pos.x,
						y: 1 - pos.y
					};
				}

                adjustScroll(pos);
            }
        };

        var haltTweens = function () {

            if (self.options.scrollBehaviour == 'tween' && !uk.utils.css3.detectProperty('transition')) {
                if (self.options.enableScrollBars) {
                    if (_horizontalProps.scrollBarHandle) _horizontalProps.scrollBarHandle.stop();
                    if (_verticalProps.scrollBarHandle) _verticalProps.scrollBarHandle.stop();
                }

                _scrollBoxContent.stop();
            }
        };

        var adjustScroll = function (pos, animate) {
		
			pos.x = (pos.x < 0) ? 0 : pos.x;
            pos.x = ((pos.x + _horizontalProps.visibleSection) > 1) ? 1 - _horizontalProps.visibleSection : pos.x;

            pos.y = (pos.y < 0) ? 0 : pos.y;
            pos.y = ((pos.y + _verticalProps.visibleSection) > 1) ? 1 - _verticalProps.visibleSection : pos.y;

            _pos = pos;

            var trans;

            if ((self.options.scrollBehaviour == 'tween') && animate) {

                if (uk.utils.css3.detectProperty('transition')) {

                    var transition = String('all ' + self.options.scrollSpeed + 's ease-in-out');

                    if (self.options.enableScrollBars) {

                        if (_horizontalProps.scrollBarHandle) uk.utils.css3.setTransitions(_horizontalProps.scrollBarHandle, transition);
                        if (_verticalProps.scrollBarHandle) uk.utils.css3.setTransitions(_verticalProps.scrollBarHandle, transition);
                    }

                    uk.utils.css3.setTransitions(_scrollBoxContent, transition);

                    performScroll();
                }
                else {

                    performScroll(true);
                }
            }
            else {

                if (self.options.enableScrollBars) {

                    if (_horizontalProps.scrollBarHandle) uk.utils.css3.clearTransitions(_horizontalProps.scrollBarHandle);
                    if (_verticalProps.scrollBarHandle) uk.utils.css3.clearTransitions(_verticalProps.scrollBarHandle);
                }

                uk.utils.css3.clearTransitions(_scrollBoxContent, transition);

                performScroll();
            }
        };

        var performScroll = function (jsAnimate) {

            if (self.options.enableScrollBars) {

                var hProps;
                var vProps;

                var leftPos = String((_pos.x * 100) + '%');
                var topPos = String((_pos.y * 100) + '%');

                // TODO: Use csstransforms if available
                //if (uk.utils.css3.detectProperty('transform')) {
                if(false) {

                    hProps = uk.utils.css3.getTransform('translateX(' + leftPos + ')');
                    vProps = uk.utils.css3.getTransform('translateY(' + leftPos + ')');
                }
                else {
                    hProps = { 'left': leftPos };
                    vProps = { 'top': topPos };
                }

                if (jsAnimate) {

                    if (_horizontalProps.scrollBarHandle) _horizontalProps.scrollBarHandle.animate(hProps);
                    if (_verticalProps.scrollBarHandle) _verticalProps.scrollBarHandle.animate(vProps);
                }
                else {

                    if (_horizontalProps.scrollBarHandle) _horizontalProps.scrollBarHandle.css(hProps);
                    if (_verticalProps.scrollBarHandle) _verticalProps.scrollBarHandle.css(vProps);
                }
            }

            var cProps;

            leftPos = (self.options.direction == 'vertical') ? '0px' : String(((0 - _pos.x) * _scrollBoxContent.outerWidth()) + 'px');
            topPos = (self.options.direction == 'horizontal') ? '0px' : String(((0 - _pos.y) * _scrollBoxContent.outerHeight()) + 'px');

            // TODO: Use csstransforms if available
            //if (uk.utils.css3.detectProperty('transform')) {
            if (false) {

                cProps = uk.utils.css3.getTransform('translateX(' + leftPos + ') translateY(' + topPos + ')');
            }
            else {
                cProps = {
                    'left': leftPos,
                    'top': topPos
                }
            }

            if (jsAnimate) _scrollBoxContent.animate(cProps);
            else _scrollBoxContent.css(cProps);
        }

        var scrollMore = function (evt) {

            _targetScroll = $(evt.target).parents('[data-direction]');

            var pos = _pos;
            var dim;

            if (_targetScroll.attr('data-direction') == 'horizontal') {

                dim = _scrollBoxContent.outerWidth();
                pos.x = pos.x + (self.options.scrollShift / dim);
            }
            else {

                dim = _scrollBoxContent.outerHeight();
                pos.y = pos.y + (self.options.scrollShift / dim);
            }

            adjustScroll(pos, true);
        };

        var scrollLess = function (evt) {

            _targetScroll = $(evt.target).parents('[data-direction]');

            var pos = _pos;
            var dim;

            if (_targetScroll.attr('data-direction') == 'horizontal') {

                dim = _scrollBoxContent.outerWidth();
                pos.x = pos.x - (self.options.scrollShift / dim);
            }
            else {

                dim = _scrollBoxContent.outerHeight();
                pos.y = pos.y - (self.options.scrollShift / dim);
            }

            adjustScroll(pos, true);
        };

        var preventDefaultContentDrag = function (evt) {

            var targetType = $(evt.target)[0].tagName;

            if ((targetType != 'LABEL' && targetType != 'INPUT' && targetType != 'A' && targetType != 'BUTTON')) {
                evt.preventDefault();
            }
        };

        // Public Functions
        self.reset = function () {

            _scrollBoxContent.css({
                top: 0,
                left: 0
            });

            if (self.options.enableScrollBars) {

                if (_horizontalProps.scrollBarHandle) {

                    _horizontalProps.scrollBarHandle.css({
                        'top': 0,
                        'left': 0
                    });
                }

                if (_verticalProps.scrollBarHandle) {

                    _verticalProps.scrollBarHandle.scrollBarHandle.css({
                        'top': 0,
                        'left': 0
                    });
                }
            }

            _grabPos = { x: 0, y: 0 };
            _pos = { x: 0, y: 0 };
        };

        self.resize = function (contentWidth, contentHeight, reset, forceResize) {

            resizeElements(contentWidth, contentHeight, forceResize);
            if (reset) self.reset();
        };

        self.init();
    };
} (jQuery));