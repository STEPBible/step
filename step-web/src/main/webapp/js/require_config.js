//sets up the requirejs config + some other constants
TTL_DAY = 86400000;
requirejs.config({
    waitSeconds: 200,
    paths : {
        sidebar: ["js/sidebar-STEP_SERVER_VERSION_TOKEN.min"],
        qtip : ["js/qtip-STEP_SERVER_VERSION_TOKEN.min"],
        select2 : ["libs/select2-STEP_SERVER_VERSION_TOKEN.min"],
        defaults: ["js/defaults/step.defaults-STEP_SERVER_VERSION_TOKEN.min"],
        menu_extras: ["js/menu_extras-STEP_SERVER_VERSION_TOKEN.min"]
    }
});
