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
				{ name: 'MediaResponder', src: '/scripts/mm/plugins/mediaResponder.js' }
			]
		}
	});
	
	mm.init();
	
	$(mm).one('platformready', function () {
		
	    mm.plugins.mediaResponder = mm.plugins.pluginManager.activatePlugin('MediaResponder');
	});

	$(mm).one('platformload', function () {

	    mm.plugins.pluginManager.activatePlugin('ScrollBox', [$('[data-slide-nav] [data-scroll]'), {
	        portHeight: 'fluid',
			portWidth: 'fluid',
			enableContentDrag: true,
			directionControls: false,
			scrollBarWeight: 6,
			scrollBoxGutter: 3,
			scrollContentPadding: 3
	    }]);
		
		$('[data-slide-nav]').on('mousedown', 'a', function(evt) { evt.preventDefault(); });
	});
	
} (jQuery, MandoMobile));