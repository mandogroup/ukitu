(function ($) {

    "use strict";

    /**************************************************************

    Script		: Placeholders
    Authors		: Matt Robinson

    **************************************************************/

    var Placeholders = window["Placeholders"] = function (input, options) {

        var self = this;

        // Private vars
        var _input;

        // Options
        var getOptions = function () {

            var options = {
                ignore: [],
                className: 'placeholder'
            };

            return options;
        };

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);
            _input = input;

            var i = document.createElement('input');

            if (!('placeholder' in i)) {
                addEvents();
            };
        };

        var addEvents = function () {

            if (_input.attr('type') != "password") {

                var ignoreFlag = false;
                var ignoreTest;

                for (var i = 0; i < self.options.ignore.length; i++) {

                    ignoreTest = self.options.ignore[i];

                    if (_input.is(ignoreTest)) {
                        ignoreFlag = true;
                        break;
                    }
                };

                if (!ignoreFlag) {

                    var placeholderValue = _input.attr('placeholder');

                    _input.val(placeholderValue);

                    _input.addClass(self.options.className);

                    _input.focus(function () {

                        if (_input.val() == placeholderValue) {

                            _input.val('');
                            _input.removeClass('placeholder')
                        }
                    });

                    _input.blur(function () {

                        if (_input.val() == '' || _input.val() == placeholderValue) {

                            _input.val(placeholderValue);
                            _input.addClass('placeholder');
                        }
                    });
                }
            }
        };

        self.init();

    };

}(jQuery));