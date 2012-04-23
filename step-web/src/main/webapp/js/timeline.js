/**
 * Code for showing and interacting with the timeline
 */
function TimelineWidget(rootElement, passages) {
	this.rootElement = rootElement;
	this.passages = passages;
	this.initialised = false;
	this.active = false;
	this.currentEvents = {};
	
	var self = this;

	// register the "show-timeline" event
	$(rootElement).hear("show-timeline", function(selfElement, data) {
		self.passageId = data.passageId;
		self.active = true;
		self.linkToPassage = true;
		
		// first show the bottom pane...
		if(!this.initialised) {
			self.initAndLoad();
		} else {
			self.onLoad();
		}
				
		$(window).resize(self.onResize);
	});
	
	$(rootElement).hear("passage-changed", function(selfElement, data) {
		if(self.initialised && self.linkToPassage) {
			self.onLoad();
		}
	});	
}

TimelineWidget.prototype.initAndLoad = function() {
	var self = this;
	
	//set up the theme
	this.theme = Timeline.ClassicTheme.create();
	
    this.theme.event.bubble.width = 250;
    this.eventSource = new Timeline.DefaultEventSource();
     
    if(!this.initialised) {
		$.getSafe(TIMELINE_GET_CONFIGURATION, function(data, url) {
			var zones = [];
			
			$.each(data, function(index, item) {
				//create one zone per config item
    			zones.push({   
                            start:  	Timeline.DateTime.parseIso8601DateTime(item.start),
                            end:    	Timeline.DateTime.parseIso8601DateTime(item.end),
    	                    magnify:  	item.magnify,
    	                    unit:     	Timeline.DateTime[item.scale],
    						color:     item.color,
    						description: item.description
    			});
    		});
	
			self.bands = [ 
				Timeline.createHotZoneBandInfo({
				    width:          "80%", 
				    intervalUnit:   Timeline.DateTime.MONTH, 
				    intervalPixels: 100,
				    zones:          zones,
				    eventSource:    self.eventSource,
				    zoomIndex: 10,
				    zoomSteps: new Array(
		              {pixelsPerInterval: 280,  unit: Timeline.DateTime.HOUR},
		              {pixelsPerInterval: 140,  unit: Timeline.DateTime.HOUR},
		              {pixelsPerInterval:  70,  unit: Timeline.DateTime.HOUR},
		              {pixelsPerInterval:  35,  unit: Timeline.DateTime.HOUR},
		              {pixelsPerInterval: 400,  unit: Timeline.DateTime.DAY},
		              {pixelsPerInterval: 200,  unit: Timeline.DateTime.DAY},
		              {pixelsPerInterval: 100,  unit: Timeline.DateTime.DAY},
		              {pixelsPerInterval:  50,  unit: Timeline.DateTime.DAY},
		              {pixelsPerInterval: 400,  unit: Timeline.DateTime.MONTH},
		              {pixelsPerInterval: 200,  unit: Timeline.DateTime.MONTH},
		              {pixelsPerInterval: 100,  unit: Timeline.DateTime.MONTH} 
				    )
				}),
		        
		        Timeline.createBandInfo({
		        	overview:       true,
		            trackHeight:    0.5,
		            trackGap:       0.2,
		            eventSource: 	self.eventSource,
		        	width:          "30%", 
		            intervalUnit:   Timeline.DateTime.YEAR, 
		            intervalPixels: 300
		        })
	        ];
	
			var decorators = [];
			$.each(zones, function(index, item) {
				decorators.push(new Timeline.SpanHighlightDecorator({
	                   startDate:  item.start,
	                   endDate:    item.end,
	                   color:      item.color,
	                   opacity:    50,
	                   startLabel: item.description,
//	                   endLabel:   "END",
 	                  cssClass: 't-highlight1'
	               }));
			});
			
			self.bands[0].decorators = decorators;
			
			self.bands[1].syncWith = 0;
			self.bands[1].highlight = true;
		    
			//set up timeline
			self.tl = Timeline.create(self.rootElement[0], self.bands, Timeline.HORIZONTAL);

			//set up scrollers
			self.tl.getBand(0).addOnScrollListener(function(band) {
				self.intelligentScroll(band);
	        });
		
			self.initToolbar();
		
			// set status as successfully initialised
			self.initialised = true;
			self.onLoad();
		});
    }
};


