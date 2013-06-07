(function ($) {

    "use strict";

    /**************************************************************

    Script		: Ukitu - Namespaces
    Authors		: Matt Robinson

    **************************************************************/

    /* VIEWS */
    uk.views = {};
    uk.views.getCurrentView = function () { return uk.views.viewManager.currentView; };
    uk.views.changeView = function (viewId, viewUrl, viewTransition) { uk.views.viewManager.changeView(viewId, viewUrl, viewTransition); };
    uk.views.cancelView = function () { uk.views.viewManager.cancelView(); };
    uk.views.resizeView = function () { uk.views.viewManager.resizeView(); };
    
	/* OVERLAY */
	uk.overlays = {};
	uk.overlays.showLoadOverlay = function (instantShow) { uk.overlays.viewOverlay.show(instantShow, false, true); };
    uk.overlays.showAlertOverlay = function (msg, options) { uk.overlays.viewOverlay.showAlert(msg, options); };
    uk.overlays.hideAlertOverlay = function () { uk.overlays.viewOverlay.hideAlert(); };    
    uk.overlays.showContentOverlay = function (contentElement) { uk.overlays.viewOverlay.show(false, contentElement); }
    uk.overlays.hideContentOverlay = function () { uk.overlays.viewOverlay.hideContent(); }
    uk.overlays.hideOverlay = function () { uk.overlays.viewOverlay.hide(); }
	
    /* PLUGINS */
    uk.plugins = {};
    uk.plugins.activatePlugin = function (plugin, pluginParams) { return uk.plugins.pluginManager.activatePlugin(plugin, pluginParams); };

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
	
    uk.events = {};
    uk.events.viewManagerEvents = {};
    uk.events.viewManagerEventMonitor = function (id) { return eventDispatcher(uk.events.viewManagerEvents, id) };
	
    uk.events.fireViewManagerEvent = function (eventId, args) { uk.events.viewManagerEventMonitor(eventId).publishWith(this, args); };
    uk.events.addViewManagerEvent = function (eventId, callback) { uk.events.viewManagerEventMonitor(eventId).subscribe(callback); };
    uk.events.removeViewManagerEvent = function (eventId, callback) { uk.events.viewManagerEventMonitor(eventId).unsubscribe(callback); };

    uk.nav = {};

    /* UTILS */
    uk.utils = {

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

            var results = regex.exec(location.search);
            if (results == null) results = regex.exec(location.hash);

            if (results == null) {
                return null;
            }
            else {
                return decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        },

        css3: {
            
            getTransitionEnd: function () {

                var transitionEnd = uk.utils.css3.getPrefix('transition');

                transitionEnd = {
                    'transition': 'transitionend',
                    'webkitTransition': 'webkitTransitionEnd',
                    'MozTransition': 'transitionend',
                    'OTransition': 'oTransitionEnd'
                }[transitionEnd];
                
                return transitionEnd;
            },

            getTransformStyle: function () {

                var transformStyle = uk.utils.css3.getPrefix('transform');

                transformStyle = {
                    'transform': 'transform',
                    'webkitTransform': '-webkit-transform',
                    'MozTransform': 'transform',
                    'OTransform': '-o-transform'
                }[transformStyle];

                return transformStyle;
            },

            getTransitionStyle: function () {

                var transitionStyle = uk.utils.css3.getPrefix('transition');

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
                transObj[uk.utils.css3.getTransformStyle()] = transform;

                return transObj;
            },

            setTransitions : function (elem, transition) {

                var transObj = {};
                transObj[uk.utils.css3.getTransitionStyle()] = transition;

                elem.css(transObj);

                elem.each(function (i, el) {
                    el.offsetWidth;
                });
            },

            clearTransitions : function (elem) {

                var transObj = {};
                transObj[uk.utils.css3.getTransitionStyle()] = 'none';

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

                return uk.utils.css3.detectProperty('transition');
            },

            useTransforms: function () {

                return uk.utils.css3.detectProperty('transform');
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

                var p = uk.utils.detect.platform();

                if (p === 'iPad' || p === 'iPhone' || p === 'iPod') {
                    return true;
                }
                else {
                    return false;
                }
            },

            touch: function () {

                return ('ontouchstart' in window) || DocumentTouch && document instanceof DocumentTouch;
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
                var qs = location.search.replace('?', '');
                var pairs = qs.split('&');
                $.each(pairs, function (i, v) {
                    var pair = v.split('=');
                    nvpair[pair[0]] = pair[1];
                });
                return nvpair;
            }
        }
    };

} (jQuery));