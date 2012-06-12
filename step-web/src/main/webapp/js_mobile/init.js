state = {verseNumbers: true, headings: true, strongs: false, morphs: false};
init();

var currentShowingURL;

function getUrlVars(data) {
	var vars = {};
	var parts = (data == null ? window.location.href : data).replace(/[?&]+([^=&]+)=([^&]*)/gi,
			function(m, key, value) {
				vars[key] = value;
			});
	return vars;
}


function init() {
	//initialise versions:
	var options = "";
	$.getJSON(BIBLE_GET_BIBLE_VERSIONS, function(data) {
		$.each(data, function(index, item) {
			//TODO - de-duplicate code?
			var versionItem = "<option value='" + item.initials + "'>[" + 
				item.initials + "] " + item.name;
			if(item.hasStrongs) {
				versionItem += " " + "<span class='versionFeature strongsFeature' title='Supports Strongs concordance'>V</span>";
				versionItem += " " + "<span class='versionFeature interlinearFeature' title='Supports interlinear feature'>I</span>";
			}

			// add morphology
			if(item.hasMorphology) {
				versionItem += " " + "<span class='versionFeature morphologyFeature' title='Supports the grammar feature'>G</span>";
			}
			
			versionItem += "</option>";
			options += versionItem;
			
		});
		
		$("#versions").html(options);
	});
	

	$(document).delegate('#optionsButton', 'click', function() {
		 updateDialogView();
		$('<div id="viewOptions">').simpledialog2({
			mode: 'blank',
			headerText: 'Passage Options',
			headerClose: true,
			dialogAllow: true,
			dialogForce: true,
			blankContent : $("#optionsContent").html(),
		});
	});
	
	
	
	$(document).delegate("#updateView", 'click', function() {
		state.verseNumbers = $("#verseNumbers").attr('checked') === 'checked';
		state.headings = $("#headings").attr('checked') === 'checked';
		state.strongs = $("#strongs").attr('checked') === 'checked';
		state.morphs = $("#morphs").attr('checked') === 'checked';
		
		updatePassageView();
	});
	updatePassageView();
}


function updateDialogView() {
	setOrRemoveChecked(state.verseNumbers, "#verseNumbers");
	setOrRemoveChecked(state.headings, "#headings");
	setOrRemoveChecked(state.strongs, "#strongs");
	setOrRemoveChecked(state.morphs, "#morphs");
}

function setOrRemoveChecked(toggle, element) {
	if(toggle) {
		$(element).attr('checked', 'checked');
	} else {
		$(element).removeAttr('checked');
	}
		
}

/**
 * a typical URL looks like this, so we construct it and then send it to the
 * server:
 * http://localhost:8080/step-web/rest/bible/getBibleText/KJV/Jhn%201:1/HEADINGS,VERSE_NUMBERS,STRONG_NUMBERS,MORPHOLOGY
 */
function updatePassageView() {
	var version = "KJV";
	var passage = "Romans 1";

	var url = BIBLE_GET_BIBLE_TEXT + version + "/" + passage + "/";

	if (state.headings) {
		url += "HEADINGS,";
	}

	if (state.verseNumbers) {
		url += "VERSE_NUMBERS,";
	}

	if (state.strongs) {
		url += "STRONG_NUMBERS,";
	}

	if (state.morphs) {
		url += "MORPHOLOGY,";
	}
	
	$.get(url, function(text) {
		$("#contentPane").html(text.value);
	});
}