/**
 * adds an event to the timeline, the caller is required to call the refresh layout on the timeline
 */
TimelineWidget.prototype.addEvent = function(item) {
	//we only add the event if it is not already on our timeline... 

	if(!(item.eventId in this.currentEvents)) {
		var event = new Timeline.DefaultEventSource.Event({
			'start' : Timeline.DateTime.parseIso8601DateTime(item.start), 
			'end' : Timeline.DateTime.parseIso8601DateTime(item.end), 
			'description' : item.description, 
			'text' : item.title,
			'instant' : !item.duration
		});
	
		this.eventSource.add(event);
		this.currentEvents[item.eventId] = true;
	}
}

TimelineWidget.prototype.addMultipleEventsAndRefresh = function(data) {
	var self = this;
	
	//add each event to timeline
	$.each(data.events, function(index, item) {
		self.addEvent(item);
	});
	
	this.tl.layout();
}

/**
 * Let us load stuff relevant to our passage
 */
TimelineWidget.prototype.onLoad = function() {
	var reference = this.passages[this.passageId].getReference();
	var self = this;

	//load events from server
	$.getSafe(TIMELINE_GET_EVENTS_FROM_REFERENCE + reference, function(data, url) {
		
		//move timeline to different date
		//assuming first band is main band
		
		if(data.suggestedDate) {
			self.tl.getBand(0).setCenterVisibleDate(Timeline.DateTime.parseIso8601DateTime(data.suggestedDate));
			self.addMultipleEventsAndRefresh(data);			
		}
		
		// now that we have repositioned the timeline, we can try and 
		// get the other events within the visible time period
		self.showVisibleEvents(self.tl.getBand(0));
	});
};

/**
 * Shows currently visible events on the timeline and refreshes the layout
 */
TimelineWidget.prototype.showVisibleEvents = function(band) {
	var self = this;
	
	$.getSafe(TIMELINE_GET_EVENTS_IN_PERIOD +  
					band.getMinVisibleDate().toISOString() + "/" + 
					band.getMaxVisibleDate().toISOString(), 
					function(data, url) {
		self.addMultipleEventsAndRefresh(data);
		self.lastRecordedOffset = band.getViewOffset();
	});
};

/**
 * this asks for new events only if we do not already have asked for a similar window
 * 
 * say 100px if we can work that out...
 * 
 */
TimelineWidget.prototype.intelligentScroll = function(band) {
	if(!this.lastRecordedOffset) {
		this.lastRecordedOffset = 0;
	}
	
	//we lookup from the server if we've moved more than 50px!
	var currentOffset = band.getViewOffset();
	var diffOffset = Math.abs(this.lastRecordedOffset - currentOffset);
	
	if(diffOffset >= 100) {
		this.showVisibleEvents(band);		
	}
};


TimelineWidget.prototype.addToolbarIcon = function(html, toolbar, id, text, iconName) {
	toolbar.append(html);
	$("#" + id, toolbar).button({ text: false, icons: { primary: iconName }});
};

TimelineWidget.prototype.addToolbarButton = function(toolbar, id, text, iconName) {
	var html = "<a id='" + id + "'>" + text + "</a>";
	this.addToolbarIcon(html, toolbar, id, text, iconName);
}

TimelineWidget.prototype.addToolbarToggle = function(toolbar, id, text, iconName) {
	var html = "<input type='checkbox' id='" + id + "' /><label for='" + id + "'>" + text + "</label>";
	this.addToolbarIcon(html, toolbar, id, text, iconName);
};


/**
 * Creates a toolbar for the timeline component
 */
