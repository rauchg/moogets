/*
Script: Comet.js
	Full-fledged Bayeux protocol implementation, with reconnection advice support.

	License:
		MIT-style license.

	Authors:
		Guillermo Rauch
		
	Inspiration:
		dojox.cometd, Copyright (c) 2004-2008, The Dojo Foundation All Rights Reserved. [New BSD License](http://www.opensource.org/licenses/bsd-license.php)
		jQuery.Cometd, Copyright 2008 Mort Bay Consulting Pty. Ltd., [MIT License](http://opensource.org/licenses/mit-license.php)		
		
	How to use:
		// init
		var comet = new Comet('url');
		
		// subscribe
		comet.subscribe('/some/channel', callback);
		comet.subscribe('/some/other', callback);
		
		// publish
		comet.publish('/some/channel', { data: 'here' });
		comet.publish('/some/other', { data: 'here' });
*/

(function(){

var Comet = new Class({
		
	Implements: [Events, Options, Log],
			
	options: {
		transport: 'long-polling',
		plugins: [],
		autoHandshake: true,
		backoffIncrement: 1000,
		maxBackoff: 65000
	},
	
	initialize: function(url, options){
		this.setOptions(options);
		this.url = url;
		this.xdomain = new URI(url).getHost() != document.location.host;		
		this.transport = new Comet.Transport[(this.xdomain ? 'callback-polling' : this.options.transport).camelCase()];
		this.registerPlugins();
		this.setup();
		if (this.options.autoHandshake) this.handshake();
	},
	
	setup: function(){
		this.log('Initializing Comet with url: ' + this.url);
		this.status = 'disconnected';
		this.messages = this.batches = this.backoff = 0;
		this.messageQueue = [];
		this.handshakeProps = this.advice = {};
	},
	
	handshake: function(props){
		this.log('Starting handshake');		
		this.batch(true);
		this.status = 'handshaking';
		this.deliver($extend(props, {
    	version: '1.0',
      minimumVersion: '0.9',
      channel: '/meta/handshake',
      supportedConnectionTypes: this.xdomain ? ['callback-polling'] : ['long-polling', 'callback-polling']
    }), false);
	},
	
	connect: function(){
		this.log('Starting connect');
		this.status = 'connecting';
    this.deliver({
    	channel: '/meta/connect',
    	connectionType: this.transport.type
    }, true);
		this.status = 'connected';
	},
	
	disconnect: function(props){
		this.status = 'disconnecting';
    this.deliver($extend(props, {
			channel: '/meta/disconnect'
		}), false);
	},
	
	batch: function(reset){
		if (reset) this.batches = 0;
    ++this.batches;
	},
	
	endBatch: function(deliver){
		--this.batches;
		if (this.batches < 0) this.batches = 0;
		if (deliver && this.batches == 0 && ! this.isDisconnected()){
			var messages = this.messageQueue;
      this.messageQueue = [];
      if (messages.length > 0) this.deliver(messages, false);
		}
	},
	
	subscribe: function(channel, callback, props){
		var suscription = this.addEvent(channel, scope, callback);
		this.send($extend(props, {
			channel: '/meta/subscribe',
			subscription: channel
		}));
		return this;
	},
	
	unsubscribe: function(channel, callback, props){
		this.removeEvent('channel:' + channel, callback);
		this.send($extend(props, {			
      channel: '/meta/unsubscribe',
    	subscription: subscription[0]
		}));
		return this;
	},
	
	publish: function(channel, content, props){
		this.send($extend(props, {
			channel: channel,
			data: content
		}));
		return this;
	},
	
	isDisconnected: function(){
		return this.status.contains('disconnect');
	},
		
	prepareIncoming: function(message){
		return message;
	},
		
	prepareOutgoing: function(message){
		return message;
	},
		
	send: function(message){
		if (this.batches > 0) this.messageQueue.push(message);
		else this.deliver(message, false);
	},
		
	deliver: function(messages, comet){
		messages = $splat(messages);
		messages.each(function(message, index){
			message['id'] = ++this.messages;
			if (this.clientId) message['clientId'] = this.clientId;
			messages[index] = this.prepareOutgoing(message);
		}, this);
		
		var envelope = {
    	url: this.url,
      messages: messages,
      onSuccess: function(request, response){ this.success(request, response, comet); }.bind(this),
      onFailure: function(request){ this.failure(request, messages, comet); }.bind(this)
		};
		
		this.log('Sending request to '+ envelope.url +', message: ' + JSON.encode(envelope.messages));    
		this.transport.send(envelope, comet);
	},
	
	notify: function(channel, message){
		this.fireEvent('channel:' + channel, message);		
		var pieces = channel.split('/');
		if (pieces.length > 1){
			pieces.each(function(piece, i){
				this.fireEvent('channel:' + pieces.slice(0, i).join('/') + '/' + (pieces[i + 1] ? '**' : '*'), message);
			});
		}
	},
	
	performDisconnect: function(abort){
		if (abort) this.transport.abort();
		this.clientId = null;
		this.status = 'disonnected';
		this.batches = 0;
		this.messageQueue = [];
		this.backoff = 0;
	},
	
	success: function(request, response, comet){
		this.log('Received response: '+ JSON.encode(response));
		var success = true, subchannel;
		$splat(response).each(function(message, i){
			message = this.prepareIncoming(message);
			success = success && (!$defined(message.successful) || message.successful);
			subchannel = message.channel.match(/^\/meta\/(.+connect|.+subscribe|handshake)/);
			if (subchannel) return this['success' + subchannel[1].capitalize()](message);		
			if ($defined(message.successful)){				
				if (message.successful){
					this.log('Publish successful');
					this.notify('/meta/publish', message);
				} else {
					this.log('Publish unsuccessful');				
          this.notify('/meta/publish', message);
          this.notify('/meta/unsuccessful', message);
				}
			} else {
 				if (!message.data) return this.log('Unknown message: ' + JSON.encode(message));
				this.notify(message.channel, message);
			}
		});
		this.transport.complete(request, success, comet);
	},
	
	successHandshake: function(message){
		if (message.successful){
			this.log('Handshake successful');
			this.clientId = message.clientId;
			var transport = this.getTransport(message);
			if (!transport) throw new CometException('Could not find suitable transport');
			if (transport.type != this.transport.type){
				this.log('Changing transport from: ' + this.transport.type + ' to ' + transport.type);
				this.transport = transport;
			}
			this.notify('/meta/handshake', message);
     	if ((this.advice.reconnect || 'retry') == 'retry') this.delayedConnect();			
		} else {
			this.log('Handshake unsuccessful');
			var retry = !this.isDisconnected() && this.advice.reconnect != 'none';
			if (!retry) this.setStatus('disconnected');
						
			    var retry = !_isDisconnected() && _advice.reconnect != 'none';
          if (!retry) _setStatus('disconnected');

          _notifyListeners('/meta/handshake', message);
          _notifyListeners('/meta/unsuccessful', message);

          // Only try again if we haven't been disconnected and
          // the advice permits us to retry the handshake
          if (retry)
          {
              _increaseBackoff();
              _debug('Handshake failure, backing off and retrying in {} ms', _backoff);
              _delayedHandshake();
          }
		}
	},
	
	successConnect: function(message){
		
	},
	
	successDisconnect: function(message){
		
	},
	
	successSubscribe: function(message){
		
	},
	
	successUnsubscribe: function(message){
		
	},
	
	failure: function(request, messages, comet){
		this.log('Request failed. Status: '+ obj.status);
		var obj = request.obj;
		$splat(messages).each(function(message, i){
			subchannel = message.channel.match(/^\/meta\/(.+connect|.+subscribe|handshake)/);
			if (subchannel) return this['failure' + subchannel[1].capitalize()](obj, message);		
			this.log('Publish failure');
      var msg = {
      	successful: false,
        failure: true,
        channel: message.channel,
        request: message,
        requestobj: obj,
        advice: {
        	action: 'none',
          interval: 0
				}
			};
			this.notify('/meta/publish', msg);
			this.notify('/meta/unsuccessful', msg);
		});
		this.transport.complete(request, false, comet);
	},
	
	failureHandshake: function(requestobj, message){
		
	},
	
	failureConnect: function(requestobj, message){
		
	},
	
	failureDisconnect: function(requestobj, message){
		
	},
	
	failureSubscribe: function(requestobj, message){
		
	},
	
	failureUnsubscribe: function(requestobj, message){
		
	},
	
	getTransport: function(message){
		var types = message.supportedConnectionTypes;
		if (this.xdomain){
			if (types.contains('callback-polling')) return this.transport;
		} else {
			if (types.contains('long-polling')) return this.transport;
			if (types.contains('callback-polling')) return new Comet.Transport.callbackPolling();
		}
    return null;    
	}
	
});

Comet.Transport = new Class({
	
	Implements: Log,
		
	initialize: function(){
		this.reqcount = 0;
		this.requests = [];
		this.queue = [];
	},
	
	send: function(packet, comet){
		if(comet){
			if(this.cometRequest) throw new CometException('Concurrent Comet requests not allowed. Ongoing: ' + this.cometRequest.id);
			var rid = ++this.reqcount;
			this.log('New Comet request: ' + rid);
			var request = {id: rid};
			this.deliver(packet, request, true);
			this.cometRequest = request;
		} else {
			var rid = ++this.reqcount;
			this.debug('New request: ' + id + '. Concurrent requests: ' + this.requests.length + '. Queued: ' + this.queue.length);
			var request = {id: rid};
			if (this.requests.length + 1 < 2){
				this.log('Queing request: ' + args[1].id + '. Pending: ' + this.queue.length);
				this.queue.push([packet, request]);
			} else {
				this.log('Delivering request: ' + args[1].id);		
				this.deliver(packet, request);
				this.requests.push(args[1]);
			}
		}
	},
	
	complete: function(request, success, comet){
		if (comet){
			var rid = request.id;
			if (this.cometRequest !== request) throw new CometException('Comet request mismatch. Completing request: ' + rid);
			this.cometRequest = false;
			this.log('Finished Comet request: ' + rid)
		} else {
			this.requests.erase(request);
			this.log('Finished request: ' + rid + '. Concurrent requests: ' + this.requests.length + '. Queued: ' + this.queue.length);
			if (this.queue.length){
				var queued = this.queue.shift();
				this.log('Processing queue. Unqueued request: ' + request.id);
				if (success) this.deliver.apply(this, queued);
				else {
					this.log();
					queued[0].onFailure(queued[1], 'error');
				}
			}
		}
	},
	
	cancel: function(){
		this.requests.each(function(req){
			this.log('Aborting request: '+ req.id);
			if (req.obj) req.obj.cancel();
		});
		if (this.cometRequest){
			this.log('Aborting Comet request: ' + this.cometRequest.id);
			if (this.cometRequest.obj) this.cometRequest.obj.cancel();
		}
		this.cometRequest = this.requests = this.queue = false;
	}
	
});

Comet.Transport.longPolling = new Class({
		
	Extends: Comet.Transport,
		
	type: 'long-polling',
		
	deliver: function(packet, request){
		request.obj = new Request.JSON({
			url: packet.url,
			method: 'post',
			headers: { 
				'Content-type': 'text/json; charset=utf-8', 
				'Connection': 'Keep-Alive' 
			},
			data: packet.messages,
			onSuccess: function(response){ packet.onSuccess(request, response); },
			onFailure: function(xhr){ packet.onFailure(request); }
		});
	}
	
});

Comet.Transport.callbackPolling = new Class({
	
	Extends: Comet.Transport,
	
	type: 'callback-polling',

	deliver: function(packet, request){
		new Request.JSONP({
			url: packet.url,
			data: { message: JSON.encode(packet.messages) }
			callbackKey: 'jsonp',
			onSuccess: function(response){ packet.onSuccess(request, response); },
			onFailure: function(xhr){ packet.onFailure(request); }
		});
	}
	
});

var CometException = new Class({
	
	Implements: Log,
	
	toString: function(){
		return this.message;
	},
	
	initialize: function(message, name){
		this.name = 'Comet';
		this.message = message;
		this.log(this.name + ': ' + message);
	}
	
});

});