(function ($, Modernizr) {

    "use strict";

    /**************************************************************

    Script		: MandoMobile - ViewManager
    Version		: 1.5
    Authors		: Matt Robinson

    **************************************************************/

    var MMViewManager = window["MMViewManager"] = function (options) {

        this.getOptions = function () {

            var options = {
                lockHeight: true,
                maxHeight: false,
                transitionDuration: 0.5,
                useTransitionTriggers: false,
                viewDirectory: null
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.useTransforms = Modernizr.csstransitions && Modernizr.csstransforms;

            this.inTransition = false;
            this.transitionHolding = false;
            this.request;
            this.viewIdArr = new Array();

            this.pageHeight = 0;
            this.viewHeight = 0;

            this.currentView;
            this.currentViewId;

            this.newView;
            this.newViewId;
            this.newViewUrl;

            this.build();
            this.addEvents();

            this.activate();
        };

        this.build = function () {

            this.containerElem = $('[data-view]');

            this.header = $('[data-header]');
            this.footer = $('[data-footer]');

            $(this.containerElem.wrap('<div id="view_wrapper" data-view-wrapper/>'));
            this.container = $('[data-view-wrapper]');

            this.container.css({
                'width': '100%',
                'position': 'relative',
                'z-index': 1
            });

            if (this.useTransforms) {

                this.transEndEventName = mm.utils.css3.getTransEndEventName();
                this.transition = String(mm.utils.css3.getTransformStyle() + ' ' + this.options.transitionDuration + 's ease-in-out 0s');
            }
        };

        this.addEvents = function () {

            $(window).on('resize', function () {
                if (this.inTransition) {
                    this.currentView.stop(true, true);
                }

                this.resizeView()
            }.bind(this));

            $(window).on('scroll', this.repositionView.bind(this));
            $(window).on('load', this.resizeView.bind(this));

            if (this.options.useTransitionTriggers) {
                mm.events.addViewManagerEvent('viewready', this.transitionViews.bind(this));
                mm.events.addViewManagerEvent('viewcancel', this.cancelView.bind(this));
            }

            $(document).on(this.transEndEventName, function (evt) {

                var evtTarget = $(evt.target);
                if (evtTarget.is('[data-view]')) this.endTransition(evt);

            } .bind(this));

            $(window).on('hashchange', function (evt) {

                if (!this.inTransition) {
								
					try {

						var newViewId = (evt && evt.newURL) ? evt.newURL.split('#') : String(window.location.hash).split('#');
						newViewId = newViewId[newViewId.length - 1] ? newViewId[newViewId.length - 1] : null;
						newViewId = newViewId.split('?')[0];

						var oldViewId = (evt && evt.oldURL) ? evt.oldURL.split('#') : null;
						oldViewId = (oldViewId && oldViewId[oldViewId.length - 1]) ? oldViewId[oldViewId.length - 1] : null;
						oldViewId = (oldViewId) ? oldViewId.split('?')[0] : this.currentViewId;
					}
					catch (err) {

						mm.utils.log('MM ERROR: The view "' + newViewId + '" is not registered in this application.');
						mm.utils.log(err);
					}

					if (newViewId) this.loadView(newViewId, oldViewId);
				}

            } .bind(this));

            $(document).on('tap', 'a[data-url]', function (evt) {

                /*if (this.inTransition) {
                    evt.preventDefault();
                }
                else {*/

                    var target = $(evt.target);
                    var targetUrl = target.attr('data-url');
                    var targetId = target.attr('href').split('#');
                    targetId = targetId[targetId.length - 1] ? targetId[targetId.length - 1] : null;

                    this.newViewUrl = targetUrl;
                //}
            } .bind(this));
        };

        this.activate = function () {

            this.currentView = this.containerElem;
            this.currentViewId = this.currentView.attr('data-view');

            this.currentView.data('title', $('title').text());

            this.appendViewElements(this.currentView);

            this.viewIdArr.push(this.currentViewId);

            mm.events.fireViewManagerEvent('viewcreate', [this.currentViewId])
            this.currentView.trigger('viewcreate', [this.currentViewId]);

            this.setViewHeights();

            this.resetHash(this.currentViewId);

            if (window.location.hash) {

                $(window).trigger('hashchange');
            }
        };

        this.resizeView = function (evt) {

            this.setViewHeights();
        };

        this.repositionView = function (evt) {

            mm.events.fireViewManagerEvent('viewscroll');
        };

        this.changeView = function (viewId, viewUrl) {

            this.newViewUrl = viewUrl;
            window.location = viewId;
        };

        this.loadView = function (newViewId, oldViewId, overrideTransitionTrigger) {

            if (this.currentViewId != newViewId) {

                var viewIndex = this.viewIdArr.indexOf(newViewId);

                var url = this.newViewUrl;

                if (!url && this.options.viewDirectory) {
                    var viewMatch = this.options.viewDirectory[mm.utils.indexOfPropValue(this.options.viewDirectory, 'viewId', newViewId)];
                    url = (viewMatch) ? viewMatch.viewUrl : null;
                }

                if (viewIndex == -1 && url) {

                    mm.events.fireViewManagerEvent('viewbeforenewload');

                    var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

                    var scriptData;
                    var viewTitle;

                    if (this.request) this.request.abort();

                    this.request = $.ajax({
                        url: url,
                        dataType: 'html',
                        success: function (data, textStatus, jqXHR) {
                            
                            scriptData = $(data).filter('[data-script]');
                            viewTitle = $(data).filter('title').text();

                            this.newView = $("<div>").append(data.replace(rscript, "")).find('[data-view]').append(scriptData);
                            this.newView.data('title', viewTitle);

                            this.appendViewElements(this.newView);

                            this.newViewId = this.newView.attr('data-view');

                            mm.events.fireViewManagerEvent('viewbeforeload', [this.newViewId, this.currentViewId]);

                            this.viewIdArr.push(this.newViewId);

                            mm.events.fireViewManagerEvent('viewafternewload', [this.newViewId, this.currentViewId]);

                            this.switchView(true, overrideTransitionTrigger);
                            this.request = null;

                        } .bind(this),
                        error: function (jqXHR, textStatus, errorThrown) {
                            
                            mm.utils.log(jqXHR);

                            this.resetHash(oldViewId);
                            mm.events.fireViewManagerEvent('viewafternewload', [oldViewId, oldViewId])

                        } .bind(this)
                    });
                }
                else if (viewIndex >= 0) {

                    var selector = '[data-view="' + this.viewIdArr[viewIndex] + '"]';

                    this.newView = $(selector);
                    this.newViewId = this.viewIdArr[viewIndex];

                    mm.events.fireViewManagerEvent('viewbeforeload', [this.newViewId, this.currentViewId]);

                    this.switchView(false, overrideTransitionTrigger);
                }
                else {

                    if (!url) {
                        mm.utils.log('MM ERROR: The application has no reference to the url to which the viewId "' + newViewId + '" is associated. An entry must be made in the optional viewDirectory option or a "data-url" valid attribute must be appended to the link in which this request originated from.');
                    }

                    this.resetHash(this.currentViewId);
                }
            }

            this.newViewUrl = null;
        };

        this.appendViewElements = function (view) {

            var viewInner = view.find('[data-view-inner]');

            if (!viewInner) {
				view.find('[data-view]').wrapInner('<div data-view-inner />');
				viewInner = view.find('[data-view-inner]');
			}
			
			$(viewInner).append('<div style="height: 0px; clear: both;"/>');
        };

        this.switchView = function (viewAdded, overrideTransitionTrigger) {

            this.inTransition = true;
            this.transitionHolding = true;

            if (viewAdded) {
                this.newView.css({
                    'position': 'absolute',
                    'z-index': -1,
                    'left': 0,
                    'top': 0
                });
                this.currentView.after(this.newView);

                this.newView.trigger('viewcreate', [this.newViewId]);
                mm.events.fireViewManagerEvent('viewcreate', [this.newViewId, this.currentViewId]);
            }
            else {
                this.newView.trigger('viewload', [this.newViewId]);
                mm.events.fireViewManagerEvent('viewload', [this.newViewId, this.currentViewId]);
            }

            $(document.activeElement).blur();
            
            this.currentView.trigger('viewunload', [this.currentViewId]);
            mm.events.fireViewManagerEvent('viewunload', [this.currentViewId]);

            if (!this.options.useTransitionTriggers || overrideTransitionTrigger) this.transitionViews();
        };

        this.cancelView = function () {

            if (this.transitionHolding) {

                this.inTransition = false;
                this.transitionHolding = false;

                this.newView.css({
                    position: 'relative',
                    display: 'none'
                });

                window.location = '#' + this.currentViewId;

                mm.events.fireViewManagerEvent('viewcanceled', [this.currentViewId]);
            }
        };

        this.transitionViews = function () {

            if (this.transitionHolding) {

                //this.setViewHeights();

                $(window).scrollTop(0);

                this.newView.css({
                    'display': 'block',
                    'position': 'relative',
                    'top': 0,
                    'width': '100%',
                    'z-index': 1               
                });

                this.currentView.css({
                    'position': 'absolute',
                    'transform': 'translateX(0)',
                    'top': 0,
                    'width': '100%',
                    'z-index': 100
                });

                if (this.useTransforms) {

                    this.newView.css(mm.utils.css3.getTransform('translateX(0)'));
                    this.currentView.css(mm.utils.css3.getTransform('translateX(0)'));
                }
                else {
                    this.newView.css({ 'left': 0 });
                    this.currentView.css({ 'left': 0 });
                }

                this.setViewHeights();

                this.newView.trigger('viewafterload', [this.newViewId, this.currentViewId]);
                mm.events.fireViewManagerEvent('viewafterload', [this.newViewId, this.currentViewId]);

                document.title = this.newView.data('title');

                var trans;

                if (this.useTransforms) {

                    var trans = mm.utils.css3.getTransform('translateX(-100%)');

                    mm.utils.css3.setTransitions(this.currentView, this.transition);
                    this.currentView.css(trans);
                }
                else {

                    trans = { 'left': '-100%' };
                    this.currentView.animate(trans, this.options.transitionDuration * 1000, this.endTransition.bind(this))
                }
            }
            else {
                this.setViewHeights();
            }
        };

        this.endTransition = function (evt) {

            this.currentView.stop(true).unbind();

            this.currentView.css({
                position: 'relative',
                display: 'none'
            });

            if (this.useTransforms) mm.utils.css3.clearTransitions(this.currentView);

            this.currentView = this.newView;
            this.currentViewId = this.newViewId;

            this.newView = null;
            this.newViewId = null;

            this.inTransition = false;
            this.transitionHolding = false;

            this.setViewHeights();

            mm.events.fireViewManagerEvent('viewtransitioncomplete', [this.currentViewId]);
			
			// Check to ensure hash has not changed during transition
			var activeViewId = String(window.location.hash).split('#');
			activeViewId = activeViewId[activeViewId.length - 1] ? activeViewId[activeViewId.length - 1] : null;
			activeViewId = activeViewId.split('?')[0];

			this.loadView(activeViewId, null, true);
        };

        this.setViewHeights = function () {

            var viewHeight;
            var pageHeight;

            var headerHeight = this.header.outerHeight(true);
            var footerHeight = this.footer.outerHeight(true);

            var totalReduction = (headerHeight + footerHeight);

            if (this.options.maxHeight) {
                viewHeight = this.options.maxHeight;
            }
            else {
				var viewTarget = this.currentView;
                viewTarget = viewTarget.find('[data-view-inner]');
                viewHeight = viewTarget.outerHeight(true);
            }

            var pageHeight = $(window).height();

            this.interfaceHeight = (pageHeight > viewHeight + totalReduction) ? pageHeight : viewHeight + totalReduction;
            pageHeight -= totalReduction;

            this.viewHeight = (pageHeight > viewHeight) ? pageHeight : viewHeight;
            this.pageHeight = pageHeight;

            // IE height fix
            if (mm.utils.detect.IE()) {
                this.pageHeight -= 1;
                this.viewHeight -= 1;
                this.interfaceHeight -= 1;
            }

            if (this.options.lockHeight || this.inTransition) {

                $('[data-view]').css({
                    'height': this.viewHeight,
                    'min-height': 0
                });
            }
            else {
                $('[data-view]').css({
                    'height': 'auto',
                    'min-height': this.pageHeight
                });
            }

            mm.events.fireViewManagerEvent('viewresize', [this.viewHeight, this.pageHeight, this.interfaceHeight]);
        };

        this.getViewHeight = function () {

            return this.viewHeight;
        };

        this.getPageHeight = function () {

            return this.pageHeight;
        };

        this.setViewDetails = function (id) {

            document.title = this.currentView.data('title');
        };

        this.resetHash = function (id) {

            window.location.hash = id.replace(/\s/g, '-');
        };
    };

} (jQuery, Modernizr));