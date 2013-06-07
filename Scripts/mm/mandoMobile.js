(function ($) {

    "use strict";

    /**************************************************************

    Script		: MandoMobile
    Version		: 1.2
    Authors		: Matt Robinson

    **************************************************************/

	var MandoMobile = window["MandoMobile"] = function (options) {

        this.getOptions = function () {

            var options = {
				plugins: {
					autoInitPlugins: true,
					corePluginDirectory: [
						{ name: 'Calendar', src: '/scripts/mm/plugins/calendar.js', selectorTrigger: '[data-calendar]' },
						{ name: 'CheckToggle', src: '/scripts/mm/plugins/checkToggle.js', selectorTrigger: '[data-check-toggle]' },
						{ name: 'RadioToggle', src: '/scripts/mm/plugins/radioToggle.js', selectorTrigger: '[data-radio-toggle]' },
						{ name: 'RangeSelector', src: '/scripts/mm/plugins/rangeSelector.js', selectorTrigger: '[data-range-selector]' },
						{ name: 'ShowToggle', src: '/scripts/mm/plugins/showToggle.js', selectorTrigger: '[data-show-toggle]', 
							callback: function (showToggle, view) { 
								
								view.live('viewunload', function (evt) {
									showToggle.hide();
								});
							}
						}
					],
					optionalPluginDirectory: null
				},
				views: {
					lockHeight: false,
					transitionDuration: 0.5,
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
                "/scripts/mm/modernizr.js",
                "/scripts/mm/jquery.effects.core.js",
                "/scripts/mm/mandoMobile-namespaces.js",
				"/scripts/mm/mandoMobile-utils.js",
                "/scripts/mm/mandoMobile-touch.js",
				"/scripts/mm/mandoMobile-viewManager.js",
				"/scripts/mm/mandoMobile-pluginManager.js",
				"/scripts/mm/mandoMobile-viewOverlay.js",
                "/scripts/mm/mandoMobile-slideNav.js"
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
					    if (mm.utils) mm.utils.log(jqXHR);
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
			var overlay = mm.views.viewOverlay = new MMViewOverlay(this.options.overlay);
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
				mm.views.viewOverlay.init();
				mm.plugins.pluginManager.init();
				this.registerPlugins(this.pluginDirectory);
				
				$(this).trigger('platformready');

				mm.views.viewManager.init();
				mm.nav.slideNav.init();

				$(this).trigger('platformload');
			} 
			catch (err) {
				mm.utils.log('MM ERROR: Error initiating MandoMobile Framework');
				mm.utils.log(err);
			}
		}
	
		this.init();
    };
	
} (jQuery));