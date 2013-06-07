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
                {
                    name: 'ShowToggle', src: '/showToggle.js', selectorTrigger: '[data-show-toggle]',
                    callback: function (showToggle, view) {

                        view.live('viewunload', function (evt) {
                            showToggle.hide();
                        });
                    }
                },
                { name: 'MediaResponder', src: '/mediaResponder.js' }
            ]
        }
    });

    $(function () { uk.init(); });

    $(uk).one('platformready', function () {

        uk.plugins.mediaResponder = uk.plugins.activatePlugin('MediaResponder');
    });

    $(uk).one('platformload', function () {

    });

}(jQuery, Ukitu));