init();

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
			function(m, key, value) {
				vars[key] = value;
			});
	return vars;
}

function init() {
	$(document).bind('pageinit', function() {
		updatePassageView();
	});

	$(document).bind("pagechange", function(toPage, options) {
		if (location.hash === "") {
			// main page
			updatePassageView();
		}
	});
}

/**
 * a typical URL looks like this, so we construct it and then send it to the
 * server:
 * http://localhost:8080/step-web/rest/bible/getBibleText/KJV/Jhn%201:1/HEADINGS,VERSE_NUMBERS,STRONG_NUMBERS,MORPHOLOGY
 */
function updatePassageView() {
	var params = getUrlVars();

	var options = "";
	var version = "KJV";
	var passage = "Romans 1";

	var url = BIBLE_GET_BIBLE_TEXT + version + "/" + passage + "/";

	if (!params["headings"] || params["headings"] === "on") {
		url += "HEADINGS,";
	}

	if (!params["verse_numbers"] || params["verse_numbers"] === "on") {
		url += "VERSE_NUMBERS,";
	}

	if (params["strongs"] === "on") {
		url += "STRONG_NUMBERS,";
	}

	if (params["morphs"] === "on") {
		url += "MORPHOLOGY,";
	}
	
	$.get(url, function(text) {
		// we get html back, so we insert into passage:
		$("#mobileMainPane").html(text.value);
	});

}
