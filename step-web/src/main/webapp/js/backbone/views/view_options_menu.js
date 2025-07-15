var ViewOptionsMenu = Backbone.View.extend({
    el: ".optionsMenu",
    events: {
        "click .classicalUI": "toggleClassicalUI",
        "click .resetEverything": "resetEverything"
    },
    toggleClassicalUI: function () {
        var flag = step.util.localStorageGetItem("step.classicalUI") === "true";
        flag = !flag;
        step.util.setClassicalUI(flag);
        step.util.localStorageSetItem("step.classicalUI", flag.toString());
    },
    resetEverything: function () {
        window.localStorage.clear();
        $.cookie("lang", "");
        //set the location (mirror original code)
        window.location.href = '/' + ($.getUrlVars() || []).indexOf("debug") != -1 ? "" : "?debug";
    }
});

// instantiate when module is loaded
new ViewOptionsMenu(); 