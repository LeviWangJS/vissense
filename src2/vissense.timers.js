/**
 * @license
 * Vissense <http://vissense.com/>
 * Copyright 2014 tbk <theborakompanioni+vissense@gmail.com>
 * Available under MIT license <http://opensource.org/licenses/MIT>
 */
/*
 * depends on ['vissense.core', 'vissense.monitor']
 */
;(function(window, VisSense, undefined) {
    'use strict';

    if(!VisSense || !VisSense.monitor) {
        throw new Error('VisSense is not available');
    }

    // Stop timer from `every` method by it’s ID.
    function cancel(timer) {
        clearInterval(timer.id);
        clearTimeout(timer.delay);
        delete timer.id;
        delete timer.delay;
    };

    function run(timer, interval, runNow) {
        var runner = function () {
            timer.last = new Date();
            timer.callback.call(window);
        };

        if ( runNow ) {
            var now  = new Date();
            var last = now - timer.last;

            if ( interval > last ) {
                timer.delay = setTimeout(function () {
                    runner();
                    timer.id = setInterval(runner, interval);
                }, interval - last);
            } else {
                runner();
                timer.id = setInterval(runner, interval);
            }

        } else {
          timer.id = setInterval(runner, interval);
        }
     }
    /*--------------------------------------------------------------------------*/

    function VisTimer(vismon, config) {
        //VisSense.call(this, element, config);
        var self = this;

        var lastTimerId = -1;
        var _private = {
            timers: {},
            initialized: false
        };

        self.vismon = function() {
            return vismon;
        };

        // Run callback every `interval` milliseconds if page is visible and
        // every `hiddenInterval` milliseconds if page is hidden.
        //
        //   Vissense.every(60 * 1000, 5 * 60 * 1000, function () {
        //       doSomeStuff();
        //   });
        //
        // You can skip `hiddenInterval` and callback will be called only if
        // page is visible.
        //
        //   Vissense.every(1000, function () {
        //       doSomethingKewl();
        //   });
        //
        // It is analog of `setInterval(callback, interval)` but use visibility
        // state.
        //
        // It return timer ID, that you can use in `Vissense._cancel(id)` to stop
        // timer (`clearInterval` analog).
        // Warning: timer ID is different from interval ID from `setInterval`,
        // so don’t use it in `clearInterval`.
        //
        // On change state from hidden to visible timers will be execute.
        VisTimer.prototype.every = function (interval, hiddenInterval, callback, runNow) {
            if (!callback) {
                callback = hiddenInterval;
                hiddenInterval = null;
            }

            lastTimerId += 1;
            var number = lastTimerId;

            _private.timers[number] = {
                visible:  interval,
                hidden:   hiddenInterval,
                callback: callback
            };
            _run(number, !runNow);

            return number;
        };

        // Stop timer from `every` method by ID.
        //
        //   slideshow = Vissense.every(5 * 1000, function () {
        //       changeSlide();
        //   });
        //   $('.stopSlideshow').click(function () {
        //       Vissense.stop(slideshow);
        //   });
        VisTimer.prototype.stop = function(id) {
            if ( !_private.timers[id] ) {
                return false;
            }
            _cancel(id);
            delete _private.timers[id];
            return true;
        };

        VisTimer.prototype.stopAll = function() {
            for (var id in _private.timers) {
                _cancel(id);
            }
            _private.timers = [];
        };

        // Try to run timer from every method by it’s ID. It will be use
        // `interval` or `hiddenInterval` depending on visibility state.
        // If page is hidden and `hiddenInterval` is null,
        // it will not run timer.
        //
        // Argument `runNow` say, that timers must be execute now too.
        function _run(id, runNow) {
            var interval, timer = _private.timers[id];

            if (vismon.status().isHidden()) {
                if ( null === timer.hidden ) {
                    return;
                }
                interval = timer.hidden;
            } else {
                interval = timer.visible;
            }

            run(timer, interval, runNow);
        };


        function _cancel(id) {
            cancel(_private.timers[id]);
        };


        function cancelAndReinitialize() {
            var isHidden = vismon.status().isHidden();
            var wasHidden = vismon.status().wasHidden();

            if ( (isHidden && !wasHidden) || (!isHidden && wasHidden) ) {
                for (var id in _private.timers) {
                    _cancel(id);
                    _run(id, true);
                }
            }
        };

        (function init() {
            self.vismon().onVisible(function() {
              cancelAndReinitialize();
            });
            self.vismon().onHidden(function() {
              cancelAndReinitialize();
            });
        }());
    }

    function newVisTimer(vissense, config) {
        return new VisTimer(vissense.monitor(), config);
    };

    VisSense.timer = newVisTimer;
    VisSense.prototype.timer = function(config) {
        return newVisTimer(this, config);
    };

}.call(this, this, this.VisSense, this.Math));