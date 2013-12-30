//sets up the requirejs config + other constants
TTL_DAY = 60000;
requirejs.config({
    paths : {
        sidebar: ["js/backbone/views/view_sidebar"],
        qtip : ["js/jquery-extensions/jquery-qtip"],
        select2 : ["libs/select2"],
        defaults: ["js/defaults/step.defaults"]
    },
    shim : {
        "sidebar" : ["js/backbone/models/model_sidebar"]
    }
});
