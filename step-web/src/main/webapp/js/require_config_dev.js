//sets up the requirejs config + other constants
TTL_DAY = 60000;
requirejs.config({
    paths : {
        sidebar: ["js/backbone/views/view_sidebar"],
        qtip : ["js/jquery-extensions/jquery-qtip"],
        defaults: ["js/defaults/step.defaults"],
        search: ["js/backbone/views/view_display_word"],
        _search_display_view: ["js/backbone/views/view_display_search"],
        _other_search: ["js/backbone/views/view_display_subject"],
        menu_extras: ["js/backbone/views/view_pick_bible"],
        view_help_menu: ["js/backbone/views/view_help_menu"],
        quick_lexicon: ["js/backbone/views/view_quick_lexicon"],
        drag: ["libs/draggabilly"]
    },
    shim : {
        "menu_extras" : ["js/backbone/views/view_advanced_search"],
        "sidebar" : ["js/backbone/models/model_sidebar", "js/backbone/views/view_wordle_stat",
                     "js/backbone/views/view_history", "libs/jquery.tagcloud"],
        "search" : ["_search_display_view", "_other_search"],
        _other_search: ["_search_display_view", "js/backbone/views/view_display_text", "libs/dohighlight-min",
         "js/jquery-extensions/jquery-sort"],
    }
});
