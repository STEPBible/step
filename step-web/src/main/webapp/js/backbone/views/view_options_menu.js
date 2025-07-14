var ViewOptionsMenu = Backbone.View.extend({
    el: ".optionsMenu",
    events: {
        "click .classicalUI": "toggleClassicalUI"
    },
    toggleClassicalUI: function () {
        var flag = step.util.localStorageGetItem("step.classicalUI") === "true";
        flag = !flag;
        step.util.setClassicalUI(flag);
        step.util.localStorageSetItem("step.classicalUI", flag.toString());
    }
});

// instantiate when module is loaded
new ViewOptionsMenu(); 