(function ($, MandoMobile) {

    "use strict";

    /**************************************************************

    Script		: MandoMobileConfig

    **************************************************************/

    window.mm = new MandoMobile({
        plugins: {
            optionalPluginDirectory: [
				//{ name: 'ScrollBox', src: '/scripts/mm/plugins/scrollbox.js', selectorTrigger: '[data-scroll-area]' },
				//{ name: 'StarRating', src: '/scripts/mm/plugins/starRating.js', selectorTrigger: '[data-star-rating]' },
				{ name: 'Placeholders', src: '/scripts/mm/plugins/placeholders.js', selectorTrigger: '[placeholder]', options: {
				    ignore: ['[data-datepicker]']
				}},
				{ name: 'MediaResponder', src: '/scripts/mm/plugins/mediaResponder.js' }
            ]
        },
        views: {
            lockHeight: false,
            useTransitionTriggers: true
        }
    });

    $(mm).one('platformready', function () {

        mm.utils.log('MM INFO: MandoMobile Framework Ready');
        mm.plugins.mediaResponder = mm.plugins.pluginManager.activatePlugin('MediaResponder', [{ mediaOptions: [320, 800] }]);

        $(mm.plugins.mediaResponder).on('postbreakpoint', function (evt, breakPoint) {

            if (breakPoint == 800) {
                mm.nav.slideNav.setLock(true, mm.nav.slideNav.CLOSED);
            }
            else {
                mm.nav.slideNav.setLock(false);
            }
        });

    });

    $(mm).one('platformload', function () {

        mm.utils.log('MM INFO: MandoMobile Framework Loaded');
    });
	
}(jQuery, MandoMobile));