var ViewHelpMenuOptions = Backbone.View.extend({
    events: {
        "click .resetEverything": "resetEverything",
        "click .aboutModalTrigger": "showAbout",
        "click .quick_tutorial": "openTutorial",
		"click .classicalUI": "classicalUI"
    },
    el: ".helpMenu",
    showAbout: function () {
        $(_.template(
            '<div id="aboutModal" class="modal aboutModal" role="dialog" aria-labelledby="about" aria-hidden="true">' +
                '<div class="modal-dialog">' +
                '<div class="modal-content stepModalFgBg">' +
                '<div class="modal-header">' +
				step.util.modalCloseBtn("aboutModal") +
                '<img id="aboutLogo" src="images/step-top-left-logo.png">' +
                '<h4 class="modal-title">STEP : Scripture Tools for Every Person</h4>' +
                '</div>' + //end header
                '<div class="modal-body">' +
                '<div>' +
				'<h4>Description</h4>' +
				'<p>STEP stands for \'Scripture Tools for Every Person\' and is designed to give users across the world, particularly those in disadvantaged countries, free access to trustworthy Bible expertise. Created by Bible scholars at Tyndale House, Cambridge, UK, it is curated by a non-denominational body of scholars and other volunteers who are passionate about sharing accurate information on the Bible.' +
				'<p>With STEPBible you can:' +
				'<ul>' +
				'<li>Quickly find and open a chapter to read. (This is the most important feature: reading the Bible text! )</li>' +
				'<li>Easily search for and list verses that contain a word, or open a structured list of verses to study a topic.</li>' + 
				'<li>Open and compare a Bible alongside one or more other Bibles in any language, including Greek and Hebrew texts.' + 
				'<li>View the verses of each version interleaved, or view them side-by-side.' + 
				'<li>Hover over words in tagged versions to highlight the corresponding words in other versions.' + 
				'<li>Search the text of that version or of several open versions at the same time.' + 
				'<li>Search for Greek or Hebrew words and see the results in any Bible, with the translated word highlighted in tagged Bibles.' + 
				'<li>Type in an English word and see the list of possible Greek or Hebrew words to search for.' + 
				'<li>Discover the original Greek and Hebrew vocabulary of a verse, even in untagged Bibles.' + 
				'<li>Click on words to reveal comprehensive lexical and morphology information.' + 
				'<li>See grammar morphology presented in both scholarly and easily understood terms.' + 
				'<li>Access lexical information both in simple dictionaries and scholarly lexicons which have been made more readable and have no confusing abbreviations.' + 
				'<li>View standard verse numbers (as used in most commentaries) in addition to alternate versification that is used in some Bibles.' + 
				'<li>Use the many other features and possibilities that exist due to the remarkable mix of Bibles and datasets that are available.' + 
				'</ul>' +
				
				'<p>STEPBible enables all Bible translations to become study Bibles, and allows all users to explore the Bible in their own language and access the best Bible expertise.  The software is multi-lingual, and free to use and to download as a tool that continues to work when the Internet fails.' +
 
				'<p>STEPBible automatically opens in the language of the computer user and includes Bibles in hundreds of languages. It aims to allow anyone to read the Bible in their mother tongue, give them the opportunity to quickly find the passages they are seeking, and then to read or study the text as deeply as they wish.' +
 
				'<p>In addition to being used extensively in the disadvantaged world, STEPBible is also used in Bible schools in the West who value its wide range of unique features. Some colleges have even made STEPBible compulsory for their students.' +

				'<p>STEPBible automatically lists all the Bibles in the language of the user\'s computer, so they can see which Bibles are available, and compare them, as they look for their ideal Bible. The interface is available in more than 50 gateway languages and hosts Bibles in hundreds of languages.' +
 
				'<p>STEPBible provides an alternative to expensive, highly-resourced software, without compromising on accuracy. The website and software carry no advertising and include no content that is charged for. The data is verified and augmented by academically trained scholars and made available for inspection and use under a CC-BY licence at https://stepbible.github.io/STEPBible-Data/.' +
 
				'<p>STEPBible.org is a UK Charitable Incorporated Organisation #1193950.  See the <a href="https://docs.google.com/document/d/1uwR2u0swmF3w1VG9Q81MCvRSt4yswhxZ/preview" target="_new">Constitution here</a>, and the <a href="https://docs.google.com/document/d/1DqyVGvsWdjV6NLlAnMeP-h3BYufec9ChR2DPl9_qT5g/preview" target="_new">Aims & Structure here</a>.' +
				
				'<h4>Acknowledgements</h4>' +
				
                '<%= __s.step_thanks %><ul><li><%= __s.step_thanks_tyndale_house %></li><li><%= __s.step_thanks_crosswire %></li><li><%= __s.step_thanks_crossway %></li><li><%= __s.step_thanks_biblica %></li>' +
				'<li>Many other contributors of licensed data and texts, listed <a href="https://stepbibleguide.blogspot.com/p/copyrights-licences.html" target="_new">here</a></li>' +
				'</ul>' +
                '<p />' +
                '&copy; STEPBible, Cambridge <%= new Date().getYear() + 1900 %> </p>' +
                '</div>' +
				'<p>' + step.state.getCurrentVersion() + '</p>' +
                '<div class="footer"><button class="btn btn-default btn-sm closeModal stepButton" data-dismiss="modal" ><label><%= __s.ok %></label></button></div>' +
                '</div>' + //end modal body
                '</div>' + //end content
                '</div>' + //end dialog
                '</div>' +
                '</div>')()).modal("show");
    },
    resetEverything: function () {
        window.localStorage.clear();
        $.cookie("lang", "");

        //set the location
        window.location.href = '/' + ($.getUrlVars() || []).indexOf("debug") != -1 ? "" : "?debug";
    },
    openTutorial : function() {
        step.util.ui.showTutorial();
    },
	classicalUI : function() {
        var classicalUISetting = step.util.localStorageGetItem('step.classicalUI');
		var classicalUI;
		if (classicalUISetting === "true") { // reserse the setting
			classicalUI = false;
			classicalUISetting = "false";
		}
		else {
			classicalUI = true;
			classicalUISetting = "true";
		}
		step.util.setClassicalUI(classicalUI);
		step.util.localStorageSetItem("step.classicalUI", classicalUISetting);
	}
});
