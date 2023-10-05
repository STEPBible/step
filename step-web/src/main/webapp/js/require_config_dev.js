//sets up the requirejs config + other constants
TTL_DAY = 60000;
requirejs.config({
    //line to line against non-dev version
    paths : {
        sidebar: ["js/backbone/views/view_sidebar"],
        quick_lexicon: ["js/backbone/views/view_quick_lexicon"],
        qtip : ["js/jquery-extensions/jquery-qtip"],
        view_help_menu: ["js/backbone/views/view_help_menu"],
        drag: ["libs/draggabilly"],
        search: ["js/backbone/views/view_display_word"],
        menu_extras: ["js/backbone/views/view_pick_bible"],
        html2canvas: ["libs/html2canvas"],
        _search_display_view: ["js/backbone/views/view_display_search"],
        _other_search: ["js/backbone/views/view_display_subject"]
    },
    shim : {
        "menu_extras" : ["js/backbone/views/view_advanced_search"],
        "sidebar" : ["js/backbone/models/model_sidebar", "js/backbone/views/view_wordle_stat",
                     "js/backbone/views/view_history", "libs/jquery.tagcloud"],
        "search" : ["_search_display_view", "_other_search"],
        _other_search: ["_search_display_view", "js/backbone/views/view_display_text", "libs/dohighlight-min", "js/passage/step.alternatives"]
    }
});
