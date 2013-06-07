(function ($) {
    "use strict";

    /**************************************************************

    Script		: MandoMobile - Overlay
    Version		: 1.1
    Authors		: Matt Robinson

    **************************************************************/

    var MMViewOverlay = window["MMViewOverlay"] = function (options) {

        this.getOptions = function () {

            var options = {
                alertControlsOkText: 'OK',
                alertControlsCancelText: 'Cancel',
                alertControlsInline: true,
                enableFade: true,
                fadeDuration: 0.5,
                overlayIndex: 1
            };

            return options;
        };

        this.init = function () {

            this.options = jQuery.extend(true, this.getOptions(), options);

            this.activeContentElement = null;

            this.alertOkCallback = null;
            this.alertCancelCallback = null;

            this.build();
            this.addEvents();
        };

        this.build = function () {

            $(document.body).append('<div data-overlay data-state="inactive"></div>');
            //$('[data-app-wrapper]').append('<div data-overlay data-state="inactive"></div>');
            this.overlay = $('[data-overlay]');

            this.overlay.append('<div data-overlay-blackout></div>');
            this.blackout = $('[data-overlay-blackout]');

            this.overlay.append('<div data-overlay-content-container><a href="#" data-overlay-close>Close</a></div>');
            this.content = $('[data-overlay-content-container]');
            this.overlayClose = $('[data-overlay-close]');

            this.overlay.append('<div data-overlay-alert><div data-overlay-alert-message></div><div data-overlay-alert-controls><button data-overlay-alert-ok>' + this.options.alertControlsOkText + '</button><button data-overlay-alert-cancel>' + this.options.alertControlsCancelText + '</button></div></div>');

            this.alert = $('[data-overlay-alert]');
            this.alertMessage = $('[data-overlay-alert-message]');
            this.alertControls = $('[data-overlay-alert-controls]');
            this.alertOk = $('[data-overlay-alert-ok]');
            this.alertCancel = $('[data-overlay-alert-cancel]');

            this.overlay.css({
                'display': 'none',
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'width': '100%',
                'height': '100%',
                'z-index': this.options.overlayIndex
            });

            if (this.options.enableFade) {

                this.overlay.css('opacity', 0);
            }

            if (this.options.enableFade && mm.utils.css3.useTransitions()) {

                var transition = String('opacity ' + this.options.fadeDuration + 's ease-in-out 0s');
                mm.utils.css3.setTransitions(this.overlay, transition);
            }

            this.blackout.css({
                'width': '100%',
                'height': '100%'
            });

            this.content.css({
                'position': 'absolute',
                'display': 'none'
            });

            this.alert.css({
                'position': 'absolute',
                'display': 'none'
            });

            // Injest all overlay content elements
            $('[data-overlay-content]').each(function (i, el) {

                this.content.append(el);
                $(el).css('display', 'none');

            }.bind(this));

            $(this).trigger('overlaybuilt');
        };

        this.addEvents = function () {

            mm.events.addViewManagerEvent('viewresize', this.rescaleOverlay.bind(this));
            //mm.events.addViewManagerEvent('viewscroll', this.repositionOverlay.bind(this));
            mm.events.addViewManagerEvent('viewbeforenewload', function () { this.show(false, false, true); }.bind(this));
            mm.events.addViewManagerEvent('viewafternewload', function () { this.hide() }.bind(this));

            this.overlayClose.on('tap', function (evt) {

                evt.preventDefault();
                this.hide();

            }.bind(this));

            this.alertOk.on('tap', function (evt) {

                if (this.alertOkCallback) this.alertOkCallback();

                if (this.activeContentElement) this.hideAlert();
                else this.hide();

            }.bind(this));

            this.alertCancel.on('tap', function (evt) {

                if (this.alertCancelCallback) this.alertCancelCallback();

                if (this.activeContentElement) this.hideAlert();
                else this.hide();

            }.bind(this));

            /*this.blackout.on('tap', function (evt) {

                this.hide();
            }.bind(this));*/

            $(document).on('keypress', function (evt) {

                var code = (evt.keyCode ? evt.keyCode : evt.which);
                // On pressing 'esc'
                if (code == 27) {
                    this.hide();
                }
            }.bind(this));

            if (this.options.enableFade && mm.utils.css3.useTransitions()) {

                this.overlay.on(mm.utils.css3.getTransitionEnd(), function (evt) {

                    var evtTarget = $(evt.target);
                    if (evtTarget.is('[data-overlay]')) this.endTransition();

                }.bind(this));
            }
        };

        this.show = function (instantShow, contentElement, loading) {

            if (contentElement) this.showContentElement(contentElement);
            else if (loading) this.showLoading();

            this.showOverlay(instantShow);
        };

        this.showContentElement = function (contentElement) {

            this.hideLoading();
            this.content.css('display', 'block');

            if (this.activeContentElement) this.activeContentElement.css('display', 'none');

            this.activeContentElement = $('[data-overlay-content=' + contentElement + ']');
            if (this.activeContentElement) this.activeContentElement.css('display', 'block');
        };

        this.showLoading = function () {

            this.blackout.addClass('loading');
        };

        this.showAlert = function (message, options) {

            this.alertMessage.html(message);

            this.hideLoading();
            this.alert.css('display', 'block');

            var displayType = (this.options.alertControlsInline) ? 'inline-block' : 'block';

            this.alertOkCallback = null;
            this.alertCancelCallback = null;

            if (!options) {
                this.alertOk.css('display', displayType);
                this.alertCancel.css('display', 'none');
            }
            else {
                if (options.ok) {
                    this.alertOk.css('display', displayType);
                    this.alertOkCallback = options.ok;
                }
                else {
                    this.alertOk.css('display', 'none');
                }

                if (options.hasOwnProperty('cancel')) {
                    this.alertCancel.css('display', displayType);
                    this.alertCancelCallback = options.cancel;
                }
                else {
                    this.alertCancel.css('display', 'none');
                }
            }

            this.showOverlay();
        };

        this.showOverlay = function (instantShow) {

            if (this.overlay.attr('data-state') == 'inactive') {

                $(this).trigger('overlayopen');

                this.overlay.attr('data-state', 'active');
                this.overlay.css('display', 'block');

                //mm.views.resizeView();

                var duration = (instantShow) ? 0 : this.options.fadeDuration;

                if (this.options.enableFade && mm.utils.css3.useTransitions()) {

                    this.overlay[0].offsetWidth;
                    this.overlay.css('opacity', 1);
                }
                else if (this.options.enableFade) {

                    this.overlay.stop();

                    this.overlay.animate({
                        'opacity': 1
                    }, duration * 1000);
                }
                else {
                    this.endTransition();
                }
            }
        };

        this.hide = function () {

            this.hideOverlay();
        };

        this.hideContentElement = function () {

            this.content.css('display', 'none');

            if (this.activeContentElement) {

                this.activeContentElement.css('display', 'none');
                this.activeContentElement = null;
            }
        };

        this.hideLoading = function () {

            this.blackout.removeClass('loading');
        };

        this.hideAlert = function () {

            this.alert.css('display', 'none');

            this.alertMessage.html('');
        };

        this.hideOverlay = function () {

            if (this.overlay.attr('data-state') == 'active') {

                this.overlay.attr('data-state', 'inactive');

                // Check implemented to ensure any quick successions are captured.
                if (this.overlay.css('opacity') == 0) {

                    this.endTransition();
                }
                else {

                    if (this.options.enableFade && mm.utils.css3.useTransitions()) {

                        this.overlay.css('opacity', 0);
                    }
                    else if (this.options.enableFade) {

                        this.overlay.stop();

                        this.overlay.animate({
                            'opacity': 0
                        }, this.options.fadeDuration * 1000, this.endTransition.bind(this));
                    }
                    else {
                        this.endTransition();
                    }
                }
            }
        };

        this.endTransition = function () {

            if (this.overlay.attr('data-state') == 'inactive') {

                this.overlay.css('display', 'none');

                this.hideContentElement();
                this.hideLoading();
                this.hideAlert();

                //mm.views.resizeView();

                $(this).trigger('overlayclose');
            };
        };

        this.rescaleOverlay = function (viewHeight, pageHeight, interfaceHeight) {

            this.overlay.css({
                'width': '100%',
                'height': '100%'
                //'height': $(window).height()
                //'height': (window.innerHeight ? window.innerHeight : $(window).height())
            });

            this.content.css({
                'left': String(Number(($(window).width() / 2) - (this.content.outerWidth() / 2)) + 'px'),
                'top': String(Number(($(window).height() / 2) - (this.content.outerHeight() / 2)) + 'px')
            });

            this.alert.css({
                'left': String(Number(($(window).width() / 2) - (this.alert.outerWidth() / 2)) + 'px'),
                'top': String(Number(($(window).height() / 2) - (this.alert.outerHeight() / 2)) + 'px')
            });

        }.bind(this);

        this.repositionOverlay = function () {

            this.overlay.css({
                'top': $(window).scrollTop()
            });
        };
    };

}(jQuery));