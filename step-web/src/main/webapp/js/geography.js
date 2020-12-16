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
//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119 var singletonWidget;
//pt20201119 function GeographyWidget(rootElement, passages) {
//pt20201119 	this.rootElement = rootElement;
//pt20201119 	this.initialised = false;
//pt20201119 	this.passages = passages;
//pt20201119 	this.markers = [];
//pt20201119 	this.removeMarkers = true;
//pt20201119 	singletonWidget = this;
//pt20201119
//pt20201119 //	$("#bottomModuleHeader").append("Lat: <input id='lat' />");
//pt20201119 //    $("#bottomModuleHeader").append("Long: <input id='long' />");
//pt20201119 	var self = this;
//pt20201119
//pt20201119
//pt20201119     $("#bottomModuleHeader").append("Long: <button id='go2' text='GO2' />");
//pt20201119     $("#go2").click(function() {
//pt20201119         var latlng = new google.maps.LatLng(32.817363, 35.156913);
//pt20201119         self.map.setCenter(latlng);
//pt20201119         self.map.setZoom(20);
//pt20201119
//pt20201119     });
//pt20201119
//pt20201119
//pt20201119 	var self = this;
//pt20201119 	$(rootElement).hear("show-maps", function(selfElement, data) {
//pt20201119 		$(window).resize(self.onResize);
//pt20201119 		self.initialiseLibrary();
//pt20201119 		self.passageId = data.passageId;
//pt20201119 	});
//pt20201119
//pt20201119 	$(rootElement).hear("passage-changed", function(selfElement, data) {
//pt20201119 		self.goToReference(data.reference);
//pt20201119 	});
//pt20201119 };
//pt20201119
//pt20201119 GeographyWidget.prototype.initialiseLibrary = function() {
//pt20201119 	var script = document.createElement("script");
//pt20201119 	script.src = "https://pt20201119www.google.com/jsapi?callback=loadMaps";
//pt20201119 	script.type = "text/javascript";
//pt20201119 	document.getElementsByTagName("head")[0].appendChild(script);
//pt20201119 };
//pt20201119
//pt20201119 function loadMaps() {
//pt20201119   google.load("maps", "3", {"callback" : initialiseFirstTimeMaps, other_params: "sensor=false" });
//pt20201119 }
//pt20201119
//pt20201119 function initialiseFirstTimeMaps() {
//pt20201119 	singletonWidget.initialiseMaps();
//pt20201119 	singletonWidget.goToReference( step.state.passage.reference(singletonWidget.passageId));
//pt20201119 }
//pt20201119
//pt20201119 /**
//pt20201119  * initialises the maps
//pt20201119  */
//pt20201119 GeographyWidget.prototype.initialiseMaps = function() {
//pt20201119 	//pt20201119default could be Jerusalem
//pt20201119 	var latlng = new google.maps.LatLng(31.777444, 35.234935);
//pt20201119
//pt20201119 	if(!this.initialised) {
//pt20201119 	    var myOptions = {
//pt20201119 	      zoom: 6,
//pt20201119 	      center: latlng,
//pt20201119 	      mapTypeId: google.maps.MapTypeId.TERRAIN
//pt20201119 	    };
//pt20201119 	    this.map = new google.maps.Map(this.rootElement.get(0), myOptions);
//pt20201119
//pt20201119
//pt20201119 	        //newark
//pt20201119 	        var altImageBounds = new google.maps.LatLngBounds(
//pt20201119 	                new google.maps.LatLng(32.781323, 35.103733),
//pt20201119 	                new google.maps.LatLng(32.817363, 35.156913));
//pt20201119
//pt20201119 	        var oldmap2 = new google.maps.GroundOverlay(
//pt20201119 	                "http://pt20201119www.tyndalearchive.com/STEP/GEOG/maps/rectangles_JPG/160-243=5x4.jpg",
//pt20201119 	                altImageBounds);
//pt20201119 	        oldmap2.setMap(this.map);
//pt20201119
//pt20201119 	        $("img[src='http://pt20201119www.tyndalearchive.com/STEP/GEOG/maps/rectangles_JPG/160-243=5x4.jpg']").css('opacity',0.5);
//pt20201119
//pt20201119 	    initialised = true;
//pt20201119 	}
//pt20201119 };
//pt20201119
//pt20201119 GeographyWidget.prototype.goToReference = function(reference) {
//pt20201119 	if(this.map) {
//pt20201119
//pt20201119 		if(this.removeMarkers) {
//pt20201119 			this.removeMarkersFromMap();
//pt20201119 		}
//pt20201119
//pt20201119 		var self = this;
//pt20201119 		$.getSafe(GEOGRAPHY_GET_PLACES + reference, function(places) {
//pt20201119 			$.each(places, function(index, place) {
//pt20201119 				var content = "<div>" + place.name + "<br /><div>@ " + place.latitude + ", " + place.longitude + "</div>" + "</div>";
//pt20201119 				var infoWindow = new google.maps.InfoWindow({
//pt20201119 				    content: content
//pt20201119 				});
//pt20201119
//pt20201119 				var marker = new google.maps.Marker({
//pt20201119 						position: new google.maps.LatLng(place.latitude, place.longitude),
//pt20201119 						map: self.map,
//pt20201119 						title: place.name
//pt20201119 				});
//pt20201119
//pt20201119 				self.markers.push(marker);
//pt20201119 				google.maps.event.addListener(marker, 'click', function() {
//pt20201119 					infoWindow.open(self.map, marker);
//pt20201119 				});
//pt20201119 			});
//pt20201119 		});
//pt20201119 	}
//pt20201119 };
//pt20201119
//pt20201119 /**
//pt20201119  * removes all markers from the map
//pt20201119  */
//pt20201119 GeographyWidget.prototype.removeMarkersFromMap = function() {
//pt20201119 	if(this.markers) {
//pt20201119 		for(var ii in this.markers) {
//pt20201119 			this.markers[ii].setMap(null);
//pt20201119 		}
//pt20201119 	}
//pt20201119 };
