(function ($) {

    "use strict";

    /**************************************************************

    Script		: CheckToggle
    Version		: 1.0
    Authors		: Matt Robinson

    **************************************************************/

    var CheckToggle = window["CheckToggle"] = function (container, options) {

        this.getOptions = function () {

            var options = {

            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.container = container;
		    this.checksArr;
		
            this.build();
        };

        this.build = function () {

		    this.checksArr = [];
	
            var checks = container.find('input[type="checkbox"]');
            var labels = container.find('label');

            var checkButton;
            var labelMatch;
            var button;

            $(checks).each(function (i, check) {

                $(labels).each(function (j, lbl) {

                    if ($(check).attr('id') == $(lbl).attr('for')) {

					    if ($(lbl).attr('class')) {
                            $(lbl).parent().append('<a href="#" class="' + $(lbl).attr('class') + '" data-check-button>' + $(lbl).text() + '</a>');
                        }
                        else {
                            $(lbl).parent().append('<a href="#" data-check-button>' + $(lbl).text() + '</a>');
                        }

					    button = this.container.find('[data-check-button]');
                        button = button[button.length - 1];

                        checkButton = new CheckToggleButton(button, check, lbl, this.options);
					    this.checksArr.push(checkButton);

                        checkButton.update();
                    };

                } .bind(this));

            } .bind(this));
        };
	
	    this.rebuild = function () {
	
		    $(this.checksArr).each(function (i, check) {
			
			    check.destroy();
		    });
		
		    this.build();
        };

        this.updateLabels = function () {

            $(this.checksArr).each(function (i, el) {
                el.updateLabel();
            });
        };

        this.init();
    };

    var CheckToggleButton = function (button, check, label, options) {

        this.init = function () {

            this.options = options;

            this.button = $(button);
            this.check = $(check);
            this.label = $(label);

            this.build();
            this.addEvents();
        };

        this.build = function () {

            this.check.css({ 'display': 'none' });
            this.label.css({ 'display': 'none' });

            this.check.data('control', this);
        };

        this.addEvents = function () {

            if (mm.utils.detect.touch()) {

                this.button.on('touchstart', function (evt) {

                    evt.preventDefault();

                    if (this.check.attr('checked')) {
                        this.check.attr('checked', false);
                    }
                    else {
                        this.check.attr('checked', true);
                    }

                    this.check.change();

                } .bind(this));

            }
            else {

                this.button.on('click', function (evt) {

                    evt.preventDefault();

                    if (this.check.attr('checked')) {
                        this.check.attr('checked', false);
                    }
                    else {
                        this.check.attr('checked', true);
                    }

                    this.check.change();

                } .bind(this));
            }

            this.check.on('change', this.update.bind(this));

        };

        this.update = function () {

            if (this.check.attr('checked')) {
                this.button.addClass('checked');
                $(this).trigger('checked');
            }
            else {
                this.button.removeClass('checked');
            }
        };

        this.updateLabel = function () {

            this.button.text(this.label.text());
        };
	
	    this.destroy = function () {
	
		    if (mm.utils.detect.touch()) {

                this.button.off('touchstart');
            }
            else {

                this.button.off('click');
            }

            this.check.off('change', this.update.bind(this));
		
		    this.button.remove();
	    };

        this.init();
    };

} (jQuery));