//sets up the requirejs config + some other constants
TTL_DAY = 86400000;
requirejs.config({
    waitSeconds: 15000,
    paths : {
        ///////////////////////////////////////////////////////////////////////////////////////
        // IMPORTANT NOTICE: for the mobile app, we require the pattern of files below to be
        // "js/abc.min\"
        ///////////////////////////////////////////////////////////////////////////////////////
        sidebar: ["js/step.sidebar-STEP_SERVER_VERSION_TOKEN.min"],
        quick_lexicon : ["js/step.quick-lexicon-STEP_SERVER_VERSION_TOKEN.min"],
        qtip : ["js/step.qtip-STEP_SERVER_VERSION_TOKEN.min"],
        view_help_menu: ["js/step.help-menu-STEP_SERVER_VERSION_TOKEN.min"],
        drag: ["js/step.draggabilly-STEP_SERVER_VERSION_TOKEN.min"],
        menu_extras: ["js/step.menu_extras-STEP_SERVER_VERSION_TOKEN.min"],
        html2canvas: ["js/step.html2canvas-STEP_SERVER_VERSION_TOKEN.min"],
        search: ["js/step.search-STEP_SERVER_VERSION_TOKEN.min"]
    }
});
