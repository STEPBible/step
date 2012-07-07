var HEBREW_MONTH_NAMES = [ 
	["January", "Tevet" ], 
	["February", "Shevat" ], 
	["March", "Adar" ], 
	["April", "Abib", "Nisan" ], 
	["May", "Iyar" ], 
	["June", "Sivan" ], 
	["July", "Tamuz" ], 
	["August", "Ab" ], 
	["September", "Elul" ], 
	["October", "Tishri" ], 
	["November", "Marcheshvan" ], 
	["December", "Kislev" ]
];
	
var OT_CUT_OFF_DATE = -10;

/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 * 
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

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
	
    this.theme.event.bubble.width = 350;
    this.eventSource = new Timeline.DefaultEventSource();
     
    if(!this.initialised) {
		$.getSafe(TIMELINE_GET_CONFIGURATION, function(data, url) {
			var zones = [];
			
			$.each(data, function(index, item) {
				//create one zone per config item
    			zones.push({   
                            start:  	Timeline.DateTime.parseIso8601DateTime(item.startTime),
                            end:    	Timeline.DateTime.parseIso8601DateTime(item.endTime),
    	                    magnify:  	item.magnify,
    	                    unit:     	Timeline.DateTime[item.scale],
//    						color:     item.color,
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
				    theme: self.theme,
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
		            intervalPixels: 300,
		            theme: self.theme
		        })
	        ];
	
			var decorators = [];
//			$.each(zones, function(index, item) {
//				decorators.push(new Timeline.SpanHighlightDecorator({
//	                   startDate:  item.start,
//	                   endDate:    item.end,
//	                   color:      item.color,
//	                   opacity:    50,
//	                   startLabel: item.description,
////	                   endLabel:   "END",
// 	                  cssClass: 't-highlight1'
//	               }));
//			});
			
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
			'instant' : !item.duration,
			'eventID' : item.eventId
		});
	
		this.eventSource.add(event);
		this.currentEvents[item.eventId] = true;
	}
};

TimelineWidget.prototype.addMultipleEventsAndRefresh = function(data) {
	var self = this;
	
	//add each event to timeline
	$.each(data.events, function(index, item) {
		self.addEvent(item);
	});
	
	this.tl.layout();
};

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
};

TimelineWidget.prototype.addToolbarToggle = function(toolbar, id, text, iconName) {
	var html = "<input type='checkbox' id='" + id + "' /><label for='" + id + "'>" + text + "</label>";
	this.addToolbarIcon(html, toolbar, id, text, iconName);
};


/**
 * Creates a toolbar for the timeline component
 */
TimelineWidget.prototype.initToolbar = function() {
	var self = this;
	
	var toolbar = $("#bottomModuleHeader");
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
};

/**
 * gets the right bit of the date out.
 */
TimelineWidget.prototype.getDateInfo = function(dateObj, datePrecision) {
	var rawDate = "";
	if(dateObj) {
		rawDate = Timeline.DateTime.parseIso8601DateTime(dateObj);
	}

	var text = "";
	
	if(datePrecision == "DAY") {
		text += rawDate.getDate() + " ";
	}
	
	if(datePrecision == "DAY" || datePrecision == "MONTH") {
		var hebrewMonth = HEBREW_MONTH_NAMES[rawDate.getMonth()];
		
		if(hebrewMonth.length > 2 && rawDate.getFullYear() >= 0) {
			text += "<span title='" + hebrewMonth[2] + " is approximately equivalent to " + hebrewMonth[0] + "'>" + hebrewMonth[2] + "</span>";
		} else {
			text += "<span title='" + hebrewMonth[1] + " is approximately equivalent to " + hebrewMonth[0] + "'>" + hebrewMonth[1] + "</span>";
		}
		text += " ";
	}
	
	if(datePrecision != "NONE") {
		//then this is day/month/year
		text += Math.abs(rawDate.getFullYear()) + this.getDateAdBc(rawDate);
	}

	return text;
};


TimelineWidget.prototype.getDateAdBc = function(rawDate) {
	return rawDate.getFullYear() < 0 ? "BC" : "AD";
};


/* Overriding the fill in bubble from the timeline library. */
Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function (elmt, theme, labeller) { 
	//get event details from server
	var version = step.state.passage.version(timeline.passageId); 
		
	$.getSafe(TIMELINE_GET_EVENT_INFO + this.getEventID() + "/" + version, function(eventInfo) {
		//do title
		var title = "<div>" + eventInfo.event.title + "</div>";
		
		
		var dating = "<div class='timelineDatePopup'>";
		dating += timeline.getDateInfo(eventInfo.event.start, eventInfo.event.startPrecision);

		if(eventInfo.event.end) {
			dating += " - ";
			dating += timeline.getDateInfo(eventInfo.event.start, eventInfo.event.startPrecision);
		}
		
		
		
		//add uncertainty and flags
		var certainty = eventInfo.event.certainty;
		if(certainty) {
			//last character is?
			var c = certainty[certainty.length -1];
			
			var accuracy = [];
			if(isAlpha(c)) {
				if(c == 'Y') {
					accuracy = ["year(s)", 'Y'];
				} else if (c == 'M') {
					accuracy = ["month(s)", "M"];
				}
				certainty = certainty.substring(0, certainty.length -1);
			} else {
				switch(eventInfo.event.startPrecision) {
					case "DAY":
						accuracy = ["day(s)", "D"];
					case "MONTH":
						accuracy = ["month(s)", "M"];
					case "YEAR":
						accuracy = ["year(s)", "Y"];
						break;
					default: accuracy = ["year(s)", 'Y'];
				}
			}
			
			
			dating += "&nbsp;<span class='timelineCertainty' title='Dating of this event is known within approximately " 
					+ certainty + " " + accuracy[0] + "'>" + certainty + accuracy[1] + "</span>";
		}
		
		var flags = eventInfo.event.flags;
		if(flags) {
			dating += "&nbsp;<span class='timelineFlags'  title='";

			if(flags == "EY") {
				dating += "Estimated year - The year has been estimated in order to preserve the order of events.";
			} else if(flags == "EM") {
				dating += "Estimated month - The month has been estimated in order to preserve the order of events.";
			}
			dating += "'>" + flags + "</span>";
		}
		dating += "</div>";
		
		
		var body = "<div>";
		
		//do we do more for description: TODO
//		var description = "<div>" + eventInfo.event.description + "</div><br />";
//		body += description;
		
		//do verses
		var verses = "";
		$.each(eventInfo.verses, function(index, item) {
			verses += "<div class='timelineVerse'>";
			
			verses += "<span class='timelineEmphasise'>"; 
			verses += goToPassageArrow(true, item.reference);
			verses +=  " " + item.reference + " "; 
			verses += goToPassageArrow(false, item.reference);
			verses += " </span>";
			verses += $(".verse", item.value).text();
			
			if(item.fragment) {
				verses += "...";
			}
			
			verses += "</div>";
		});
		
		body += verses;
		body += "</div>";
		
		//attach title
		var divTitle = $(title).get(0);
		theme.event.bubble.titleStyler(divTitle);
		$(elmt).append(divTitle);
		
        //attach dating information
        $(elmt).append(dating);
		
		//attach body
        var divBody = $(body).get(0);
//        self.fillDescription(divBody);
        theme.event.bubble.bodyStyler(divBody);
        $(elmt).append(divBody);
        
	});
};

