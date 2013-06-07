(function ($) {

    "use strict";

    /**************************************************************

    Script		: Ukitu
    Version		: 1.10
    Authors		: Matt Robinson

    **************************************************************/

	var Ukitu = window["Ukitu"] = function (options) {

	    var self = this;

	    // Private vars
	    var _loadQueue;
	    var _pluginDirectory;

	    var _loadCounter;
	    var _loadRatio;
	    var _loadProgress;

	    var _appWrapper;
			
	    var _loadStatus;
	    var _loadProgressText;
	    var _loadProgressBar;

        // Options
        var getOptions = function () {

            var options = {
				modules: {
					locationUrl: '/scripts/uk/modules'
				},
				plugins: {
                    locationUrl: '/scripts/uk/plugins',
					autoInitPlugins: true,
					corePluginDirectory: [
						{ name: 'CheckToggle', src: '/checkToggle.js', selectorTrigger: '[data-check-toggle]' },
						{ name: 'RadioToggle', src: '/radioToggle.js', selectorTrigger: '[data-radio-toggle]' },
						{ name: 'RangeSelector', src: '/rangeSelector.js', selectorTrigger: '[data-range-selector]' }
					],
					optionalPluginDirectory: null
				},
				views: {
					lockHeight: false,
					maxHeight: false,				
					transitionDuration: 0.5,
                    defaultTransition: 'swipe',
					useTransitionTriggers: false,
					viewDirectory: [
						//{ viewId: 'index', viewUrl: 'index.html'}
					]
				},
				overlay: {
					alertControlsOkText: 'OK',
					alertControlsCancelText: 'Cancel',
					alertControlsInline: true,
					enableFade: true,
					fadeDuration: 0.5,
					overlayIndex: 2
				},
				slideNav: {
					openWidth: '260px',
					transitionDuration: 0.5
				}
            };
			
            return options;
        };

        // Init
        self.init = function () {
		
			self.options = jQuery.extend(true, getOptions(), options);
			
			for(var option in options) {
				
				if(options[option] instanceof Array) {
					self.options[option] = options[option];
				}
			};
			
			_loadQueue = [
                self.options.modules.locationUrl + "/ukitu-namespaces.js",
				self.options.modules.locationUrl + "/ukitu-touch.js",
                self.options.modules.locationUrl + "/jquery.effects.core.js",
				self.options.modules.locationUrl + "/ukitu-viewManager.js",
				self.options.modules.locationUrl + "/ukitu-pluginManager.js",
				self.options.modules.locationUrl + "/ukitu-viewOverlay.js",
                self.options.modules.locationUrl + "/ukitu-slideNav.js"
			];
			
			_pluginDirectory = self.options.plugins.corePluginDirectory.concat(self.options.plugins.optionalPluginDirectory);
			
			loadPlugins(_pluginDirectory);
			
			_loadCounter = 0;
			_loadRatio = 100 / _loadQueue.length;
			_loadProgress = 0;
			
			startLoad();
		};
		
        // Private Functions
		var loadPlugins = function (pluginArr) {
			
			for(var plugin in pluginArr) {
				_loadQueue.push(self.options.plugins.locationUrl + pluginArr[plugin].src);
			}
		};
		
		var registerPlugins = function (pluginArr) {
		
			for(var plugin in pluginArr) {
				if(window[pluginArr[plugin].name]) uk.plugins.pluginManager.registerPlugin(pluginArr[plugin]);
			}
		};

		var startLoad = function () {
			
		    if ($('body > [data-app-wrapper]').length == 0) {
				$('body').wrapInner('<div data-app-wrapper />');
		    }

		    _appWrapper = $('body > [data-app-wrapper]');
		    _appWrapper.after('<div data-load-status><p>Loading <span data-progress-text class="uk-loader-text"></span></p><div data-progress-indicator class="uk-progress-indicator"><div data-progress-bar class="uk-progress-bar"></div></div></div>');

			_loadStatus = $('[data-load-status]');
			_loadProgressText = $(_loadStatus.find('[data-progress-text]')[0]);
			_loadProgressBar = $(_loadStatus.find('[data-progress-bar]')[0]);
			
			_appWrapper.css({
				visibility: 'hidden',
				height: 0,
				overflow: 'hidden',
				opacity: 0
			});
			
			_loadStatus.css({
				position: 'absolute',
				top: 0,
				left: 0
			});

			$(window).resize(resizeHandler);
			resizeHandler();
			
			updateProgress(0);
			
			loadItem(_loadCounter);
		};
		
		var loadItem = function (loadIndex) {
		
			updateProgress(loadIndex);
			
			if(loadIndex < _loadQueue.length) {
			
				$.ajax({
					url: _loadQueue[loadIndex],
					dataType: "script",
					cache: true,
					success: function (jqXHR) {
					    _loadCounter++;
					    loadItem(_loadCounter);
					},
					error: function (jqXHR) {
					    if (typeof console == "object") { console.log(jqXHR); }
						throw new Error('MM ERROR: There has been an issue loading one of the Ukitu Framework Modules at: "' + _loadQueue[loadIndex] + '"');
					}
				});
			}
			else {
				
				instantiateModules();
			}
		};
		
		var instantiateModules = function () {

		    var pluginManager = uk.plugins.pluginManager = new MMPluginManager(self.options.plugins);
			var viewManager = uk.views.viewManager = new MMViewManager(self.options.views);
			var overlay = uk.overlays.viewOverlay = new MMViewOverlay(self.options.overlay);
			var slideNav = uk.nav.slideNav = new MMSlideNav(self.options.slideNav);
			
			completeLoad();
		};
		
		var updateProgress = function (index) {
			
			_loadProgress = Math.round(index * _loadRatio);
			_loadProgressText.text(_loadProgress + '%');
			
			_loadProgressBar.css('width', _loadProgress + '%');
		
		};
		
		var completeLoad = function () {
			
			uk.utils.log('MM INFO: Initiate Ukitu Framework');
			
			_appWrapper.css({
				visibility: 'visible',
				height: 'auto',
				overflow: 'auto',
				opacity: 1
			});
			
			_loadStatus.remove();
		
			try {
				// Start Modules
				uk.overlays.viewOverlay.init();
				uk.plugins.pluginManager.init();
				registerPlugins(_pluginDirectory);
				
				uk.utils.log('MM INFO: Ukitu Framework Ready');
				$(self).trigger('platformready');

				uk.views.viewManager.init();
				uk.nav.slideNav.init();

				uk.utils.log('MM INFO: Ukitu Framework Loaded');
				$(self).trigger('platformload');
			} 
			catch (err) {
				uk.utils.log('MM ERROR: Error initiating Ukitu Framework');
				uk.utils.log(err);
			}
		}

		var resizeHandler = function () {

		    _loadStatus.css('top', $(window).height() / 2 - (_loadStatus.outerHeight() / 2));
		};
    };
	
} (jQuery));