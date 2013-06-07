(function ($, Modernizr) {

    "use strict";

    /**************************************************************

    Script		: MandoMobile - Namespaces
    Version		: 1.2
    Authors		: Matt Robinson

    **************************************************************/

    /* VIEWS */
    window.mm.views = {};
    window.mm.views.getCurrentView = function () { return window.mm.views.viewManager.currentView; };
    window.mm.views.changeView = function (viewId, viewUrl, viewTransition) { window.mm.views.viewManager.changeView(viewId, viewUrl, viewTransition); };
    window.mm.views.cancelView = function () { window.mm.views.viewManager.cancelView(); };
    window.mm.views.resizeView = function () { window.mm.views.viewManager.resizeView(); };
    
	/* OVERLAY */
	window.mm.overlays = {};
	window.mm.overlays.showLoadOverlay = function (instantShow) { window.mm.overlays.viewOverlay.show(instantShow, false, true); };
    window.mm.overlays.showAlertOverlay = function (msg, options) { window.mm.overlays.viewOverlay.showAlert(msg, options); };
    window.mm.overlays.hideAlertOverlay = function () { window.mm.overlays.viewOverlay.hideAlert(); };    
    window.mm.overlays.showContentOverlay = function (contentElement) { window.mm.overlays.viewOverlay.show(false, contentElement); }
    window.mm.overlays.hideContentOverlay = function () { window.mm.overlays.viewOverlay.hideContentElement(); }
    window.mm.overlays.hideOverlay = function () { window.mm.overlays.viewOverlay.hide(); }
	
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

                var transitionEnd = window.mm.utils.css3.getPrefix('transition');

                transitionEnd = {
                    'transition': 'transitionend',
                    'webkitTransition': 'webkitTransitionEnd',
                    'MozTransition': 'transitionend',
                    'OTransition': 'oTransitionEnd'
                }[transitionEnd];
                
                return transitionEnd;
            },

            getTransformStyle: function () {

                var transformStyle = window.mm.utils.css3.getPrefix('transform');

                transformStyle = {
                    'transform': 'transform',
                    'webkitTransform': '-webkit-transform',
                    'MozTransform': 'transform',
                    'OTransform': '-o-transform'
                }[transformStyle];

                return transformStyle;
            },

            getTransitionStyle: function () {

                var transitionStyle = window.mm.utils.css3.getPrefix('transition');

                transitionStyle = {
                    'transition': 'transition',
                    'webkitTransition': '-webkit-transition',
                    'MozTransition': 'transition',
                    'OTransition': '-o-transition'
                }[transitionStyle];

                return transitionStyle;
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
            },

            getPrefix: function(suffix) {

                var bodyStyle = document.body.style;

                if (!suffix) { return ''; }

                var i, len;

                if (suffix.indexOf('-') >= 0) {
                    var parts = (''+suffix).split('-');

                    for (i=1, len=parts.length; i<len; i++) {
                        parts[i] = parts[i].substr(0, 1).toUpperCase()+parts[i].substr(1);
                    }
                    suffix =  parts.join('');
                }

                if (suffix in bodyStyle) {
                    return suffix;
                }

                suffix = suffix.substr(0, 1).toUpperCase()+suffix.substr(1);

                var prefixes = ['webkit', 'Moz', 'ms', 'O'];
                for (i=0, len=prefixes.length; i<len; i++) {
                    if (prefixes[i]+suffix in bodyStyle) {
                        return prefixes[i]+suffix;
                    }
                }

                return '';
            },

            useTransitions: function () {

                return window.mm.utils.css3.detectProperty('transition');
            },

            useTransforms: function () {

                return window.mm.utils.css3.detectProperty('transform');
            },

            detectProperty: function (prop) {

                var b = document.body || document.documentElement;
                var s = b.style;
                var p = prop;
                if (typeof s[p] == 'string') { return true; }

                // Tests for vendor specific prop
                v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
                p = p.charAt(0).toUpperCase() + p.substr(1);

                for (var i = 0; i < v.length; i++) {
                    if (typeof s[v[i] + p] == 'string') { return true; }
                }

                return false;
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
            },

            touch: function () {

                return ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
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