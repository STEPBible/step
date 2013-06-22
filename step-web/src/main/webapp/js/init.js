/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in
 * the documentation and/or other materials provided with the
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)
 * nor the names of its contributors may be used to endorse or promote
 * products derived from this software without specific prior written
 * permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
// call the initialisation functions


init();

//some extensions (perhaps should go in another file)
String.prototype.startsWith = function (nonEscapedString) {
    var str = nonEscapedString.replace('+', '\\+');
    return (this.match("^" + str) == nonEscapedString);
};


var topMenu;
var timeline;


function init() {
    $(document).ready(function () {
        $.fn.qtip.defaults.style.classes = "primaryLightBg primaryLightBorder";

        initLocale();
        initBetaWarning();
        checkValidUser();

        initMenu();
        $("li[menu-name] a[name]").bind("click", function () {
            step.menu.handleClickEvent(this);
        });

        initGlobalHandlers();
        initLayout();
        initRefineSearch();

        initData();

        // read state from the cookie
        step.state.restore();

        hearViewChanges();
        $.shout("view-change");

        initJira();
    });
}

function initBetaWarning() {
    $("#stepInDevelopmentWarning").hover(function() {
       $(this).css("opacity", "0");
    }, function() {
        $(this).css("opacity", "1");
    });
}

function initRefineSearch() {
    $(".refinedSearch .closeRefinedSearch").click(function() {
        $(this).closest(".refinedSearch").hide();
        stepRouter.clearRefinedSearch(step.passage.getPassageId(this));
    });
}

function initLocale() {
    var lang = $.getUrlVar("lang");
    var previousLang = $.cookie("lang");

    if (lang) {
        //set cookie session-scope
        $.cookie("lang", lang);

        if (lang != previousLang) {
            //record user email and user name
            var email = $.localStore("userEmail");
            var name = $.localStore("userName");

            forgetProfile(function () {
                //restore userEmail and userName
                $.localStore("userEmail", email);
                $.localStore("userName", name);
            });
        }
    } else {
        //delete the value
        $.cookie("lang", null);
    }


}

function initJira() {
    if (location.hostname.toLowerCase().indexOf("stepbible") >= 0) {
        //init JIRA hook
//        jQuery.ajax({
//            url: "js/jira/issue_collector_dfa819bd.js",
//            type: "get",
//            cache: true,
//            dataType: "script"
//        });

        jQuery.ajax({
            url: "https://stepweb.atlassian.net/s/en_US-bbefts-1988229788/6080/169/1.4.0-m2/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?collectorId=bf70a912",
            type: "get",
            cache: true,
            dataType: "script"
        });


        jQuery.ajax({
            url: "https://stepweb.atlassian.net/s/en_US-bbefts-1988229788/6080/169/1.4.0-m2/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?collectorId=88fe2a64",
            type: "get",
            cache: true,
            dataType: "script"
        });


        window.ATL_JQ_PAGE_PROPS = {
            "88fe2a64": {
                "triggerFunction": function (showCollectorDialog) {
                    //Requries that jQuery is available!
                    jQuery("#provideFeedback").click(function (e) {
                        e.preventDefault();
                        showCollectorDialog();
                    });
//        jQuery.ajax({
//            url: "js/jira/issue_collector_88fe2a64.js",
//            type: "get",
//            cache: true,
//            dataType: "script"
//        });
                }
            },
            "dfa819bd": {
                "triggerFunction": function (showCollectorDialog) {
                    //Requries that jQuery is available!
                    jQuery("#raiseBug").click(function (e) {
                        e.preventDefault();
                        showCollectorDialog();
                    });
                }
            }
        }
    } else {
        //hide some links
        $("#provideFeedback").hide();
    }

}

function registerUser() {
    //to do register
    var name = $("#userName").val();
    var email = $("#userEmail").val();

    if (step.util.isBlank(name)) {
        $("#validationMessage").html("Please provide your name.");
        $("#validationMessage").css("display", "block");
        $("#userName").focus();
        return;
    }

    if (step.util.isBlank(email)) {
        $("#validationMessage").html("Please provide your email.");
        $("#validationMessage").css("display", "block");
        $("#userEmail").focus();
        return;
    }

    var self = this;
    $.getSafe(USER_CHECK, [email, name], function (data) {
        if ("" + data == "true") {
            //success so store information
            $.localStore("userEmail", email);
            $.localStore("userName", name);
            $("#validUser").dialog("close");
        } else {
            //say sorry and reset form
            $("#validationMessage").html(__s.error_registration_closed);
            $("#validationMessage").css("display", "block");
        }
    });
}

function checkValidUser() {
    var email = $.localStore("userEmail");
    //if we're running locally, then just return
    if (window.location.host.startsWith("localhost")) {
        return;
    }

    //if we already have an email address, then exit
    if (!step.util.isBlank(email)) {
        return;
    }

    //if first use, then simply record the date
    var firstUseDate = $.localStore("firstDate");
    if (firstUseDate == undefined) {
        $.localStore("firstDate", new Date().toUTCString());
        return;
    }

    //otherwise check if 3 month have passed
    var date = new Date(firstUseDate);
    var currentDate = new Date();

    var diffInMilliseconds = currentDate.getTime() - date.getTime();

    // 3 months, 30 days, 24 hours, 60 minutes, 60 seconds, 1000 milliseconds
    var term = 3 * 30 * 24 * 60 * 60 * 1000;

    if (term > diffInMilliseconds) {
        //haven't yet reached the period yet.
        return;
    }

    var name = $("#userName, #userEmail").keypress(function (event) {
        var code = (event.keyCode ? event.keyCode : event.which);
        //Enter keycode
        if (code == 13) {
            registerUser();
        }
    });

    $("#validUser").dialog({
        buttons: {
            "Cancel": function () {
                //remind in 3 months
                $.localStore("firstDate", new Date().toUTCString());
                $("#validUser").dialog("close");
            },
            "Register": function () {
                registerUser();
            }
        },
        modal: true,
        closeOnEscape: true,
        title: __s.register_to_use_step
    });
}


