[![Build Status](https://api.travis-ci.org/vissense/vissense.png?branch=master)](https://travis-ci.org/vissense/vissense)
[![Coverage Status](https://coveralls.io/repos/vissense/vissense/badge.png)](https://coveralls.io/r/vissense/vissense)
[![Dependency Status](https://david-dm.org/vissense/vissense.svg)](https://david-dm.org/vissense/vissense)
[![devDependency Status](https://david-dm.org/vissense/vissense/dev-status.svg)](https://david-dm.org/vissense/vissense#info=devDependencies)

VisSense.js
====

A utility library for observing visibility changes of DOM elements.
Immediately know when an element becomes hidden, partly visible or fully visible.

In this simple example a video is played if at least 75% of its area is in the users viewport:
```javascript
var video = $('#video'); 
var visibility = VisSense(video[0], { fullyvisible: 0.75 }); 
if(visibility.isFullyVisible()) { 
  video.play();
}
```

In a more advanced example the video is stopped as soon as it not visible anymore:
```javascript
...

var visibility_monitor = visibility.monitor({ 
  strategy: new VisSense.VisMon.Strategy.EventStrategy({ debounce: 100 }),
  fullyvisible: function() { 
    video.play();
  }, 
  hidden: function() { 
    video.stop(); 
  }
}).start();
```

#### What it does
 * provides methods for detecting visibility of DOM elements
 * provides a convenience class for calling isHidden, isVisible, isFullyVisible, percentage
 * provides a convenience class for detecting changes in visibility

#### What it does *not*
 * detect if an element is overlapped by others
 * detect if an element is a hidden input element
 * take elements opacity into account
 * take scrollbars into account - elements "hidden" behind scrollbars are considered visible

API
------------

### new VisSense([options])

Object constructor. Options:

- `hidden` (_default: 0_) - if percentage is equal or below this limit the element is considered hidden
- `fullyvisible` (_default: 1_) -  if percentage is equal or above this limit the element is considered fully visible

Note: you can omit `new` keyword when calling `VisSense()`

#### .percentage()

gets the current visible percentage (0..1)


#### .isHidden()

`true` if element is hidden

#### .isVisible()

`true` if element is visible

#### .isFullyVisible()

`true` if element is fully visible

#### .state()

returns an object representing the current state

```javascript
{ 
    "code": 1, 
    "state": "visible", 
    "percentage": 0.55, 
    "visible": true, 
    "fullyvisible": false, 
    "hidden": false 
    "previous" : { 
      "code": 2, 
      "state": 
      "fullyvisible", 
      "percentage": 1, 
      "visible": true, 
      "fullyvisible": true, 
      "hidden": false 
    }
} 
```

#### .monitor([config])

This is an alias for getting a VisSense.VisMon object observing the current element. 
See the options below for more details.

```javascript
var element = document.getElementById('video');

var visibility_monitor = VisSense(element).monitor({ 
  strategy: [
    new VisSense.VisMon.Strategy.EventStrategy({ debounce: 100 }),
    new VisSense.VisMon.Strategy.PollingStrategy({ interval: 2000 })
  ], 
  hidden: function() { 
    console.log('hidden');
  }
}).start();
```

### new VisSense.VisMon(obj [, options])

Object constructor. Options:

- `update` function to run when elements update function is called
- `hidden` function to run when element becomes hidden
- `visible` function to run when element becomes visible
- `fullyvisible` function to run when element becomes fully visible
- `visibilitychange` function to run when the visibility of the element changes
- `percentagechange` function to run when the percentage of the element changes
- `strategy` a strategy or array of strategies for observing the element. VisSense comes with three predefined strategies. See below.

```javascript
var element = document.getElementById('video');

var visibility_monitor = new VisSense.VisMon(element, { 
  strategy: [
    new VisSense.VisMon.Strategy.PollingStrategy({ interval: 9000 })
  ],
  visibilitychange: function() { 
    console.log('visibilitychange');
  }, 
  percentagechange: function() { 
    console.log('percentagechange');
  }
}).start();
```

##### Strategies
VisSense comes with three predefined strategies:
   - `NoopStrategy` (_default_) this strategy (like implied by its name) does nothing on its own. it is your responsibility to invoke `update()` on the monitor instance.
   - `EventStrategy` this strategy registers event handlers for visibilitychange, scroll and resize and calls `update()` accordingly.
   - `PollingStrategy` this strategy invokes `update()` periodically.

Feel free to write your own strategy to cover your specific requirements (it's super easy).

#### .start() 
starts observing the element returns `this`

#### .stop() 
stops observing the element

#### .update() 
manually run the update procedure. this will fire all registered hooks accordingly.

#### .state() 
returns a state object

```javascript
{ 
    "code": 0, 
    "state": "hidden", 
    "percentage": 0, 
    "visible": false, 
    "fullyvisible": false, 
    "hidden": true, 
    "previous": {} 
}
```

#### .on(event, hook) 
registers an event hook

```javascript
vismon.on('percentagechange', function() { ... });
```


Contribute
------------

- Issue Tracker: https://github.com/vissense/vissense/issues
- Source Code: https://github.com/vissense/vissense

### Installation
`git clone https://github.com/vissense/vissense.git`

#### Install dependencies

`npm install && bower install`

#### Build Project

`grunt`

#### Run Tests

`grunt test`

or

`grunt serve`

and it automatically opens `http://localhost:3000/SpecRunner.html` in your browser.

License
-------

The project is licensed under the MIT license. See
[LICENSE](https://github.com/vissense/vissense/blob/master/LICENSE) for details.