TimelineWidget.prototype.initToolbar = function() {
	var self = this;
	
	var toolbar = $("#bottomModuleHeader")
	this.addToolbarButton(toolbar, "scrollTimelineLeft", "Scroll left", 'ui-icon-seek-prev');
	this.addToolbarButton(toolbar, "scrollTimelineRight", "Scroll right", 'ui-icon-seek-next');
	this.addToolbarButton(toolbar, "zoomInTimeline", "Zoom in", 'ui-icon-zoomin');
	this.addToolbarButton(toolbar, "zoomOutTimeline", "Zoom out", 'ui-icon-zoomout');
	this.addToolbarButton(toolbar, "scrollTimelineToDate", "Scroll to date", 'ui-icon-search');
	this.addToolbarButton(toolbar, "linkToPassage", "Unlink from passage", 'ui-icon-pin-s');
	
	$("#bottomModuleHeader #scrollTimelineLeft").click(function() {
			var mainBand = self.tl.getBand(0);
			mainBand.scrollToCenter(mainBand.getMinVisibleDate());
	});

	$("#bottomModuleHeader #scrollTimelineRight").click(function() {
		var mainBand = self.tl.getBand(0);
		mainBand.scrollToCenter(mainBand.getMaxVisibleDate());
	});
	
	$("#bottomModuleHeader #zoomInTimeline").click(function() {
		var mainBand = self.tl.getBand(0);
		mainBand.zoom(true);
		self.tl.paint();
		self.tl.layout();
	});

	$("#bottomModuleHeader #zoomOutTimeline").click(function() {
		var mainBand = self.tl.getBand(0);
		mainBand.zoom(false);
		self.tl.paint();
		self.tl.layout();
	});
	
	
	$("#bottomModuleHeader #linkToPassage").click(function() {
		if($(this).text() === "Link to passage") {
			$(this).button("option", {icons: { primary: "ui-icon-pin-s" }, label: "Unlink from passage"});
			self.linkToPassage = true;
			
			//trigger reload in case passage has already changed
			self.onLoad();
		} else {	
			$(this).button("option", {icons: { primary: "ui-icon-pin-w" }, label: "Link to passage"});
			self.linkToPassage = false;
		}		
	});
	
	
	$("#bottomModuleHeader #scrollTimelineToDate").click(function() {
		var datePopup = $("#goToDate");
		$("#scrollToYear", datePopup).val(self.tl.getBand(0).getCenterVisibleDate().getFullYear());
		datePopup.dialog({ title: "Please enter a year:",
						   modal: true, 
						   buttons : [{ 
						            	  text: "OK", 
						            	  click: function() { 
						            		  $(this).dialog("close"); 
						            		  var yearValue = $("#scrollToYear", datePopup).val();
						            		  self.tl.getBand(0).setCenterVisibleDate(Timeline.DateTime.parseIso8601DateTime(yearValue)); 
						            		  self.showVisibleEvents(self.tl.getBand(0)); 
						              }
						   }] 
						}).show();
	});
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

            if(self.tl) {
            	self.tl.layout();
            }
            
        }, 500);
    }
}

/* Overriding the fill in bubble from the timeline library. */
Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function (elmt, theme, labeller) { 
	var start = new Date(this.getStart());
	start = (start.getFullYear() < 0) ? Math.abs(start.getFullYear()) + " BC" : start.getFullYear() + " AD";
	
	var end = new Date(this.getEnd());
	end = (end.getFullYear() < 0) ? Math.abs(end.getFullYear()) + " BC" : end.getFullYear() + " AD";	
	
	var doc = elmt.ownerDocument; 
	var title = this.getText(); 
	var link = this.getLink(); 
	var image = this.getImage(); 

	if (image != null) { 
		var img = doc.createElement("img"); 
		img.src = image; 
		theme.event.bubble.imageStyler(img); 
		elmt.appendChild(img); 
	} 
	var divTitle = doc.createElement("div"); 
	var textTitle = doc.createTextNode(title); 
	if (link != null) { 
		var a = doc.createElement("a"); 
		a.href = link; 
		a.appendChild(textTitle); 
		divTitle.appendChild(a); 
	} else { 
		divTitle.appendChild(textTitle); 
	} 
	theme.event.bubble.titleStyler(divTitle); 
	elmt.appendChild(divTitle); 
	var divBody = doc.createElement("div"); 
	this.fillDescription(divBody); 
	theme.event.bubble.bodyStyler(divBody); 
	elmt.appendChild(divBody); 
	
	// This is where they define the times in the bubble
	var divTime = doc.createElement("div"); 
	divTime.innerHTML = start + " - " + end; 
	elmt.appendChild(divTime); 
	var divWiki = doc.createElement("div"); 
	this.fillWikiInfo(divWiki); 
	theme.event.bubble.wikiStyler(divWiki); 
	elmt.appendChild(divWiki); 
} 

