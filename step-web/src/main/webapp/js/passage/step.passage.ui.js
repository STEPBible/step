//hear the resize to resize our passage content
$(window).resize(function() {
    step.passage.ui.resize();
});

step.passage.ui = {
    resize : function() {
        $(".passageContent").height($(window).height() - $(".passageContent").position().top);
    },

    refreshSearchOptions : function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        $(".advancedSearch fieldset", passageContainer).hide();
        var optionName = $("a[name ^= 'SEARCH_']:has(img.selectingTick)", passageContainer).text();
        $(".advancedSearch legend:contains('" + optionName + "')", passageContainer).parent().show();

    }
};

$(step.passage.ui).hear("refresh-passage-display", function(s, data) {
    step.passage.ui.refreshSearchOptions(data);
});

$(step.menu).hear("application-ready", function(s, data) {
    for ( var i in step.util.getAllPassageIds()) {
        step.passage.ui.refreshSearchOptions(i);
    }
});
