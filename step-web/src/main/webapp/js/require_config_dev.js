//sets up the requirejs config
requirejs.config({
    paths : {
        sidebar: ["js/backbone/views/view_sidebar"],
        qtip : ["js/jquery-extensions/jquery-qtip"],
    },
    shim : {
        "sidebar" : ["js/backbone/models/model_sidebar"]
    }
});
