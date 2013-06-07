(function ($) {

    "use strict";

    /**************************************************************

    Script		: StarRating
    Version		: 1.0
    Authors		: Phil Gilligan / Matt Robinson

    **************************************************************/

    var StarRating = window["StarRating"] = function (container, options) {

	this.getOptions = function () {
		
		var options = {
			
		};

        return options;
    };

    this.init = function () {

        this.options = jQuery.extend(true, this.getOptions(), options);

        this.container = container;

        this.build();
        this.addEvents();
    };

    this.build = function () {

        var radios = container.find('input[type="radio"]');
        var labels = container.find('label');

        this.starsArr = new Array();

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

                    button = this.container.find('.star_button');
                    button = button[button.length - 1];

                    starButton = new StarButton(counter, button, radio, lbl, this.options);
                    if ($(radio).attr('checked')) {
                        starButton.update();
                        this.currentButton = starButton;

                        this.fillStars(this.currentButton.index);
                    }

                    $(starButton).on('checked', function (evt) {

                        if (this.currentButton != evt.target) {
                            if (this.currentButton) this.currentButton.update();
                            this.currentButton = evt.target;
                            this.fillStars(this.currentButton.index);
                        }
                    } .bind(this));

                    this.starsArr.push(starButton);

                    counter++;
                };

            } .bind(this));

        } .bind(this));
    };

    this.rebuild = function () {

        $(this.starsArr).each(function (i, star) {

            star.off('hoveron');
            star.off('hoveroff');

            star.destroy();
        });

        this.container.off('mouseleave');

        this.build();
        this.addEvents();
    };

    this.updateLabels = function () {

        $(this.starsArr).each(function (i, el) {
            el.updateLabel();
        });
    };

    this.addEvents = function () {

        $(this.container).on('mouseleave', function (evt) {
            this.clearStars();

            if (this.currentButton) {
                this.fillStars(this.currentButton.index);
            }
        } .bind(this));

        $(this.starsArr).each(function (i, star) {

            $(star).on('hoveron', function (evt) {

                this.fillStars(i);

            } .bind(this));

            $(star).on('hoveroff', function (evt) {

                this.clearStars();

            } .bind(this));
        } .bind(this));
    };

    this.fillStars = function (starIndex) {

        this.clearStars();

        $(this.starsArr).each(function (j, star) {

            if (j <= starIndex) {
                star.showStar();
            }
        });
    };

    this.clearStars = function () {

        $(this.starsArr).each(function (j, star) {

            star.hideStar();
        });
    };

    this.init();
};


var StarButton = function (index, button, radio, label, options) {

    this.init = function () {

        this.options = options;

        this.index = index;
        this.button = $(button);
        this.radio = $(radio);
        this.label = $(label);

        this.build();
        this.addEvents();
    };

    this.build = function () {

        this.radio.css({ 'display': 'none' });
        this.label.css({ 'display': 'none' });

        this.radio.data('control', this);
    };

    this.addEvents = function () {

        if (Modernizr.touch) {

            this.button[0].addEventListener('touchstart', function (evt) {

                evt.preventDefault();
                this.radio.attr('checked', true);

                this.radio.change();

            } .bind(this), false);

        }
        else {

            this.button.on('click', function (evt) {

                evt.preventDefault();
                this.radio.attr('checked', true);

                this.radio.change();

            } .bind(this));

            this.button.on('mouseenter', function (evt) {

                $(this).trigger('hoveron');

            } .bind(this));

            this.button.on('mouseleave', function (evt) {

                $(this).trigger('hoveroff');

            } .bind(this));
        }

        this.radio.on('change', function (evt) {

            this.update();

        } .bind(this));

    };

    this.update = function () {

        if (this.radio.attr('checked')) {
            this.button.addClass('checked');
            $(this).trigger('checked');
        }
        else {
            this.button.removeClass('checked');
        }
    };

    this.updateLabel = function () {

        $(this.button.find('span')[0]).text(this.label.text());
    };

    this.showStar = function () {

        this.button.addClass('star');
    };

    this.hideStar = function () {

        this.button.removeClass('star');
    };

    this.destroy = function () {

        if (Modernizr.touch) {

            this.button[0].removeEventListener('touchstart');
        }
        else {

            this.button.off('click');
            this.button.off('mouseenter');
            this.button.off('mouseleave');
        }

        this.radio.off('change', this.update.bind(this));

        this.button.remove();
    };

    this.init();
};

} (jQuery));