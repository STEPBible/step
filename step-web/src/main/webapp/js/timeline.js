/**
 * Code for showing and interacting with the timeline
 */

function TimelineWidget(rootElement) {
	this.rootElement = rootElement;
	var self = this;
	
	this.hotspots = [];
	this.timebands = [];
	this.initialised = false;
	
	$(rootElement).hear("show-timeline", function(selfElement) {
		//first show the bottom pane...
		if(!this.initialised) {
			self.initAndLoad();
		} else {
			self.onLoad();
		}
		
		$(window).resize(self.onResize);
	});
	
	$(rootElement).hear("hide-timeline", function(selfElement) {
		//first show the bottom pane...
//		mainAppLayout.close("south");
	});
}

/**
 * @returns true if initialisation was required
 */
TimelineWidget.prototype.initAndLoad = function() {
	this.initialised = true;
	var self = this;
	
	if(this.config == null) {
		//we obtain the configuration from the server - this tells us about timebands -> hotspots, etc.
		$.getSafe(TIMELINE_GET_CONFIG, function(data) {
			//want hotspots -> timebands link (we sent the other way round to save space on the copper wire
    		$.each(data, function(timebandIndex, timeband) {
    			$.each(timeband.hotspots, function(hotspotIndex, hotspot) {
    				self.hotspots[hotspot.id] = {
    						timebandId:	timeband.id,
    						description: hotspot.description,
    						scale: hotspot.scale
    				};
    			});
    			
    			self.timebands[timeband.id] = { description: timeband.description, scale: timeband.scale} ;
    		});
    		self.onLoad();
    	});
	}
}

TimelineWidget.prototype.onLoad = function() {
    var zones = [];
    this.theme = Timeline.ClassicTheme.create();
    var self = this;
    this.theme.event.bubble.width = 250;
    

	
    $.getSafe(TIMELINE_GET_EVENTS_IN_PERIOD +"-101690000000000/-101580000000000", function(json, url) {
    	//work out how many bands to show first!
    	var bands = self.getBands(json.events);

    	if(!self.tl) {
    		self.tl = Timeline.create(self.rootElement[0], bands, Timeline.HORIZONTAL);    	
    	}
    	
//    	bands[0].eventSource.loadJSON(json, TIMELINE_GET_EVENTS_IN_PERIOD +"-101690000000000/-101580000000000");
    	self.loadEvents(bands, json);
    });    
}

/**
 * Returns the bands to be created given the data from the ui
 */
TimelineWidget.prototype.getBands = function(events) {
	var uiTimebands = [];
	var obtained = [];
	
	var self = this;

    var date = "-1250";
    var zones = [];
    
	$.each(events, function(index, event) {
		//TODO this can be optmized, since we are re-creating the uiTimebands every time
		var hotspot = self.hotspots[event.hotSpotId];
		if(hotspot != null) {
			var timeband = self.timebands[hotspot.timebandId];
			var unit = self.resolveScale(timeband.scale);
			
			if(obtained[hotspot.timebandId] == null) {
				obtained[hotspot.timebandId] = true;
				var bandInfo = Timeline.createBandInfo({
					width:          "50px", 
					trackGap: 0.2,
					trackHeight: 0.5,
					intervalUnit:   unit, 
					intervalPixels: 150,
//					zones:          {   start: "-2000", end: "2000", /* magnify:  1, */ unit: unit },
					zones:          {   start: "-1252", end: "-1249", /* magnify:  1, */ unit: unit },
					eventSource:    new Timeline.DefaultEventSource(),
					date:           date,
					theme:          self.theme,
				});
				
				bandInfo.stepTimebandId = hotspot.timebandId;
				uiTimebands.push( bandInfo );
			}
		}
	});

//    alert(uiTimebands);
	return uiTimebands;
}



/**
 * loads up the events on the correct bands
 * the band has a property called stepTimebandId which we can match to hotspots[hotspotId].timebandId
 */
TimelineWidget.prototype.loadEvents = function(bands, json) {
	var self = this;
	var events = json.events;
	
	$.each(bands, function(bandIndex, band) {
		var eventsOnBand = $.grep(events, function(element, eventIndex) {
			//TODO fix events without hotspot ids
			var hotspot = self.hotspots[element.hotSpotId];
			if(hotspot == null) {
				return false;
			}
			
		    return band.stepTimebandId == hotspot.timebandId;
		});
//		alert(eventsOnBand.length);
		band.eventSource.loadJSON({ dateTimeFormat: json.dateTimeFormat, events: eventsOnBand }, TIMELINE_GET_EVENTS_IN_PERIOD +"-101690000000000/-101580000000000");
	});
	
};

/**
 * resolves and returns the timeline scale
 */
TimelineWidget.prototype.resolveScale = function(scale) {
	//TODO remove
//	return Timeline.DateTime.WEEK;

	switch(scale) {
		case 'CENTURY': return Timeline.DateTime.CENTURY;
		case 'DAY': return Timeline.DateTime.DAY;
		case 'DECADE': return Timeline.DateTime.DECADE;
		case 'MILLENIUM': return Timeline.DateTime.MILLENNIUM;
		case 'MONTH': return Timeline.DateTime.MONTH;
		case 'WEEK': return Timeline.DateTime.WEEK;
		case 'YEAR': return Timeline.DateTime.YEAR;
		default: return Timeline.DateTime.MONTH;
	}
};

/**
 * resizes the timeline appropriately
 */
var resizeTimerID = null;
TimelineWidget.prototype.onResize = function() {
    var self = this;
    
	if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
            self.tl.layout();
        }, 500);
    }
}