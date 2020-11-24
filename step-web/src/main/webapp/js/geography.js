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
// var singletonWidget;
// function GeographyWidget(rootElement, passages) {
// 	this.rootElement = rootElement;
// 	this.initialised = false;
// 	this.passages = passages;
// 	this.markers = [];
// 	this.removeMarkers = true;
// 	singletonWidget = this;
//
// //	$("#bottomModuleHeader").append("Lat: <input id='lat' />");
// //    $("#bottomModuleHeader").append("Long: <input id='long' />");
// 	var self = this;
//
//
//     $("#bottomModuleHeader").append("Long: <button id='go2' text='GO2' />");
//     $("#go2").click(function() {
//         var latlng = new google.maps.LatLng(32.817363, 35.156913);
//         self.map.setCenter(latlng);
//         self.map.setZoom(20);
//
//     });
//
//
// 	var self = this;
// 	$(rootElement).hear("show-maps", function(selfElement, data) {
// 		$(window).resize(self.onResize);
// 		self.initialiseLibrary();
// 		self.passageId = data.passageId;
// 	});
//
// 	$(rootElement).hear("passage-changed", function(selfElement, data) {
// 		self.goToReference(data.reference);
// 	});
// };
//
// GeographyWidget.prototype.initialiseLibrary = function() {
// 	var script = document.createElement("script");
// 	script.src = "https://www.google.com/jsapi?callback=loadMaps";
// 	script.type = "text/javascript";
// 	document.getElementsByTagName("head")[0].appendChild(script);
// };
//
// function loadMaps() {
//   google.load("maps", "3", {"callback" : initialiseFirstTimeMaps, other_params: "sensor=false" });
// }
//
// function initialiseFirstTimeMaps() {
// 	singletonWidget.initialiseMaps();
// 	singletonWidget.goToReference( step.state.passage.reference(singletonWidget.passageId));
// }
//
// /**
//  * initialises the maps
//  */
// GeographyWidget.prototype.initialiseMaps = function() {
// 	//default could be Jerusalem
// 	var latlng = new google.maps.LatLng(31.777444, 35.234935);
//
// 	if(!this.initialised) {
// 	    var myOptions = {
// 	      zoom: 6,
// 	      center: latlng,
// 	      mapTypeId: google.maps.MapTypeId.TERRAIN
// 	    };
// 	    this.map = new google.maps.Map(this.rootElement.get(0), myOptions);
//
//
// 	        //newark
// 	        var altImageBounds = new google.maps.LatLngBounds(
// 	                new google.maps.LatLng(32.781323, 35.103733),
// 	                new google.maps.LatLng(32.817363, 35.156913));
//
// 	        var oldmap2 = new google.maps.GroundOverlay(
// 	                "http://www.tyndalearchive.com/STEP/GEOG/maps/rectangles_JPG/160-243=5x4.jpg",
// 	                altImageBounds);
// 	        oldmap2.setMap(this.map);
//
// 	        $("img[src='http://www.tyndalearchive.com/STEP/GEOG/maps/rectangles_JPG/160-243=5x4.jpg']").css('opacity',0.5);
//
// 	    initialised = true;
// 	}
// };
//
// GeographyWidget.prototype.goToReference = function(reference) {
// 	if(this.map) {
//
// 		if(this.removeMarkers) {
// 			this.removeMarkersFromMap();
// 		}
//
// 		var self = this;
// 		$.getSafe(GEOGRAPHY_GET_PLACES + reference, function(places) {
// 			$.each(places, function(index, place) {
// 				var content = "<div>" + place.name + "<br /><div>@ " + place.latitude + ", " + place.longitude + "</div>" + "</div>";
// 				var infoWindow = new google.maps.InfoWindow({
// 				    content: content
// 				});
//
// 				var marker = new google.maps.Marker({
// 						position: new google.maps.LatLng(place.latitude, place.longitude),
// 						map: self.map,
// 						title: place.name
// 				});
//
// 				self.markers.push(marker);
// 				google.maps.event.addListener(marker, 'click', function() {
// 					infoWindow.open(self.map, marker);
// 				});
// 			});
// 		});
// 	}
// };
//
// /**
//  * removes all markers from the map
//  */
// GeographyWidget.prototype.removeMarkersFromMap = function() {
// 	if(this.markers) {
// 		for(var ii in this.markers) {
// 			this.markers[ii].setMap(null);
// 		}
// 	}
// };
