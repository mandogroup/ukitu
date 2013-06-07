(function ($) {
    "use strict";

    /**************************************************************

    Script		: Ukitu - Overlay
    Authors		: Matt Robinson

    **************************************************************/

    var MMViewOverlay = window["MMViewOverlay"] = function (options) {

        var self = this;

        // Private vars
        var _overlay;
        var _blackout;
        var _content;

        var _overlayClose;

        var _activeContentElement;

        var _alert;
        var _alertMessage;
        var _alertControls;
        var _alertOk;
        var _alertOkCallback;
        var _alertCancel;
        var _alertCancelCallback;

        // Options
        var getOptions = function () {

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

        // Init
        self.init = function () {

            self.options = jQuery.extend(true, getOptions(), options);

            build();
            addEvents();
        };

        // Private Functions
        var build = function () {

            $(document.body).append('<div data-overlay data-state="inactive"></div>');
            //$('[data-app-wrapper]').append('<div data-overlay data-state="inactive"></div>');
            _overlay = $('[data-overlay]');

            _overlay.append('<div data-overlay-blackout></div>');
            _blackout = $('[data-overlay-blackout]');

            _overlay.append('<div data-overlay-content-container><a href="#" data-overlay-close>Close</a></div>');
            _content = $('[data-overlay-content-container]');
            _overlayClose = $('[data-overlay-close]');

            _overlay.append('<div data-overlay-alert><div data-overlay-alert-message></div><div data-overlay-alert-controls><button data-overlay-alert-ok>' + self.options.alertControlsOkText + '</button><button data-overlay-alert-cancel>' + self.options.alertControlsCancelText + '</button></div></div>');

            _alert = $('[data-overlay-alert]');
            _alertMessage = $('[data-overlay-alert-message]');
            _alertControls = $('[data-overlay-alert-controls]');
            _alertOk = $('[data-overlay-alert-ok]');
            _alertCancel = $('[data-overlay-alert-cancel]');

            _overlay.css({
                'display': 'none',
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'width': '100%',
                'height': '100%',
                'z-index': self.options.overlayIndex
            });

            if (self.options.enableFade) {

                _overlay.css('opacity', 0);
            }

            if (self.options.enableFade && uk.utils.css3.useTransitions()) {

                var transition = String('opacity ' + self.options.fadeDuration + 's ease-in-out 0s');
                uk.utils.css3.setTransitions(_overlay, transition);
            }

            _blackout.css({
                'width': '100%',
                'height': '100%'
            });

            _content.css({
                'position': 'absolute',
                'display': 'none'
            });

            _alert.css({
                'position': 'absolute',
                'display': 'none'
            });

            // Injest all overlay content elements
            $('[data-overlay-content]').each(function (i, el) {

                _content.append(el);
                $(el).css('display', 'none');

            });

            $(self).trigger('overlaybuilt');
        };

        var addEvents = function () {

            uk.events.addViewManagerEvent('viewresize', rescaleOverlay);
            //uk.events.addViewManagerEvent('viewscroll', repositionOverlay);
            uk.events.addViewManagerEvent('viewbeforenewload', function () { self.show(false, false, true); });
            uk.events.addViewManagerEvent('viewafternewload', function () { self.hide() });

            _overlayClose.on('tap', function (evt) {

                evt.preventDefault();
                self.hide();
            });

            _alertOk.on('tap', function (evt) {

                if (_alertOkCallback) _alertOkCallback();

                if (_activeContentElement) self.hideAlert();
                else self.hide();

            });

            _alertCancel.on('tap', function (evt) {

                if (_alertCancelCallback) _alertCancelCallback();

                if (_activeContentElement) self.hideAlert();
                else self.hide();

            });

            $(document).on('keypress', function (evt) {

                var code = (evt.keyCode ? evt.keyCode : evt.which);
                // On pressing 'esc'
                if (code == 27) {
                    _hide();
                }
            });

            if (self.options.enableFade && uk.utils.css3.useTransitions()) {

                _overlay.on(uk.utils.css3.getTransitionEnd(), function (evt) {

                    var evtTarget = $(evt.target);
                    if (evtTarget.is('[data-overlay]')) endTransition();

                });
            }
        };

        var showContent = function (contentElement) {

            hideLoading();
            _content.css('display', 'block');

            if (_activeContentElement) _activeContentElement.css('display', 'none');

            _activeContentElement = $('[data-overlay-content=' + contentElement + ']');
            if (_activeContentElement) _activeContentElement.css('display', 'block');
        };

        var showLoading = function () {

            _blackout.addClass('loading');
        };

        var hideLoading = function () {

            _blackout.removeClass('loading');
        };

        var hideOverlay = function () {

            if (_overlay.attr('data-state') == 'active') {

                _overlay.attr('data-state', 'inactive');

                // Check implemented to ensure any quick successions are captured.
                if (_overlay.css('opacity') == 0) {

                    endTransition();
                }
                else {

                    if (self.options.enableFade && uk.utils.css3.useTransitions()) {

                        _overlay.css('opacity', 0);
                    }
                    else if (self.options.enableFade) {

                        _overlay.stop();

                        _overlay.animate({
                            'opacity': 0
                        }, self.options.fadeDuration * 1000, endTransition);
                    }
                    else {
                        endTransition();
                    }
                }
            }
        };

        var endTransition = function () {

            if (_overlay.attr('data-state') == 'inactive') {

                _overlay.css('display', 'none');

                self.hideContent();
                self.hideAlert();
                hideLoading();

                $(self).trigger('overlayclose');
            };
        };

        var rescaleOverlay = function (viewHeight, pageHeight, interfaceHeight) {

            _overlay.css({
                'width': '100%',
                'height': '100%'
                //'height': $(window).height()
                //'height': (window.innerHeight ? window.innerHeight : $(window).height())
            });

            _content.css({
                'left': String(Number(($(window).width() / 2) - (_content.outerWidth() / 2)) + 'px'),
                'top': String(Number(($(window).height() / 2) - (_content.outerHeight() / 2)) + 'px')
            });

            _alert.css({
                'left': String(Number(($(window).width() / 2) - (_alert.outerWidth() / 2)) + 'px'),
                'top': String(Number(($(window).height() / 2) - (_alert.outerHeight() / 2)) + 'px')
            });

        };

        var repositionOverlay = function () {

            _overlay.css({
                'top': $(window).scrollTop()
            });
        };

        // Public Functions
        self.show = function (instantShow, contentElement, loading) {

            if (contentElement) showContent(contentElement);
            else if (loading) showLoading();

            self.showOverlay(instantShow);
        };

        self.showAlert = function (message, options) {

            _alertMessage.html(message);

            hideLoading();
            _alert.css('display', 'block');

            var displayType = (self.options.alertControlsInline) ? 'inline-block' : 'block';

            _alertOkCallback = null;
            _alertCancelCallback = null;

            if (!options) {
                _alertOk.css('display', displayType);
                _alertCancel.css('display', 'none');
            }
            else {
                if (options.ok) {
                    _alertOk.css('display', displayType);
                    _alertOkCallback = options.ok;
                }
                else {
                    _alertOk.css('display', 'none');
                }

                if (options.hasOwnProperty('cancel')) {
                    _alertCancel.css('display', displayType);
                    _alertCancelCallback = options.cancel;
                }
                else {
                    _alertCancel.css('display', 'none');
                }
            }

            self.showOverlay();
        };

        self.showOverlay = function (instantShow) {

            if (_overlay.attr('data-state') == 'inactive') {

                $(self).trigger('overlayopen');

                _overlay.attr('data-state', 'active');
                _overlay.css('display', 'block');

                //uk.views.resizeView();

                var duration = (instantShow) ? 0 : self.options.fadeDuration;

                if (self.options.enableFade && uk.utils.css3.useTransitions()) {

                    _overlay[0].offsetWidth;
                    _overlay.css('opacity', 1);
                }
                else if (self.options.enableFade) {

                    _overlay.stop();

                    _overlay.animate({
                        'opacity': 1
                    }, duration * 1000);
                }
                else {
                    endTransition();
                }
            }
        };

        self.hide = function () {

            hideOverlay();
        };

        self.hideContent = function () {

            _content.css('display', 'none');

            if (_activeContentElement) {

                _activeContentElement.css('display', 'none');
                _activeContentElement = null;
            }
        };

        self.hideAlert = function () {

            _alert.css('display', 'none');

            _alertMessage.html('');
        };
    };

}(jQuery));