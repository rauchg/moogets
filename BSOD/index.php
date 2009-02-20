<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <title>BSOD Error Reporting</title>
    
    <link rel="stylesheet" href="bsod.css" type="text/css" media="screen" title="Stylesheet" charset="utf-8" />
    
    <script src="mootools-1.2.1-core-yc.js" type="text/javascript" charset="utf-8"></script>
    <script src="bsod.js" type="text/javascript" charset="utf-8"></script>
    <script src="demo.js" type="text/javascript" charset="utf-8"></script>
    
    <style type="text/css" media="screen">
      .run { font-size: 0.8em; }
      a.checkme			{ color:#00ff00; }
      a.checkme:visited	{ color:#ff0000; }
      .highlight			{ background:#fffea1; }
    </style>
  </head>
  
  <body id="index">

    <h1>BSOD Error Reporting</h1>
    
    <h2>Intended audience</h2>
    <p>Web developers with an intermediate to advanced knowledge of XHTML, CSS, Javascript and Windows 95</h1>
    
    <h2>Introduction</h2>
    <p>The script BSOD.js provides an easy-to-use class to boost the error reporting user experience of your websites.</p>
    <p>To fully understand the characteristics of this technique please refer to this <a href="http://en.wikipedia.org/wiki/Blue_Screen_of_Death">external article</a></p>
        
    <h2>Advantages over other error reporting methods</h2>
    <p>The advantages are many to both the user and developer.</p>
    
    <h3>To the user</h3>
    <ol>
      <li><p>It makes it unclear what triggered the error. See developer advantages <a href="#dev-1">#1</a> and <a href="#dev-2">#2</a></p></li>
      <li><p>By default, it's easy on the eyes and it succeeds at alarming and fazing the user 99% of the times.</p></li>
      <li><p>Users are likely to exit your application or website, giving you plenty of time to fix it.</p></li>
    </ol>
    
    <h3>To the developer</h3>
    <ol>
      <li id="dev-1"><p>Simple syntax. Just call window.bsod() and a default, unspecific and unhelpful message is shown. You can also pass options to change the message or remove it completely.</p></li>
      <li id="dev-2">
        <p>Can hide what really is wrong by using MooTools <a href="http://mootools.net/docs/Native/Function#Function:delay" title="MooTools Docs - Plugins/Function">delay</a>, showing the error seconds or even <em>minutes</em> after something went wrong.</p>
        <pre id="example-1">window.bsod.delay(2000);</pre>
        <a href="#" class="run" id="run-example-1">run example</a>
      </li>
      <li id="dev-3"><p>It works with every layout and browser. It brings the beauty and innovation of Windows 95 to other platforms, perfectly simulating the user experience.</p></li>
      <li id="dev-4"><p>Supports events to extend its functionality. An example of encouraged integration with the excellent <a href="http://github.com/kassens/mootools-snippets/blob/72fb47c25444b48c667dbfbea2d047f08f141a3b/Window.shake.js" title="Window.shake.js from kassens's mootools-snippets - GitHub">window.shake()</a> by Jan Kassens:</p>
        <pre id="example-2">window.bsod({ onClose: function(){ window.shake(100); } });</pre>
        <a href="#" class="run" id="run-example-2">run example</a>
      </li>
    </ol>
    
    <h2>Disadvantages</h2>
    <p>No criticism or rejection has been perceived in response to this technique, despite its long existence.</p><p> The usability tests conducted show extraordinary levels of acceptance. </p>
    
    <h2>Improvements</h2>
    <h3>Fallacies</h3>
    <p>You can make up false explanations, or even better, blame it on another unrelated cause. To fool even the smartest hackers, we recommend integrating David Walsh's <a href="http://davidwalsh.name/ajax-evil-spyjax" title="Ajax For Evil:  Spyjax">Spyjax</a> script. This component enables you to detect whether the user visited a specific site or not, so that we can blame the error on it.</p>
        
    <pre id="example-3">var urls = ['php.net', 'google.com', 'yahoo.com', 'facebook.com', 'digg.com', 'flickr.com', 'msn.com', 'gmail.com', 'othersite.com'];
var known = [];
urls.each(function(url) {
	var anchor = new Element('a', {
		'href': 'http://' + url,
		'class':'checkme',
		'html':url,
		'styles' : {
			'display': 'none'
		}
	}).inject(document.body);
	if(anchor.getStyle('color') == '#ff0000') {
		known.include(anchor.get('text'));
	}
});

window.bsod({ html: known.length ? 'The site ' + known[0] + ' triggered a segmentation fault. Abandoning ship.' : '' });</pre>
    <a href="#" class="run" id="run-example-3">run example</a>
        
    <h3>Style customization</h3>
    <p>Why not take it to the next level? While the default blue style has undoubtedly passed the test of time, there's still room for innovation</p>
          
    <pre id="example-4">window.bsod();
$('bsod').setStyle('background-color', 'red');
$('bsod').getElement('h1 span').setStyle('color', 'red');</pre>
    <a href="#" class="run" id="run-example-4">run example</a>
    
    <h2>Dependencies</h2>
    <p>BSOD.js depends on the <a href="http://mootools.net/" title="MooTools - a compact javascript framework">MooTools</a> framework to function. Ports to other frameworks are both welcomed and encouraged.</p>

    <h2>Credits</h2>
    <p>The plugin has been authored by <a href="http://devthought.com">Guillermo Rauch</a>, and is released under the MIT license.</p>
    
  </body>
</html>