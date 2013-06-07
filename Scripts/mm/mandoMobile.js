(function ($) {

    "use strict";

    /**************************************************************

    Script		: MandoMobile
    Version		: 1.9
    Authors		: Matt Robinson

    **************************************************************/

    // TODO: GLOBAL Remove 'this.' public referencing where it is unnecessary (across all modules and plugins), use var self = this this way '.bind' can be removed from utils
	var MandoMobile = window["MandoMobile"] = function (options) {

        this.getOptions = function () {

            var options = {
				modules: {
					locationUrl: '/scripts/mm/modules'
				},
				plugins: {
					autoInitPlugins: true,
					corePluginDirectory: [
						{ name: 'CheckToggle', src: '/scripts/mm/plugins/checkToggle.js', selectorTrigger: '[data-check-toggle]' },
						{ name: 'RadioToggle', src: '/scripts/mm/plugins/radioToggle.js', selectorTrigger: '[data-radio-toggle]' },
						{ name: 'RangeSelector', src: '/scripts/mm/plugins/rangeSelector.js', selectorTrigger: '[data-range-selector]' }
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

        this.init = function () {
		
			this.options = jQuery.extend(true, this.getOptions(), options);
			for(var option in options) {
				
				if(options[option] instanceof Array) {
					this.options[option] = options[option];
				}
			};
			
			this.modules = [
                this.options.modules.locationUrl + "/mandoMobile-namespaces.js",
				this.options.modules.locationUrl + "/mandoMobile-utils.js",
				this.options.modules.locationUrl + "/mandoMobile-touch.js",
                this.options.modules.locationUrl + "/jquery.effects.core.js",
				this.options.modules.locationUrl + "/mandoMobile-viewManager.js",
				this.options.modules.locationUrl + "/mandoMobile-pluginManager.js",
				this.options.modules.locationUrl + "/mandoMobile-viewOverlay.js",
                this.options.modules.locationUrl + "/mandoMobile-slideNav.js"
			];
			
			this.pluginDirectory = this.options.plugins.corePluginDirectory.concat(this.options.plugins.optionalPluginDirectory);
			
			this.loadPlugins(this.pluginDirectory);
			
			this.loadCounter = 0;
			this.loadRatio = 100 / this.modules.length;
			this.loadProgress = 0;
			
			$(this.startLoad.bind(this));
		};
		
		this.loadPlugins = function (pluginArr) {
			
			for(var plugin in pluginArr) {
				this.modules.push(pluginArr[plugin].src);
			}
		};
		
		this.registerPlugins = function (pluginArr) {
		
			for(var plugin in pluginArr) {
				if(window[pluginArr[plugin].name]) mm.plugins.pluginManager.registerPlugin(pluginArr[plugin]);
			}
		};
		
		this.startLoad = function () {
			
		    if ($('body > [data-app-wrapper]').length == 0) {
		        $('body').wrapInner('<div data-app-wrapper />');
		    }

		    this.appWrapper = $('body > [data-app-wrapper]');
			this.appWrapper.after('<div data-load-status><p>Loading <span data-progress-text></span></p><div data-progress-indicator><div data-progress-bar></div></div></div>');
			
			this.loadStatus = $('[data-load-status]');
			this.loadProgressText = $(this.loadStatus.find('[data-progress-text]')[0]);
			this.loadProgressBar = $(this.loadStatus.find('[data-progress-bar]')[0]);
			
			this.appWrapper.css({
				visibility: 'hidden',
				height: 0,
				overflow: 'hidden',
				opacity: 0
			});
			
			this.loadStatus.css({
				position: 'absolute',
				top: 0,
				left: 0
			});
			
			$(window).resize(this.resizeHandler.bind(this));
			this.resizeHandler();
			
			this.updateProgress(0);
			
			this.loadModule(this.loadCounter);
		};
		
		this.resizeHandler = function () {
		
			this.loadStatus.css('top', $(window).height() / 2 - (this.loadStatus.outerHeight() / 2));
		};
		
		this.loadModule = function (moduleIndex) {
		
			this.updateProgress(moduleIndex);
			
			if(moduleIndex < this.modules.length) {
			
				$.ajax({
					url: this.modules[moduleIndex],
					dataType: "script",
					cache: true,
					success: function (jqXHR) { 
						this.loadCounter++;
						this.loadModule(this.loadCounter);
					}.bind(this),
					error: function (jqXHR) {
					    if (typeof console == "object") { console.log(jqXHR); }
						throw new Error('MM ERROR: There has been an issue loading one of the MandoMobile Framework Modules at: "' + this.modules[moduleIndex] + '"');
					}.bind(this)
				});
			}
			else {
				
				this.instantiateModules();
			}
		};
		
		this.instantiateModules = function () {

		    var pluginManager = mm.plugins.pluginManager = new MMPluginManager(this.options.plugins);
			var viewManager = mm.views.viewManager = new MMViewManager(this.options.views);
			var overlay = mm.overlays.viewOverlay = new MMViewOverlay(this.options.overlay);
			var slideNav = mm.nav.slideNav = new MMSlideNav(this.options.slideNav);
			
			$(this.completeLoad.bind(this));
		};
		
		this.updateProgress = function (index) {
			
			this.loadProgress = Math.round(index * this.loadRatio);
			this.loadProgressText.text(this.loadProgress + '%');
			
			this.loadProgressBar.css('width', this.loadProgress + '%');
		
		};
		
		this.completeLoad = function () {
			
			mm.utils.log('MM INFO: Initiate MandoMobile Framework');
			
			this.appWrapper.css({
				visibility: 'visible',
				height: 'auto',
				overflow: 'auto',
				opacity: 1
			});
			
			this.loadStatus.remove();
		
			try {
				// Start Modules
				mm.overlays.viewOverlay.init();
				mm.plugins.pluginManager.init();
				this.registerPlugins(this.pluginDirectory);
				
				mm.utils.log('MM INFO: MandoMobile Framework Ready');
				$(this).trigger('platformready');

				mm.views.viewManager.init();
				mm.nav.slideNav.init();

				mm.utils.log('MM INFO: MandoMobile Framework Loaded');
				$(this).trigger('platformload');
			} 
			catch (err) {
				mm.utils.log('MM ERROR: Error initiating MandoMobile Framework');
				mm.utils.log(err);
			}
		}
    };
	
} (jQuery));