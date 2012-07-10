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
        var option = $("a[name ^= 'SEARCH_']:has(img.selectingTick)", passageContainer);
        var optionName = option.text();
        $(".advancedSearch legend:contains('" + optionName + "')", passageContainer).parent().show();

    }
};

$(step.passage.ui).hear("refresh-passage-display", function(s, data) {
    step.passage.ui.refreshSearchOptions(data);
});


