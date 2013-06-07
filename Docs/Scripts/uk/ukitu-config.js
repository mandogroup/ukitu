(function ($, Ukitu) {

    "use strict";

    /**************************************************************

    Script		: UkituConfig

    **************************************************************/

    window.uk = new Ukitu({
        plugins: {
            optionalPluginDirectory: [
				{ name: 'Calendar', src: '/calendar.js', selectorTrigger: '[data-calendar]' },
				{ name: 'ScrollBox', src: '/scrollbox.js', selectorTrigger: '[data-scroll]' },
				{ name: 'StarRating', src: '/starRating.js', selectorTrigger: '[data-star-rating]' },
				{ name: 'Placeholders', src: '/placeholders.js', selectorTrigger: '[placeholder]' },
				{ name: 'MediaResponder', src: '/mediaResponder.js' }
            ]
        }
    });

    $(function () { uk.init(); });

    $(uk).one('platformready', function () {

        uk.plugins.mediaResponder = uk.plugins.pluginManager.activatePlugin('MediaResponder');
    });

    $(uk).one('platformload', function () {

        uk.plugins.pluginManager.activatePlugin('ScrollBox', [$('[data-slide-nav] [data-scroll]'), {
            portHeight: 'fluid',
            portWidth: 'fluid',
            enableContentDrag: true,
            directionControls: false,
            scrollBarWeight: 6,
            scrollBoxGutter: 3,
            scrollContentPadding: 3
        }]);

        $('[data-slide-nav]').on('mousedown', 'a', function (evt) { evt.preventDefault(); });
    });

}(jQuery, Ukitu));
