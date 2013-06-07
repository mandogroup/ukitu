(function ($) {

    "use strict";

    /**************************************************************

    Script		: Ukitu - ViewManager
    Authors		: Matt Robinson

    **************************************************************/

    var MMViewManager = window["MMViewManager"] = function (options) {

        var self = this;

        // Constants
        self.TRANSITION_SWIPE = 'swipe';
        self.TRANSITION_FADE = 'fade';

        // Private vars
        var _useTransforms = uk.utils.css3.useTransitions() && uk.utils.css3.useTransforms();

        var _inTransition;
        var _transition;
        var _transitionHolding;

        var _request;

        var _pageHeight;
        var _viewHeight;
        var _interfaceHeight;

        var _viewIdArr;

        var _currentView;
        var _currentViewId;

        var _newView;
        var _newViewId;
        var _newViewUrl;
        var _newViewTransition;

        var _header;
        var _footer;

        var _container;

        // Options
        var getOptions = function () {

            var options = {
                lockHeight: false,
                maxHeight: false,
                transitionDuration: 0.5,
                defaultTransition: self.TRANSITION_SWIPE,
                useTransitionTriggers: false,
                viewDirectory: null
            };

            return options;
        };

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            _useTransforms = uk.utils.css3.useTransitions() && uk.utils.css3.useTransforms();

            _inTransition = false;
            _transitionHolding = false;
            _viewIdArr = new Array();

            _pageHeight = 0;
            _viewHeight = 0;

            build();
            addEvents();

            activate();
        };

        // Private Functions
        var build = function () {

            _currentView = $('[data-view]');
            _currentViewId = _currentView.attr('data-view');

            _currentView.data('title', $('title').text());

            _viewIdArr.push(_currentViewId);

            uk.utils.log('MM INFO: "' + _currentViewId + '" View created');

            uk.events.fireViewManagerEvent('viewcreate', [_currentViewId])
            _currentView.trigger('viewcreate', [_currentViewId]);

            _header = $('[data-header]');
            _footer = $('[data-footer]');

            $(_currentView.wrap('<div id="view_wrapper" data-view-wrapper/>'));
            _container = $('[data-view-wrapper]');

            _container.css({
                'width': '100%',
                'position': 'relative',
                'z-index': 1
            });

            if (_useTransforms) {

                _transition = String('all ' + self.options.transitionDuration + 's ease-in-out 0s');
            }

            appendViewElements(_currentView);
        };

        var addEvents = function () {

            $(window).on('resize', function () {

                /*if (_inTransition) {
                    _currentView.stop(true, true);
                }*/

                //console.log(self);

                self.resizeView()
            });

            $(window).on('scroll', repositionView);
            $(window).on('load', self.resizeView);

            if (self.options.useTransitionTriggers) {
                uk.events.addViewManagerEvent('viewready', transitionViews);
                uk.events.addViewManagerEvent('viewcancel', self.cancelView);
            }

            $(document).on(uk.utils.css3.getTransitionEnd(), function (evt) {

                var evtTarget = $(evt.target);
                if (evtTarget.is('[data-view]')) endTransition(evt);

            } );

            $(window).on('hashchange', function (evt) {

                if (!_inTransition) {
								
					try {

						var newViewId = (evt && evt.newURL) ? evt.newURL.split('#') : String(window.location.hash).split('#');
						newViewId = newViewId[newViewId.length - 1] ? newViewId[newViewId.length - 1] : null;
						newViewId = newViewId.split('?')[0];

						var oldViewId = (evt && evt.oldURL) ? evt.oldURL.split('#') : null;
						oldViewId = (oldViewId && oldViewId[oldViewId.length - 1]) ? oldViewId[oldViewId.length - 1] : null;
						oldViewId = (oldViewId) ? oldViewId.split('?')[0] : _currentViewId;
					}
					catch (err) {

						uk.utils.log('MM ERROR: The view "' + newViewId + '" is not registered in this application.');
						uk.utils.log(err);
					}

					if (newViewId) loadView(newViewId, oldViewId);
				}

            } );

            $(document).on('tap', 'a[data-url]', function (evt) {

                /*if (_inTransition) {
                    evt.preventDefault();
                }
                else {*/

                    var target = $(evt.target);
                    var targetUrl = target.attr('data-url');
                    var targetId = target.attr('href').split('#');
					var targetTransition = target.attr('data-transition'); 
					
                    targetId = targetId[targetId.length - 1] ? targetId[targetId.length - 1] : null;

                    _newViewUrl = targetUrl;
					_newViewTransition = targetTransition;
                //}
            } );
        };

        var activate = function () {

            setViewHeights();

            resetHash(_currentViewId);

            if (window.location.hash) {

                $(window).trigger('hashchange');
            }
        };

        var repositionView = function (evt) {

            uk.events.fireViewManagerEvent('viewscroll');
        };

        var loadView = function (viewId, previousViewId, overrideTransitionTrigger) {

            if (_currentViewId != viewId) {

                var viewIndex = _viewIdArr.indexOf(viewId);

                var url = _newViewUrl;

                if (!url && self.options.viewDirectory) {
                    var viewMatch = self.options.viewDirectory[uk.utils.indexOfPropValue(self.options.viewDirectory, 'viewId', viewId)];
                    url = (viewMatch) ? viewMatch.viewUrl : null;
                }

                if (viewIndex == -1 && url) {

                    uk.events.fireViewManagerEvent('viewbeforenewload');

                    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

                    var scriptData;
                    var viewTitle;

                    if (_request) _request.abort();

                    _request = $.ajax({
                        url: url,
                        dataType: 'html',
                        success: function (data, textStatus, jqXHR) {
                            
                            scriptData = $(data).filter('[data-script]');
                            viewTitle = $(data).filter('title').text();

                            _newView = $("<div>").append(data.replace(rscript, "")).find('[data-view]').append(scriptData);
                            _newView.data('title', viewTitle);

                            appendViewElements(_newView);

                            _newViewId = _newView.attr('data-view');

                            uk.events.fireViewManagerEvent('viewbeforeload', [_newViewId, _currentViewId]);

                            _viewIdArr.push(_newViewId);

                            uk.events.fireViewManagerEvent('viewafternewload', [_newViewId, _currentViewId]);

                            switchView(true, overrideTransitionTrigger);

                            _request = null;
                        } ,
                        error: function (jqXHR, textStatus, errorThrown) {
                            
                            uk.utils.log(jqXHR);

                            resetHash(previousViewId);
                            uk.events.fireViewManagerEvent('viewafternewload', [previousViewId, previousViewId])

                        } 
                    });
                }
                else if (viewIndex >= 0) {

                    var selector = '[data-view="' + _viewIdArr[viewIndex] + '"]';

                    _newView = $(selector);
                    _newViewId = _viewIdArr[viewIndex];

                    uk.events.fireViewManagerEvent('viewbeforeload', [_newViewId, _currentViewId]);

                    switchView(false, overrideTransitionTrigger);
                }
                else {

                    if (!url) {
                        uk.utils.log('MM ERROR: The application has no reference to the url to which the viewId "' + newViewId + '" is associated. An entry must be made in the optional viewDirectory option or a "data-url" valid attribute must be appended to the link in which this request originated from.');
                    }

                    resetHash(_currentViewId);
                }
            }

            _newViewUrl = null;
        };

        var appendViewElements = function (view) {

            var viewInner = view.find('[data-view-inner]');

            if (!viewInner) {
				view.find('[data-view]').wrapInner('<div data-view-inner />');
				viewInner = view.find('[data-view-inner]');
			}
			
			$(viewInner).append('<div style="height: 0px; clear: both;"/>');
        };

        var switchView = function (viewAdded, overrideTransitionTrigger) {

            _inTransition = true;
            _transitionHolding = true;

            if (viewAdded) {
                _newView.css({
                    'position': 'absolute',
                    'z-index': -1,
                    'left': 0,
                    'top': 0
                });
                _currentView.after(_newView);

                uk.utils.log('MM INFO: "' + _newViewId + '" View created');

                _newView.trigger('viewcreate', [_newViewId]);
                uk.events.fireViewManagerEvent('viewcreate', [_newViewId, _currentViewId]);
            }
            else {

                uk.utils.log('MM INFO: "' + _newViewId + '" View loaded');

                _newView.trigger('viewload', [_newViewId]);
                uk.events.fireViewManagerEvent('viewload', [_newViewId, _currentViewId]);
            }
			
			$(document.activeElement).blur();

            _currentView.trigger('viewunload', [_currentViewId]);
            uk.events.fireViewManagerEvent('viewunload', [_currentViewId]);

            if (!self.options.useTransitionTriggers || overrideTransitionTrigger) transitionViews();
        };

        var transitionViews = function () {

            if (_transitionHolding) {

                $(window).scrollTop(0);

                var transitionSpec = getTransitionSpec(_newViewTransition);
				_newViewTransition = null;

                var viewDefaults = {
                    'display': 'block',
                    'width': '100%'
                }

                _newView.css(jQuery.extend(viewDefaults, transitionSpec.newView.setup));
                _currentView.css(jQuery.extend(viewDefaults, transitionSpec.currentView.setup));

                if (_useTransforms) {

                    _newView.css(transitionSpec.newView.start.css3);
                    _currentView.css(transitionSpec.currentView.start.css3);
                }
                else {

                    _newView.css(transitionSpec.newView.start.js);
                    _currentView.css(transitionSpec.currentView.start.js);
                }

                setViewHeights();

                _newView.trigger('viewafterload', [_newViewId, _currentViewId]);
                uk.events.fireViewManagerEvent('viewafterload', [_newViewId, _currentViewId]);

                document.title = _newView.data('title');

                var newViewTransform;
                var currentViewTransform;

                // TODO: Manage transition end when multiple tweens occur (i.e. both newView and currentView)

                if (_useTransforms) {

                    newViewTransform = transitionSpec.newView.end.css3;
                    currentViewTransform = transitionSpec.currentView.end.css3;

                    if (newViewTransform) {
                        uk.utils.css3.setTransitions(_newView, _transition);
                        _newView.css(newViewTransform);
                    }
                    else if (currentViewTransform) {
                        uk.utils.css3.setTransitions(_currentView, _transition);
                        _currentView.css(currentViewTransform);
                    }
                }
                else {

                    newViewTransform = transitionSpec.newView.end.js;
                    currentViewTransform = transitionSpec.currentView.end.js;

                    if (newViewTransform) _newView.animate(newViewTransform, self.options.transitionDuration * 1000, endTransition)
                    else if (currentViewTransform) _currentView.animate(currentViewTransform, self.options.transitionDuration * 1000, endTransition)
                }
            }
            else {
                setViewHeights();
            }
        };

        var endTransition = function (evt) {

            _currentView.stop(true).unbind();

            _currentView.css({
				'display': 'none',
                'position': 'relative',
                'top': 0,
                'left': 0,
                'z-index': -1,
				'opacity': 1
            });

			_currentView.css(uk.utils.css3.getTransform('none'));
			
            _newView.css({
                'position': 'relative',
                'top': 0,
                'left': 0,
                'z-index': 1,
				'opacity': 1
            });
			
			_newView.css(uk.utils.css3.getTransform('none'));

            if (_useTransforms) uk.utils.css3.clearTransitions(_currentView);

            _currentView = _newView;
            _currentViewId = _newViewId;

            _newView = null;
            _newViewId = null;

            _inTransition = false;
            _transitionHolding = false;

            setViewHeights();

            uk.events.fireViewManagerEvent('viewtransitioncomplete', [_currentViewId]);
			
			// Check to ensure hash has not changed during transition
			var activeViewId = String(window.location.hash).split('#');
			activeViewId = activeViewId[activeViewId.length - 1] ? activeViewId[activeViewId.length - 1] : null;
			activeViewId = activeViewId.split('?')[0];

			loadView(activeViewId, null, true);
        };

        var setViewHeights = function () {

            var viewHeight;
            var pageHeight;

            var headerHeight = _header.outerHeight(true);
            var footerHeight = _footer.outerHeight(true);

            var totalReduction = (headerHeight + footerHeight);

            if (self.options.maxHeight) {
                viewHeight = self.options.maxHeight;
            }
            else {
				var viewTarget = _currentView;
                viewTarget = viewTarget.find('[data-view-inner]');
                viewHeight = viewTarget.outerHeight(true);
            }

            var pageHeight = $(window).height();

            _interfaceHeight = (pageHeight > viewHeight + totalReduction) ? pageHeight : viewHeight + totalReduction;
            pageHeight -= totalReduction;

            _viewHeight = (pageHeight > viewHeight) ? pageHeight : viewHeight;
            _pageHeight = pageHeight;

            // IE height fix
            if (uk.utils.detect.IE()) {
                _pageHeight -= 1;
                _viewHeight -= 1;
                _interfaceHeight -= 1;
            }

            if (self.options.lockHeight || _inTransition) {

                $('[data-view]').css({
                    'height': _viewHeight,
                    'min-height': 0
                });
            }
            else {
                $('[data-view]').css({
                    'height': 'auto',
                    'min-height': _pageHeight
                });
            }

            uk.events.fireViewManagerEvent('viewresize', [_viewHeight, _pageHeight, _interfaceHeight]);
        };

        var getTransitionSpec = function (transitionType) {

            transitionType = (transitionType) ? transitionType : self.options.defaultTransition;

            var spec = {
                newView: { setup: {}, start: {}, end: {} },
                currentView: { setup: {}, start: {}, end: {} }
            };

            switch (transitionType) {
                /* NOTE: Transition template
                case 'x':
                    // New View
                    spec.newView.setup = {};

                    spec.newView.start.css3 = {};
                    spec.newView.start.js = {};

                    spec.newView.end.css3 = {};
                    spec.newView.end.js = {};

                    // Current View
                    spec.currentView.setup = {};

                    spec.currentView.start.css3 = {};
                    spec.currentView.start.js = {};

                    spec.currentView.end.css3 = {};
                    spec.currentView.end.js = {};
                break;*/
                case self.TRANSITION_FADE:
                    // New View
                    spec.newView.setup = { 'position': 'relative', 'z-index': 1 };

                    spec.newView.start.css3 = { 'opacity': 1 };
                    spec.newView.start.js = { 'opacity': 1 };

                    // Current View
                    spec.currentView.setup = { 'position': 'absolute', 'z-index': 100 };

                    spec.currentView.start.css3 = { 'opacity': 1 };
                    spec.currentView.start.js = { 'opacity': 1 };

                    spec.currentView.end.css3 = { 'opacity': 0 };
                    spec.currentView.end.js = { 'opacity': 0 };
                break;
                default:
                    // New View
                    spec.newView.setup = { 'position': 'relative', 'z-index': 1 };

                    spec.newView.start.css3 = uk.utils.css3.getTransform('translateX(0)');
                    spec.newView.start.js = { 'left': 0 };

                    // Current View
                    spec.currentView.setup = { 'position': 'absolute', 'z-index': 100 }

                    spec.currentView.start.css3 = uk.utils.css3.getTransform('translateX(0)');
                    spec.currentView.start.js = { 'left': 0 };

                    spec.currentView.end.css3 = uk.utils.css3.getTransform('translateX(-100%)');
                    spec.currentView.end.js = { 'left': '-100%' };
                break;
            }

            return spec;
        };

        var setViewDetails = function (id) {

            document.title = _currentView.data('title');
        };

        var resetHash = function (id) {

            window.location.hash = id.replace(/\s/g, '-');
        };

        // Public Functions
        self.changeView = function (viewId, viewUrl, viewTransition) {

            _newViewUrl = viewUrl;
            _newViewTransition = viewTransition;

            window.location = viewId;
        };

        self.resizeView = function (evt) {

            setViewHeights();
        };

        self.cancelView = function () {

            if (_transitionHolding) {

                _inTransition = false;
                _transitionHolding = false;

                _newView.css({
                    'position': 'relative',
                    'top': 0,
                    'left': 0,
                    'z-index': -1,
                    'display': 'none'
                });

                window.location = '#' + _currentViewId;

                uk.events.fireViewManagerEvent('viewcanceled', [_currentViewId]);
            }
        };

        // Getters
        self.getViewHeight = function () {

            return _viewHeight;
        };

        self.getPageHeight = function () {

            return _pageHeight;
        };
    };

} (jQuery));