function refreshLayout() {
    //we resize the heights:
    var windowHeight = $(window).height();
    var topMenuHeight = $("#topMenu").height();
    var imageAndFooterHeight = $(".northBookmark").height() + $(".logo").height();
    var bottomSectionHeight = $("#bottomSection").height();
    var windowWithoutMenuNorModule = windowHeight - topMenuHeight - bottomSectionHeight;
    var bookmarkHeight = windowWithoutMenuNorModule - imageAndFooterHeight;

    $("body").height($(window).height() - 10);
    $(".bookmarkPane").height(bookmarkHeight - 5);

    var passageContents = $(".passageContent");
    for (var i = 0; i < passageContents.length; i++) {
        var pc = passageContents.get(i);
        var toolbarHeight = $(".passageToolbarFloatingContainer:visible", step.util.getPassageContainer(i)).height();
        var height = windowHeight - $(pc).position().top - toolbarHeight - 8;
        $(pc).height(height);
    }

    $(".leftColumn, .rightColumn, #holdingPage, .passageContainer").height(windowHeight - $(".topMenu").height() - 10);
}

function hearViewChanges() {

    $(window).hear("view-change", function (self, data) {
        var view = data == undefined || data.viewName == undefined ? step.state.view.getView() : data.viewName;
        step.state.view.storeView(view);

        if (view == 'SINGLE_COLUMN_VIEW') {
            if (isSmallScreen()) {
                doSmallScreenView();
            } else {
                $(".leftColumn").removeClass("column").addClass("singleColumn");
                $(".column").toggle(false);
                $("#centerPane").toggle(false);

                //add the holding page
                $("#holdingPage").toggle(true);
                $(".leftColumn").resizable({ handles: 'e', resize: function (e, ui) {
                    //called when the left column is resized
                    adjustColumns();
                }});

                adjustColumns();
            }
        } else {
            $(".column").toggle(true);
            $(".leftColumn").removeClass("singleColumn").addClass("column");
            $("#centerPane").toggle(true);
            $("#holdingPage").toggle(false);

            var leftColumn = $(".leftColumn");

            if (leftColumn.hasClass("ui-resizable")) {
                leftColumn.resizable("destroy");
            }
            step.util.ui.doMenu('rightPaneMenu');
        }

        $.shout("view-change-done");
    });
}

function isSmallScreen() {
    return window.screen.availWidth < 1030;
}

function doSmallScreenView() {
    $(".rightColumn, #holdingPage,#centerPane").css("display", "none");
    $(".leftColumn").css("width", "100%");
}

function adjustColumns() {
    var windowWidth = $(window).width();
    var firstColumnWidth = $(".singleColumn").width();
    $("#holdingPage").width(windowWidth - firstColumnWidth - 5);
}

/**
 * initialises layout
 */
function initLayout() {
    //listen to layout changes and alert
    $(window).resize(function () {
        refreshLayout();
    });


}

function initMenu() {
    var menusToBe = $(".innerMenus");
    menusToBe.each(function () {
        step.util.ui.doMenu($(this).attr("id"));
    });
}

/**
 * sets up the initial data and passages
 */
function initData() {

    //get all supported versions
    var options = {};
    $.getSafe(BIBLE_GET_ALL_FEATURES, function (data) {
        options = data;
    });

    //get data for passages
    // make call to server first and once, to cache all passages:
    $.getSafe(BIBLE_GET_MODULES + true, function (versionsFromServer) {
        step.versions = versionsFromServer.versions;
        step.keyedVersions = {};
        step.strongVersions = {};
        for (var i = 0; i < step.versions.length; i++) {
            step.keyedVersions[step.versions[i].initials.toUpperCase()] = step.versions[i];
            step.keyedVersions[step.versions[i].shortInitials.toUpperCase()] = step.versions[i];

            if (step.versions[i].hasStrongs) {
                step.strongVersions[step.versions[i].initials.toUpperCase()] = step.versions[i];
                step.strongVersions[step.versions[i].shortInitials.toUpperCase()] = step.versions[i];
            }
        }

        step.user = {
            language: {
                code: versionsFromServer.languageCode,
                name: versionsFromServer.languageName
            }
        }

        $.shout("versions-initialisation-completed");
        initApp();

        initModules();
    });
}


function initGlobalHandlers() {
    //set always visible - should probably be its own class
    $("#loading").position({
        of: $("body"),
        my: "top",
        at: "top",
        collision: "fit"
    });

    //TODO refactor as error object
    $("#error").slideUp(0);
    $("#error").click(function () {
        $(this).slideUp(250);
    });

    //transform button
    $("#closeError").button({
        icons: {
            primary: "ui-icon-close"
        },
        text: false
    }).click(function () {
            $("#error").slideUp(250);
        });

    $("#error").hear("caught-error-message", function (selfElement, data) {
        step.util.raiseError(data);
    });


    var infoBar = $(".infoBar").toggle(false);
    infoBar.find(".closeInfoBar").click(function () {
        $(this).closest(".infoBar").toggle(false);
        refreshLayout();
    });
}

/**
 * initialises the modules
 */
function initModules() {
    new LexiconDefinition();
}


