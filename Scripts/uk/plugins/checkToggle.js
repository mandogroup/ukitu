(function ($) {

    "use strict";

    /**************************************************************

    Script		: CheckToggle
    Authors		: Matt Robinson

    **************************************************************/

    var CheckToggle = window["CheckToggle"] = function (container, options) {

		var self = this;
		
		// Private vars
		var _container;
		var _checksArr;
		
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
		    _checksArr;
		
            build();
        };

		// Private Functions
        var build = function () {

		    _checksArr = [];
	
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

					    button = _container.find('[data-check-button]');
                        button = button[button.length - 1];

                        checkButton = new CheckToggleButton(button, check, lbl, self.options);
					    _checksArr.push(checkButton);

                        checkButton.update();
                    };

                } );

            } );
        };
	
		// Public Functions
	    self.rebuild = function () {
	
		    $(_checksArr).each(function (i, check) {
			
			    check.destroy();
		    });
		
		    build();
        };

	    self.updateLabels = function () {

	        $(_checksArr).each(function (i, el) {
	            el.updateLabel();
	        });
	    };

        self.init();
    };

    var CheckToggleButton = function (button, check, label, options) {
	
		var self = this;
	
		// Private vars
		var _button;
		var _check;
		var _label;
	
		// Init
        self.init = function () {

            self.options = options;

            _button = $(button);
            _check = $(check);
            _label = $(label);

            build();
            addEvents();
        };

		// Private Functions
        var build = function () {

            _check.css({ 'display': 'none' });
            _label.css({ 'display': 'none' });

            _check.data('control', self);
        };

        var addEvents = function () {

            if (uk.utils.detect.touch()) {

                _button.on('touchstart', function (evt) {

                    evt.preventDefault();

                    if (_check.attr('checked')) {
                        _check.attr('checked', false);
                    }
                    else {
                        _check.attr('checked', true);
                    }

                    _check.change();

                } );

            }
            else {

                _button.on('click', function (evt) {

                    evt.preventDefault();

                    if (_check.attr('checked')) {
                        _check.attr('checked', false);
                    }
                    else {
                        _check.attr('checked', true);
                    }

                    _check.change();

                } );
            }

            _check.on('change', self.update);

        };

		// Public Functions
        self.update = function () {

            if (_check.attr('checked')) {
                _button.addClass('checked');
                $(self).trigger('checked');
            }
            else {
                _button.removeClass('checked');
            }
        };

        self.updateLabel = function () {

            _button.text(_label.text());
        };
	
	    self.destroy = function () {
	
		    if (uk.utils.detect.touch()) {

                _button.off('touchstart');
            }
            else {

                _button.off('click');
            }

            _check.off('change', self.update);
		
		    _button.remove();
	    };

		self.init();
    };

} (jQuery));