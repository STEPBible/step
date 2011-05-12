/**
 * Code for showing and interacting with the timeline
 */

function GeographyWidget(rootElement, passages) {
	this.rootElement = rootElement;
	this.initialised = false;
	this.passages = passages; 
	
	var self = this;
	$(rootElement).hear("show-maps", function(selfElement, data) {
		$(window).resize(self.onResize);
		self.initialiseMaps();
		self.goToReference(self.passages[data.passageId].getReference());
	});
	
	$(rootElement).hear("hide-maps", function(selfElement) {
		//TODO remove listener to passage change
	});
	
	$(rootElement).hear("passage-changed", function(selfElement, data) {
		self.goToReference(data.reference);
	});
};

/**
 * initialises the maps
 */
GeographyWidget.prototype.initialiseMaps = function() {
	//default could be Jerusalem
	var latlng = new google.maps.LatLng(31.777444, 35.234935);

	if(!this.initialised) {
	    var myOptions = {
	      zoom: 6,
	      center: latlng,
	      mapTypeId: google.maps.MapTypeId.TERRAIN
	    };
	    this.map = new google.maps.Map(this.rootElement.get(0), myOptions);
	    initialised = true;
	}
};

GeographyWidget.prototype.goToReference = function(reference) {
	if(this.map) {
		var self = this;
		
		$.getSafe(GEOGRAPHY_GET_PLACES + reference, function(places) {
			$.each(places, function(index, place) {
				var marker = new google.maps.Marker({
						position: new google.maps.LatLng(place.latitude, place.longitude),
						map: self.map,
						title: place.esvName
				});
			});
		});
	}
};

