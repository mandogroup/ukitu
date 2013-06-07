(function ($) {

    "use strict";

    /**************************************************************

    Script		: Placeholders
    Version		: 1.0
    Authors		: Phil Gilligan / Heidi Crook

    **************************************************************/

    var Placeholders = window["Placeholders"] = function (input, options) {

        this.getOptions = function () {

            var options = {
                ignore: [],
                className: 'placeholder'
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);
            this.input = input;

            var i = document.createElement('input');

            if (!('placeholder' in i)) {
                this.addEvents();
            };
        };

        this.addEvents = function () {

            if (this.input.attr('type') != "password") {

                var ignoreFlag = false;
                var ignoreTest;

                for (var i = 0; i < this.options.ignore.length; i++) {

                    ignoreTest = this.options.ignore[i];

                    if (this.input.is(ignoreTest)) {
                        ignoreFlag = true;
                        break;
                    }
                };

                if (!ignoreFlag) {

                    var placeholderValue = this.input.attr('placeholder');

                    this.input.val(placeholderValue);

                    this.input.addClass(this.options.className);

                    this.input.focus(function () {

                        if (this.input.val() == placeholderValue) {

                            this.input.val('');
                            this.input.removeClass('placeholder')
                        }
                    }.bind(this));

                    this.input.blur(function () {

                        if (this.input.val() == '' || this.input.val() == placeholderValue) {

                            this.input.val(placeholderValue);
                            this.input.addClass('placeholder');
                        }
                    }.bind(this));
                }
            }
        };

        this.init();

    };

}(jQuery));