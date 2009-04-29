APNG
====

APNG provides simple frame-based animation functionality. It’s main goal is solve the problem of animating alpha-transparent images (PNG format)

Details
-------

* Stable: 0.1
* Category: Effects
* Tags: animation,apng
* Demo: http://devthought.com/projects/mootools/apng/

How to use
----------

For a new image

	#JS
	img = new Element('img', { src: 'images/zoom-spin.png' }).inject(document.body);
	new APNG(img, { useNative: false, frames: 12, endless: false });
	
For an existing image

	#JS
	new APNG('imganimated', { useNative: false, frames: 12, endless: true });
	
For an existing div

	new APNG('divspinner', { useNative: false, frames: 12, endless: true, property: 'background-image' });

Features
--------

PNG is very flexible when it comes to the method of displaying the various animation frames.

The default behavior is taking the filename, for example spinner.png, and changing the src or background-image attribute to spinner-2.png, spinner-3.png and so on.

If the useNative functionality is in place, which is set to be on for Firefox 3 and Opera 9.5, the Javascript-based animation is not run. I encourage you to create an actual APNG for the default frame (spinner.png). If you do so, you’ll see increased performance for the browsers that support it -while also promoting the adoption of this new format-, and other browsers will just display the first frame and the animation will run via JavaScript.

You can also use background-position based animations to avoid making multiple requests, and avoid potential cache issues in old browsers.

The APNG class supports dynamic pausing, canceling, resetting and starting of animations. Frames can have a fixed interval or one can be assigned for each of them. Preloading is supported, which can prove useful for long animations or animations that are initialized and not run from the start.