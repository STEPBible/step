//sets up the requirejs config + some other constants
TTL_DAY = 86400000;
requirejs.config({
    waitSeconds: 15000,
    paths : {
        sidebar: ["js/sidebar-STEP_SERVER_VERSION_TOKEN.min"],
        qtip : ["js/qtip-STEP_SERVER_VERSION_TOKEN.min"],
        defaults: ["js/defaults/step.defaults-STEP_SERVER_VERSION_TOKEN.min"],
        menu_extras: ["js/menu_extras-STEP_SERVER_VERSION_TOKEN.min"],
        view_help_menu: ["js/help-menu-STEP_SERVER_VERSION_TOKEN.min"],
        quick_lexicon : ["js/quick-lexicon-STEP_SERVER_VERSION_TOKEN.min"],
        drag: ["js/draggabilly-STEP_SERVER_VERSION_TOKEN.min"],
        html2canvas: ["js/html2canvas-STEP_SERVER_VERSION_TOKEN.min"]
    }
});
