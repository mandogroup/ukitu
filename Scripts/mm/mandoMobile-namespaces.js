(function ($, Modernizr) {

    "use strict";

    /**************************************************************

    Script		: MandoMobile - Namespaces
    Version		: 1.1
    Authors		: Matt Robinson

    **************************************************************/

    /* VIEWS */
    window.mm.views = {};
    window.mm.views.getCurrentView = function () { return window.mm.views.viewManager.currentView; };
    window.mm.views.changeView = function (viewId, viewUrl) { window.mm.views.viewManager.changeView(viewId, viewUrl); };
    window.mm.views.cancelView = function () { window.mm.views.viewManager.cancelView(); };
    window.mm.views.resizeView = function () { window.mm.views.viewManager.resizeView(); };
    window.mm.views.showLoadOverlay = function (instantShow) { window.mm.views.viewOverlay.show(instantShow, false, true); };
    window.mm.views.showAlertOverlay = function (msg, options) { window.mm.views.viewOverlay.showAlert(msg, options); };
    window.mm.views.hideAlertOverlay = function () { window.mm.views.viewOverlay.hideAlert(); };    
    window.mm.views.showContentOverlay = function (contentElement) { window.mm.views.viewOverlay.show(false, contentElement); }
    window.mm.views.hideContentOverlay = function () { window.mm.views.viewOverlay.hideContentElement(); }
    window.mm.views.hideOverlay = function () { window.mm.views.viewOverlay.hide(); }
	
    /* PLUGINS */
    window.mm.plugins = {};
    window.mm.plugins.activatePlugin = function (plugin, pluginParams) { return window.mm.plugins.pluginManager.activatePlugin(plugin, pluginParams); };

    /* EVENTS */
    var eventDispatcher = function (eventObj, id) {

        var callbacks,
			method,
			event = id && eventObj[id];
        if (!event) {
            callbacks = $.Callbacks();
            event = {
                publish: callbacks.fire,
                publishWith: callbacks.fireWith,
                subscribe: callbacks.add,
                unsubscribe: callbacks.remove
            };
            if (id) {
                eventObj[id] = event;
            }
        }
        return event;
    };
	
    window.mm.events = {};
    window.mm.events.viewManagerEvents = {};
    window.mm.events.viewManagerEventMonitor = function (id) { return eventDispatcher(window.mm.events.viewManagerEvents, id) };
	
    window.mm.events.fireViewManagerEvent = function (eventId, args) { window.mm.events.viewManagerEventMonitor(eventId).publishWith(this, args); };
    window.mm.events.addViewManagerEvent = function (eventId, callback) { window.mm.events.viewManagerEventMonitor(eventId).subscribe(callback); };
    window.mm.events.removeViewManagerEvent = function (eventId, callback) { window.mm.events.viewManagerEventMonitor(eventId).unsubscribe(callback); };

    window.mm.nav = {};

    /* UTILS */
    window.mm.utils = {

        indexOfPropValue: function (array, prop, value) {
            for (var i = 0; i < array.length; i += 1) {
                if (array[i][prop] === value) {
                    return i;
                }
            }

            return -1;
        },

        stringifyNumber: function (val) {

            val = (Math.round(val * 100) / 100).toFixed(2);

            val += '';

            var x = val.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';

            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }

            return x1 + x2;
        },

        getQueryStringValue: function (name) {

            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);

            var results = regex.exec(window.location.search);
            if (results == null) results = regex.exec(window.location.hash);

            if (results == null) {
                return null;
            }
            else {
                return decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        },

        css3: {
            
            getTransEndEventName: function () {

                var transEndEventNames = {
                    'WebkitTransition': 'webkitTransitionEnd',
                    'MozTransition': 'transitionend',
                    'OTransition': 'oTransitionEnd',
                    'msTransition': 'msTransitionEnd',
                    'transition': 'transitionend'
                };

                return transEndEventNames[Modernizr.prefixed('transition')];
            },

            getTransformStyle: function () {

                var transStyleNames = {
                    'WebkitTransform': '-webkit-transform',
                    'MozTransform': 'transform',
                    'OTransform': '-o-transform',
                    'msTransform': 'msTransform',
                    'transform': 'transform'
                };

                return transStyleNames[Modernizr.prefixed('transform')];
            },

            getTransitionStyle: function () {

                var transStyleNames = {
                    'WebkitTransition': '-webkit-transition',
                    'MozTransition': 'transition',
                    'OTransition': '-o-transition',
                    'msTransition': 'msTransition',
                    'transition': 'transition'
                };

                return transStyleNames[Modernizr.prefixed('transition')];
            },

            getTransform : function (transform) {

                var transObj = {}
                transObj[window.mm.utils.css3.getTransformStyle()] = transform;

                return transObj;
            },

            setTransitions : function (elem, transition) {

                var transObj = {};
                transObj[window.mm.utils.css3.getTransitionStyle()] = transition;

                elem.css(transObj);

                elem.each(function (i, el) {
                    el.offsetWidth;
                });
            },

            clearTransitions : function (elem) {

                var transObj = {};
                transObj[window.mm.utils.css3.getTransitionStyle()] = 'none';

                elem.css(transObj);

                elem.each(function (i, el) {
                    el.offsetWidth;
                });
            }
        },

        convert: {

            dateFromString: function (dateString) {
                var dateArr = dateString.split("/", 3);
                var date = new Date(dateArr[2], Number(dateArr[1]) - 1, dateArr[0]);

                return date;
            },

            dateTimeToString: function (dateTime) {
                var milliseconds = dateTime.replace(/[^\+^0-9]/g, '');
                milliseconds = String(milliseconds).split('+', 1)[0];

                var date = new Date(Number(milliseconds));

                var dateString = String(date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) + '/';
                dateString += (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + String(date.getMonth() + 1);
                dateString += '/' + String(date.getFullYear());

                return dateString;
            },

            millisecondDateFromString: function (dateString) {
                var dateArr = dateString.split("/", 3);
                var date = String("\/Date(" + Date.UTC(dateArr[2], Number(dateArr[1]) - 1, dateArr[0]) + ")\/");

                return date;
            }
        },

        detect: {

            browser: function () {

                return $.browser;
            },

            IE: function () {

                return $.browser.msie;
            },

            IE7: function () {

                if (($.browser.msie) && ($.browser.version == '7.0')) return true;
                else return false;
            },

            IE8: function () {

                if (($.browser.msie) && ($.browser.version == '8.0')) return true;
                else return false;
            },

            platform: function () {

                return navigator.platform;
            },

            iOS: function () {

                var p = window.mm.utils.detect.platform();

                if (p === 'iPad' || p === 'iPhone' || p === 'iPod') {
                    return true;
                }
                else {
                    return false;
                }
            }
        },

        log: function (logEntry) {

            if (typeof console == "object") {
                console.log(logEntry);
            }
        },

        parse: {

            decimal: function (string) {
                if (string == null)
                    return 0;

                var pattern = /[^\d\.\-]/ig;
                var cleanValue = string.replace(pattern, '');
                return parseFloat(cleanValue);
            },

            querystring: function () {
                var nvpair = {};
                var qs = window.location.search.replace('?', '');
                var pairs = qs.split('&');
                $.each(pairs, function (i, v) {
                    var pair = v.split('=');
                    nvpair[pair[0]] = pair[1];
                });
                return nvpair;
            }
        },

        validate: {

            email: function (emailText) {
                var validEmailRegex = new RegExp(/\b[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,10}\b/);

                return validEmailRegex.test(emailText);
            },

            phoneNumber: function (phoneNumber) {
                var validPhoneRegex = new RegExp(/^(01|02|07)\d{3,3}[\s-]?\d{6,6}$/);

                return validPhoneRegex.test(phoneNumber);
            },

            postcode: function (postcodeText) {
                // Loose UK Postcode - doesn't do BFPO
                // Matches: Letter Letter/Digit(1 to 3 times) Space Digit Letter Letter
                var validPostcodeRegex = new RegExp(/^[a-zA-Z][a-zA-Z0-9]{1,3}\s[0-9][a-zA-Z]{2,2}$/);

                return validPostcodeRegex.test(postcodeText);
            },

            present: function (text) {

                if (text) {

                    var testText = $.trim(text);

                    if ((testText == '')) return false;
                    else return true;
                }
                else {
                    return false;
                }
            }
        }
    };

} (jQuery, Modernizr));