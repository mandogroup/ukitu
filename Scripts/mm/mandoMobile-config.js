(function ($, MandoMobile) {

    "use strict";

    /**************************************************************

    Script		: MandoMobileConfig

    **************************************************************/

	window.mm = new MandoMobile({
		plugins: {
		    optionalPluginDirectory: [
				{ name: 'Calendar', src: '/scripts/mm/plugins/calendar.js', selectorTrigger: '[data-calendar]' },
				{ name: 'ScrollBox', src: '/scripts/mm/plugins/scrollbox.js', selectorTrigger: '[data-scroll]' },
				{ name: 'StarRating', src: '/scripts/mm/plugins/starRating.js', selectorTrigger: '[data-star-rating]' },
				{ name: 'Placeholders', src: '/scripts/mm/plugins/placeholders.js', selectorTrigger: '[placeholder]' },
                { name: 'ShowToggle', src: '/scripts/mm/plugins/showToggle.js', selectorTrigger: '[data-show-toggle]',
                    callback: function (showToggle, view) { 
								
                        view.live('viewunload', function (evt) {
                            showToggle.hide();
                        });
                    }
                },
                { name: 'MediaResponder', src: '/scripts/mm/plugins/mediaResponder.js' }
			]
		}
	});
	
	mm.init();
	
	$(mm).one('platformready', function () {

	    mm.plugins.mediaResponder = mm.plugins.activatePlugin('MediaResponder');
	});

	$(mm).one('platformload', function () {

	});
	
} (jQuery, MandoMobile));