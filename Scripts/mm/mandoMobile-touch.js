(function ($) {

    "use strict";

    /**************************************************************

        Script		: MandoMobile - Touch
        Version		: 1.1
        Authors		: Matt Robinson

    **************************************************************/

    $.event.special.tap = {

        setup: function () {

            var threshold = 20;
            var thisEvent;
            var timer;

            var startEventPos;
            var endEventPos;

            var reset = function () {

                clearTimeout(timer);

                if (thisEvent) thisEvent.preventDefault();
                thisEvent = null;

                startEventPos = null;
                endEventPos = null;
            };

            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {

                $(this).on("touchstart", function (event) {

                    thisEvent = event.originalEvent;
                    startEventPos = {
                        x: thisEvent.targetTouches[0].clientX,
                        y: thisEvent.targetTouches[0].clientY
                    };

                    timer = setTimeout(function () {
                        $.event.special.tap.handler(this, event, 'taphold');
                        reset();
                    }.bind(this), 250);
                });

                $(this).on("touchmove", function (event) {

                    if (thisEvent) {

                        endEventPos = {
                            x: event.originalEvent.targetTouches[0].clientX,
                            y: event.originalEvent.targetTouches[0].clientY
                        };

                        var xDiff = Math.abs(startEventPos.x - endEventPos.x);
                        var yDiff = Math.abs(startEventPos.y - endEventPos.y);

                        if (xDiff > threshold || yDiff > threshold) {

                            reset();
                        }
                    }
                });

                $(this).on("touchend", function (event) {

                    if (thisEvent && thisEvent.target == event.originalEvent.target) {
                        $.event.special.tap.handler(this, event, 'tap');
                    }

                    reset();
                });
            }
            else {

                $(this).on("click", function (event) {

                    $.event.special.tap.handler(this, event, 'tap');
                });
            }
        },
        teardown: function () {

            $.event.special.tap.removeEvents(this);
        },
        removeEvents: function (target) {

            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {

                $(target).off("touchstart");
                $(target).off("touchmove");
                $(target).off("touchend");
            }
            else {

                $(target).off("click");
            }
        },
        handler: function (target, event, type) {
            event.type = 'tap';
            $.event.dispatch.call(target, event);
        }
    };

    $.event.special.swipe = {
        setup: function () {

            var threshold = 40;
            var thisEvent;

            var startEventPos;
            var endEventPos;

            var reset = function () {

                startEventPos = null;
                endEventPos = null;

                if (thisEvent) thisEvent.preventDefault();
                thisEvent = null;
            };

            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {

                $(this).on("touchstart", function (event) {

                    thisEvent = event.originalEvent;
                    startEventPos = {
                        x: thisEvent.targetTouches[0].clientX,
                        y: thisEvent.targetTouches[0].clientY
                    };
                });

                $(this).on("touchmove", function (event) {

                    endEventPos = {
                        x: event.originalEvent.targetTouches[0].clientX,
                        y: event.originalEvent.targetTouches[0].clientY
                    };
                });

                $(this).on("touchend", function (event) {

                    if (startEventPos && endEventPos) {

                        var changeX = startEventPos.x - endEventPos.x;
                        var changeY = startEventPos.y - endEventPos.y;

                        var shiftX = (changeX < 0) ? changeX * -1 : changeX;
                        var shiftY = (changeY < 0) ? changeY * -1 : changeY;

                        var shiftDirection = (shiftX > shiftY) ? 'h' : 'v';
                        var targetChange = (shiftX > shiftY) ? changeX : changeY;
                        var targetShift = (shiftX > shiftY) ? shiftX : shiftY;

                        if (targetShift >= threshold) {

                            if (targetChange > 0) {
                                if (shiftDirection == 'h') $.event.special.swipe.handler(this, event, 'left');
                                if (shiftDirection == 'v') $.event.special.swipe.handler(this, event, 'up');
                            }
                            else {
                                if (shiftDirection == 'h') $.event.special.swipe.handler(this, event, 'right');
                                if (shiftDirection == 'v') $.event.special.swipe.handler(this, event, 'down');
                            }
                        }

                    }

                    reset();
                });
            }
        },
        teardown: function () {

            $.event.special.swipe.removeEvents(this);
        },
        removeEvents: function (target) {

            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {

                $(target).off("touchstart");
                $(target).off("touchmove");
                $(target).off("touchend");
            }
        },
        handler: function (target, event, swipeDirection) {

            event.type = 'swipe';
            event.swipeDirection = swipeDirection;

            $.event.dispatch.call(target, event);
        }
    };

})(jQuery);