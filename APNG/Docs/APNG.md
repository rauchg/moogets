Class: APNG {#APNG}
===================

Interval-based animated images. Supports IMG (with src, an image per frame), and any other element with background-image (an image per frame) or background-position (single image).

### Implements:

Options, Class.Occlude

### Tutorial/Demo

* [Online Demo][]
[Online Demo]:http://www.devthought.com/wp-content/projects/mootools/apng/

APNG Method: constructor {#APNG:constructor}
---------------------------------------------

### Syntax:

	var myAPNG = new APNG(element, options);

### Arguments:

1. element - (*mixed*) A string of the id for an Element or an Element reference to relocate
2. options - (*object*, optional) The options object

### Options:

* property - (*string*, defaults to 'src') Can be 'src', 'background-image' or 'background-position'. The first two require multiple images, while position a single one that is clipped.
* axis - (*string*, defaults to 'x') If background-position is used, in what direction the position is altered to display the next frame (x or y)
* ext - (*string*, defaults to '.png') The extension of the image, required for multiple images animations.
* frames - (*integer*) The number of frames the animation has.
* endless - (*boolean*, defaults to true) When the last frame is reached, whether the animation stops or restarts.
* interval - (*mixed*, defaults to 100) A single time interval for frames, or an array of intervals, with as many values as frames.
* autoStart - (*boolean*, defaults to true) Whether the animation starts or not when the APNG instance is created.
* startFrame - (*integer*, defaults to 1) The index of the frame displayed first 
* preload - (*integer*, defaults to true) If 'src' or 'background-image' are used, preload images. Useful if autoStart is set to false
* useNative - (*boolean*, defaults to true in FF/Opera) Whether to fallback to a file with format {basename}-anim.png if the browser supports real APNGs.
* addFilter - (*boolean*, defaults to true in IE) Whether to add the PNG filter correction for trident.


### Notes

- The frame 1 should be called something-like-this.png. Subsequent frames are called something-like-{frame}.png (for example something-like-2.png). 
- If native fallback is on, you can provide a something-like-this-anim.png with a real APNG. If you don't plan to create one, make sure you set useNative to false.
- If you're using an IE behavior to fix PNG transparency, set addFilter false. Otherwise, make sure APNG.blankImage contains the path to a blank.gif image.

  APNG.blankImage = '/images/blank.gif';

### See Also:

- [APNG][]


APNG Method: start {#APNG:start}
---------------------------------

Starts the animation. Call only when paused or cancelled.

### Syntax:

  myAPNG.start();	


APNG Method: reset {#APNG:reset}
---------------------------------

Resets the current frame to the startFrame.

### Syntax:

  myAPNG.reset();

### Arguments:

1. pause - (*boolean*, defaults to false) Whether to pause the animation or not after resetting.


APNG Method: pause {#APNG:pause}
---------------------------------

Pauses the animation.

### Syntax:

  myAPNG.pause();


APNG Method: resume {#APNG:resume}
-----------------------------------

Resumes the animation

### Syntax:

  myAPNG.resume();


APNG Method: cancel {#APNG:cancel}
-----------------------------------

Pauses and resets. The animation is not restarted.

### Syntax:

  myAPNG.cancel();


[APNG]: http://animatedpng.com/