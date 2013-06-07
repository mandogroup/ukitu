(function ($) {

	"use strict";

	/**************************************************************

		Script		: MediaResponder
		Version		: 1.1
		Authors		: Matt Robinson

	**************************************************************/

	var MediaResponder = window["MediaResponder"] = function (options) {

		this.getOptions = function () {

			var options = {
			    mediaOptions: [480, 640, 768, 1024],
                responseTime: 250
			};

			return options;
		};

		this.init = function () {

		    this.options = jQuery.extend(true, this.getOptions(), options);

			for (var option in options) {
				
				if(options[option] instanceof Array) {
					this.options[option] = options[option];
				}
			};

			this.currentMediaOption;
			this.timeout;

			this.organiseMediaOptions();
			
			this.addEvents();
			this.resizeHandler();
		};
		
		this.organiseMediaOptions = function () {
		
			this.options.mediaOptions.sort(function(a,b){return a - b});
		};
		
		this.addEvents = function () {
			
		    $(window).bind('resize', this.resizeHandler.bind(this));
		};
		
		this.resizeHandler = function (evt) {
		
			var windowWidth = $(window).width();
			
			var mediaOption = this.options.mediaOptions[0];
		
			$(this.options.mediaOptions).each(function (i, item) {
				if(item <= windowWidth) mediaOption = item;
			}.bind(this));
			
			if(mediaOption != this.currentMediaOption) {
				this.currentMediaOption = mediaOption;
				
				mm.utils.log('MM INFO: Breakpoint ' + this.currentMediaOption + ' hit.');

				$(this).trigger('breakpoint', [this.currentMediaOption, windowWidth]);

				clearTimeout(this.timeout);
				this.timeout = setTimeout(function () { $(this).trigger('postbreakpoint', [this.currentMediaOption, windowWidth]); }.bind(this), this.options.responseTime);
			}
		};

		this.init();
	};

} (jQuery));