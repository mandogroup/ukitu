(function ($) {

	"use strict";

	/**************************************************************

		Script		: MediaResponder
		Authors		: Matt Robinson

	**************************************************************/

	var MediaResponder = window["MediaResponder"] = function (options) {

	    var self = this;

        // Private vars
	    var _currentMediaOption;
	    var _timeout;

        // Options
		var getOptions = function () {

			var options = {
			    mediaOptions: [480, 640, 768, 1024],
                responseTime: 250
			};

			return options;
		};

        // Init
		self.init = function () {

		    self.options = jQuery.extend(true, getOptions(), options);

		    for (var option in options) {

		        if (options[option] instanceof Array) {
		            self.options[option] = options[option];
		        }
		    };

			organiseMediaOptions();
			
			addEvents();
			resizeHandler();
		};
		
        // Private Functions
		var organiseMediaOptions = function () {
		
			self.options.mediaOptions.sort(function(a,b){return a - b});
		};
		
		var addEvents = function () {
			
		    $(window).on('resize', resizeHandler);
		};
		
		var resizeHandler = function (evt) {

			var windowWidth = $(window).width();

			var mediaOption = self.options.mediaOptions[0];
		
			$(self.options.mediaOptions).each(function (i, item) {
				if(item <= windowWidth) mediaOption = item;
			});
			
			if(mediaOption != _currentMediaOption) {
				_currentMediaOption = mediaOption;
				
				uk.utils.log('MM INFO: Breakpoint ' + _currentMediaOption + ' hit.');

				$(self).trigger('breakpoint', [_currentMediaOption, windowWidth]);

				clearTimeout(_timeout);
				_timeout = setTimeout(function () { $(self).trigger('postbreakpoint', [_currentMediaOption, windowWidth]); }, self.options.responseTime);
			}
		};

		self.init();
	};

} (jQuery));