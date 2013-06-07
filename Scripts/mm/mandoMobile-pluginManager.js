(function ($, Modernizr) {

    "use strict";

    /**************************************************************

    Script		: MandoMobile - PluginManager
    Version		: 1.0
    Authors		: Matt Robinson

    **************************************************************/

    var MMPluginManager = window["MMPluginManager"] = function (options) {

        this.getOptions = function () {

            var options = {
                autoInitPlugins: true
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);
			this.pluginDirectory = [];

            this.addEvents();
        };

        this.addEvents = function () {

            if (this.options.autoInitPlugins) mm.events.addViewManagerEvent('viewcreate', this.activatePlugins.bind(this));
        };

        this.activatePlugins = function (targetViewId) {

            var targetView = $('[data-view="' + targetViewId + '"]');

			for(var plugin in this.pluginDirectory) {
				
				plugin = this.pluginDirectory[plugin];
				
				targetView.find(plugin.selectorTrigger).each(function(i, el) { 
					var instance = this.activatePlugin(plugin, [$(el), plugin.options]);
					if(plugin.callback) plugin.callback(instance, targetView);
					
				} .bind(this));
			
			};
			
			/*this.activatePlugin({ 
				name: 'Calendar', 
				src: '/scripts/mm/plugins/calendar.js' }, 
				[$('[data-calendar]')]
			);*/
        };
		
		this.activatePlugin = function (plugin, pluginParams) {
		
			if(typeof(plugin) == String || !plugin.hasOwnProperty('name')) {
				plugin = { name: plugin }; 
			}
			
			try { 
				if(mm.utils.indexOfPropValue(this.pluginDirectory, 'name', plugin.name) >= 0) {
					return this.constructInstance(window[plugin.name], pluginParams);
				}
				else {
					$.ajax({
						url: plugin.src,
						dataType: "script",
						cache: true,
						success: function (jqXHR) { 
							this.pluginDirectory.push(plugin);
							return this.constructInstance(window[plugin.name], pluginParams);
						}.bind(this),
						error: function (jqXHR) { 
							throw new Error('MM ERROR: There has been an issue loading the specified "' + plugin.name + '" plugin.');
						}
					});
				}
			}
			catch (err) {
				mm.utils.log(err);
			}
		};
		
		this.constructInstance = function (constructor, args) {
		
			var instance = function() {
				return constructor.apply(this, args);
			}
			instance.prototype = constructor.prototype;
			
			return new instance();
		};
		
		this.registerPlugin = function (pluginObj) {
			
		    this.pluginDirectory.push(pluginObj);
		};
    };

} (jQuery, Modernizr));