(function ($) {

    "use strict";

    /**************************************************************

    Script		: StarRating
    Authors		: Matt Robinson

    **************************************************************/

    var StarRating = window["StarRating"] = function (container, options) {

        var self = this;

        // Private vars
        var _container;
        
        var _starsArr;
        var _currentButton;

        // Options
	    var getOptions = function () {
		
		    var options = {
			
		    };

            return options;
        };

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            _container = container;

            build();
            addEvents();
        };

        // Private Functions
        var build = function () {

            var radios = container.find('input[type="radio"]');
            var labels = container.find('label');

            _starsArr = new Array();

            var starButton;
            var labelMatch;
            var button;

            var counter = 0;

            $(radios).each(function (i, radio) {

                $(labels).each(function (j, lbl) {

                    if ($(radio).attr('id') == $(lbl).attr('for')) {

                        if ($(lbl).attr('class')) {
                            $(lbl).parent().append('<a href="#" class="star_button ' + $(lbl).attr('class') + '"><span>' + $(lbl).text() + '</span></a>');
                        }
                        else {
                            $(lbl).parent().append('<a href="#" class="star_button"><span>' + $(lbl).text() + '</span></a>');
                        }

                        button = _container.find('.star_button');
                        button = button[button.length - 1];

                        starButton = new StarButton(counter, button, radio, lbl, self.options);
                        if ($(radio).attr('checked')) {
                            starButton.update();
                            _currentButton = starButton;

                            fillStars(_currentButton.index);
                        }

                        $(starButton).on('checked', function (evt) {

                            if (_currentButton != evt.target) {
                                if (_currentButton) _currentButton.update();
                                _currentButton = evt.target;
                                fillStars(_currentButton.index);
                            }
                        } );

                        _starsArr.push(starButton);

                        counter++;
                    };

                } );

            } );
        };

        var addEvents = function () {

            $(_container).on('mouseleave', function (evt) {
                clearStars();

                if (_currentButton) {
                    fillStars(_currentButton.index);
                }
            } );

            $(_starsArr).each(function (i, star) {

                $(star).on('hoveron', function (evt) {

                    fillStars(i);

                } );

                $(star).on('hoveroff', function (evt) {

                    clearStars();

                } );
            } );
        };

        var fillStars = function (starIndex) {

            clearStars();

            $(_starsArr).each(function (j, star) {

                if (j <= starIndex) {
                    star.showStar();
                }
            });
        };

        var clearStars = function () {

            $(_starsArr).each(function (j, star) {

                star.hideStar();
            });
        };

        // Public Functions
        self.rebuild = function () {

            $(_starsArr).each(function (i, star) {

                star.off('hoveron');
                star.off('hoveroff');

                star.destroy();
            });

            _container.off('mouseleave');

            build();
            addEvents();
        };

        self.updateLabels = function () {

            $(_starsArr).each(function (i, el) {
                el.updateLabel();
            });
        };

        self.init();
    };


    var StarButton = function (index, button, radio, label, options) {

        var self = this;

        // Private vars
        var _index;
        var _button;
        var _radio;
        var _label;

        // Init
        self.init = function () {

            self.options = options;

            _index = index;
            _button = $(button);
            _radio = $(radio);
            _label = $(label);

            build();
            addEvents();
        };

        var build = function () {

            _radio.css({ 'display': 'none' });
            _label.css({ 'display': 'none' });

            _radio.data('control', self);
        };

        var addEvents = function () {

            if (uk.utils.detect.touch()) {

                _button[0].addEventListener('touchstart', function (evt) {

                    evt.preventDefault();
                    _radio.attr('checked', true);

                    _radio.change();

                } , false);

            }
            else {

                _button.on('click', function (evt) {

                    evt.preventDefault();
                    _radio.attr('checked', true);

                    _radio.change();

                } );

                _button.on('mouseenter', function (evt) {

                    $(self).trigger('hoveron');

                } );

                _button.on('mouseleave', function (evt) {

                    $(self).trigger('hoveroff');

                } );
            }

            _radio.on('change', function (evt) {

                self.update();

            } );

        };

        // Public Functions
        self.update = function () {

            if (_radio.attr('checked')) {
                _button.addClass('checked');
                $(self).trigger('checked');
            }
            else {
                _button.removeClass('checked');
            }
        };

        self.updateLabel = function () {

            $(_button.find('span')[0]).text(_label.text());
        };

        self.showStar = function () {

            _button.addClass('star');
        };

        self.hideStar = function () {

            _button.removeClass('star');
        };

        self.destroy = function () {

            if (uk.utils.detect.touch()) {

                _button[0].removeEventListener('touchstart');
            }
            else {

                _button.off('click');
                _button.off('mouseenter');
                _button.off('mouseleave');
            }

            _radio.off('change', self.update);

            _button.remove();
        };

        self.init();
    };

} (jQuery));