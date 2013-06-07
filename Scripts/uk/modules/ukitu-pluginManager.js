(function ($) {

    "use strict";

    /**************************************************************

    Script		: Ukitu - PluginManager
    Authors		: Matt Robinson

    **************************************************************/

    var MMPluginManager = window["MMPluginManager"] = function (options) {

        var self = this;

        // Private vars
        var _pluginDirectory;

        var getOptions = function () {

            var options = {
                autoInitPlugins: true
            };

            return options;
        };

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);
			_pluginDirectory = [];

            addEvents();
        };

        // Private Functions
        var addEvents = function () {

            if (self.options.autoInitPlugins) uk.events.addViewManagerEvent('viewcreate', activatePlugins);
        };

        var activatePlugins = function (targetViewId) {

            var targetView = $('[data-view="' + targetViewId + '"]');

			for(var plugin in _pluginDirectory) {
				
				plugin = _pluginDirectory[plugin];
				
				targetView.find(plugin.selectorTrigger).each(function(i, el) { 
					var instance = self.activatePlugin(plugin, [$(el), plugin.options]);
					if(plugin.callback) plugin.callback(instance, targetView);
					
				});
			
			};
			
			/*activatePlugin({ 
				name: 'Calendar', 
				src: '/scripts/uk/plugins/calendar.js' }, 
				[$('[data-calendar]')]
			);*/
        };


        var constructInstance = function (constructor, args) {

            var instance = function () {
                return constructor.apply(this, args);
            }
            instance.prototype = constructor.prototype;

            return new instance();
        };

        // Public Functions
        self.registerPlugin = function (pluginObj) {

            _pluginDirectory.push(pluginObj);
        };

		self.activatePlugin = function (plugin, pluginParams) {
		
			if(typeof(plugin) == String || !plugin.hasOwnProperty('name')) {
				plugin = { name: plugin }; 
			}
			
			try { 
				if(uk.utils.indexOfPropValue(_pluginDirectory, 'name', plugin.name) >= 0) {
					return constructInstance(window[plugin.name], pluginParams);
				}
				else {
					$.ajax({
						url: plugin.src,
						dataType: "script",
						cache: true,
						success: function (jqXHR) { 
							_pluginDirectory.push(plugin);
							return constructInstance(window[plugin.name], pluginParams);
						},
						error: function (jqXHR) { 
							throw new Error('MM ERROR: There has been an issue loading the specified "' + plugin.name + '" plugin.');
						}
					});
				}
			}
			catch (err) {
				uk.utils.log(err);
			}
		};
    };

} (jQuery));