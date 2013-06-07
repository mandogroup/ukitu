(function ($) {

    "use strict";

    /**************************************************************

    Script		: RadioToggle
    Version		: 1.0
    Authors		: Matt Robinson

    **************************************************************/

    var RadioToggle = window["RadioToggle"] = function (container, options) {

        this.getOptions = function () {

            var options = {

            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.container = container;

            this.build();
        };

        this.build = function () {

            var radios = container.find('input[type="radio"]');
            var labels = container.find('label');

            this.radiosArr = new Array();

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

                        button = this.container.find('[data-radio-button]');
                        button = button[button.length - 1];

                        radioButton = new RadioToggleButton(button, radio, lbl, this.options);
                        if ($(radio).attr('checked')) {
                            radioButton.update();
                            this.currentButton = radioButton;
                        }

                        $(radioButton).on('checked', function (evt) {

                            if (this.currentButton != evt.target) {
                                if (this.currentButton) this.currentButton.update();
                                this.currentButton = evt.target;
                            }
                        } .bind(this));

                        this.radiosArr.push(radioButton);
                    };

                } .bind(this));

            } .bind(this));
        };

        this.rebuild = function () {

            $(this.radiosArr).each(function (i, radio) {

                radio.destroy();
            });

            this.build();
        };

        this.updateLabels = function () {

            $(this.radiosArr).each(function (i, el) {
                el.updateLabel();
            });
        };

        this.init();
    };


    var RadioToggleButton = function (button, radio, label, options) {

        this.init = function () {

            this.options = options;

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

            if (mm.utils.detect.touch()) {

                this.button.on('touchstart', function (evt) {

                    evt.preventDefault();
                    this.radio.attr('checked', true);

                    this.radio.change();

                } .bind(this));

            }
            else {

                this.button.on('click', function (evt) {

                    evt.preventDefault();
                    this.radio.attr('checked', true);

                    this.radio.change();

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

            this.button.text(this.label.text());
        };

        this.destroy = function () {

            if (mm.utils.detect.touch()) {

                this.button.off('touchstart');
            }
            else {

                this.button.off('click');
            }

            this.radio.off('change', this.update.bind(this));

            this.button.remove();
        };

        this.init();
    };

} (jQuery));