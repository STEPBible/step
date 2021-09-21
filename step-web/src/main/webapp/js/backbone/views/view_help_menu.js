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
            '<div class="modal aboutModal" role="dialog" aria-labelledby="about" aria-hidden="true">' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<img id="aboutLogo" src="images/step-top-left-logo.png">' +
                '<h4 class="modal-title">STEP : Scripture Tools for Every Person</h4>' +
                '</div>' + //end header
                '<div class="modal-body">' +
                '<div>' +
                '<%= __s.step_thanks %><ul><li><%= __s.step_thanks_tyndale_house %></li><li><%= __s.step_thanks_crosswire %></li><li><%= __s.step_thanks_crossway %></li><li><%= __s.step_thanks_biblica %></li></ul>' +
                '<a href="https://stepbibleguide.blogspot.com/p/copyrights-licences.html" target="_new">Copyright and License information</a>' +
                '<p />' +
                '&copy; STEPBible, Cambridge <%= new Date().getYear() + 1900 %> </p>' +
                '</div>' +
				'<p>' + step.state.getCurrentVersion() + '</p>' +
                '<div class="footer"><button class="btn btn-default btn-sm closeModal" data-dismiss="modal" ><label><%= __s.ok %></label></button></div>' +
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
        var classicalUISetting = (window.localStorage) ? window.localStorage.getItem("step.classicalUI") : $.cookie('step.classicalUI');
		var classicalUI = (classicalUISetting === "true") ? false : true; // reserse the setting
		step.util.setClassicalUI(classicalUI);
		if (window.localStorage) window.localStorage.setItem("step.classicalUI", classicalUI);
		else $.cookie('step.classicalUI', classicalUI);    }
});
