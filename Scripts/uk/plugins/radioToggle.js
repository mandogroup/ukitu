(function ($) {

    "use strict";

    /**************************************************************

    Script		: RadioToggle
    Authors		: Matt Robinson

    **************************************************************/

    var RadioToggle = window["RadioToggle"] = function (container, options) {

        var self = this;

        // Private vars
        var _container;
        var _radiosArr;
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
        };

        // Private Functions
        var build = function () {

            var radios = container.find('input[type="radio"]');
            var labels = container.find('label');

            _radiosArr = new Array();

            var radioButton;
            var labelMatch;
            var button;

            $(radios).each(function (i, radio) {

                $(labels).each(function (j, lbl) {

                    if ($(radio).attr('id') == $(lbl).attr('for')) {

                        if ($(lbl).attr('class')) {
                            $(lbl).parent().append('<a href="#" class="' + $(lbl).attr('class') + '" data-radio-button>' + $(lbl).html() + '</a>');
                        }
                        else {
                            $(lbl).parent().append('<a href="#" data-radio-button>' + $(lbl).html() + '</a>');
                        }

                        button = _container.find('[data-radio-button]');
                        button = button[button.length - 1];

                        radioButton = new RadioToggleButton(button, radio, lbl, self.options);
                        if ($(radio).attr('checked')) {
                            radioButton.update();
                            _currentButton = radioButton;
                        }

                        $(radioButton).on('checked', function (evt) {

                            if (_currentButton != evt.target) {
                                if (_currentButton) _currentButton.update();
                                _currentButton = evt.target;
                            }
                        } );

                        _radiosArr.push(radioButton);
                    };

                } );

            } );
        };

        // Public Functions
        self.rebuild = function () {

            $(_radiosArr).each(function (i, radio) {

                radio.destroy();
            });

            build();
        };

        self.updateLabels = function () {

            $(_radiosArr).each(function (i, el) {
                el.updateLabel();
            });
        };

        self.init();
    };


    var RadioToggleButton = function (button, radio, label, options) {

        var self = this;

        // Private vars
        var _button;
        var _radio;
        var _label;

        // Init
        self.init = function () {

            self.options = options;

            _button = $(button);
            _radio = $(radio);
            _label = $(label);

            build();
            addEvents();
        };

        // Private Functions
        var build = function () {

            _radio.css({ 'display': 'none' });
            _label.css({ 'display': 'none' });

            _radio.data('control', self);
        };

        var addEvents = function () {

            if (uk.utils.detect.touch()) {

                _button.on('touchstart', function (evt) {

                    evt.preventDefault();
                    _radio.attr('checked', true);

                    _radio.change();

                } );

            }
            else {

                _button.on('click', function (evt) {

                    evt.preventDefault();
                    _radio.attr('checked', true);

                    _radio.change();

                } );
            }

            _radio.on('change', self.update);

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

            _button.text(_label.text());
        };

        self.destroy = function () {

            if (uk.utils.detect.touch()) {

                _button.off('touchstart');
            }
            else {

                _button.off('click');
            }

            _radio.off('change', update);

            _button.remove();
        };

        self.init();
    };

} (jQuery));