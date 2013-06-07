(function () {

    "use strict";

    /**************************************************************

		Script		: MandoMobile - Utils
		Version		: 1.1
		Authors		: Matt Robinson

    **************************************************************/

	// Bind fix for Safari
	Function.prototype.bind = function(bind){
		var self = this,
			args = (arguments.length > 1) ? Array.slice(arguments, 1) : null;

		return function(){
			if (!args && !arguments.length) return self.call(bind);
			if (args && arguments.length) return self.apply(bind, args.concat(Array.from(arguments)));
			return self.apply(bind, args || arguments);
		};
	};

	// indexOf fix for IE7 + 8
	if (!Array.indexOf) {
		Array.prototype.indexOf = function (obj) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == obj) {
					return i;
				}
			}
			return -1;
		}
	}

	// startsWith fix for IE7 + 8
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (str) {
			return this.indexOf(str) == 0;
		};
	}

} ());