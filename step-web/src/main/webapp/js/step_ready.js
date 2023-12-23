(function () {

    function addNavBar() {
        var html = '<div>' +
            '<div class="navbar-header search-form">' +
                '<div class="navbar-brand col-xs-12">' +
                    '<span class="hidden-xs title" title="Reset to default configuration">' +
                        '<a href="/?noredirect" id="logo">' +
                            '<img src="/step.png" alt="STEP" width="90px" height="22px">' +
                        '</a>' +
                    '</span>' +
                    '<span class="help">' +

                        '<div class="headerButtons pull-right">' +
                            '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
                                '<span class="icon-bar"></span>' +
                                '<span class="icon-bar"></span>' +
                                '<span class="icon-bar"></span>' +
                            '</button>' +

                            '<a id="copy-icon" style="padding-left:5px" href="javascript:step.util.copyModal();" title="' + __s.copy + '">' +
                                '<i class="glyphicon glyphicon-copy"></i><span class="hidden-xs navbarIconDesc">&nbsp;&nbsp;' + __s.copy + '</span>' +
                            '</a>' +
                            
                            '<a id="panel-icon" style="padding-left:5px" class="hidden-xs navbarIconDesc" href="javascript:step.util.createNewColumn();" title="' + __s.open_in_new_panel + '">' +
                                '<i class="glyphicon glyphicon-plus"></i><span class="navbarIconDesc hidden-sm">&nbsp;' + __s.new_panel + '</span>' +
                            '</a>' +
                            '<a id="report-icon" style="padding-left:5px" href="html/reports_by_step.html" target="_blank" title="Resources powered by STEPBible">' +
                                '<i class="glyphicon glyphicon-th-list"></i><span class="navbarIconDesc hidden-xs">&nbsp;&nbsp;' + __s.report + '</span>' +
                            '</a>' +
                            '<a id="stats-icon" style="padding-left:5px" href="javascript:step.util.ui.initSidebar(\'analysis\');" title="' + __s.passage_stats + '">' +
                                '<i class="glyphicon glyphicon-stats"></i><span class="hidden-xs navbarIconDesc">&nbsp;&nbsp;' + __s.passage_stats + '</span>' +
                            '</a>' +
                            '<a id="bookmark-icon" style="padding-left:5px" href="javascript:step.util.ui.initSidebar(\'history\');" title="' + __s.bookmarks_and_recent_texts + '">' +
                                '<i class="glyphicon glyphicon-bookmark"></i><span class="hidden-xs navbarIconDesc">&nbsp;' + __s.bookmarks + '</span>' +
                            '</a>' +
                            '<a id="examples-icon" style="padding-left:5px" href="javascript:step.util.ui.showTutorial();" title="' + __s.welcome_to_step + '">' +
                                '<i class="glyphicon glyphicon-question-sign"></i><span class="hidden-xs hidden-sm navbarIconDesc">&nbsp;' + __s.examples + '</span>' +
                            '</a>' +
                            '<a id="fonts-icon" style="padding-left:5px" class="navbarIconDesc" href="javascript:step.util.showFontSettings();"' +
                                'title="' + __s.font_sizes + '">' +
                                '<span class="largerFont" style="color:white;background:#5E5E5E;font-size:22px">' + __s.passage_font_size_symbol + '</span>' +
                                '<span class="hidden-xs navbarIconDesc">&nbsp;' + __s.font + '</span>' +
                            '</a>' +
                            '<span class="navbar-collapse collapse">' +
                                '<span class="dropdown">' +
                                    '<a id="languages-icon" style="padding-left:5px" class="dropdown-toggle" data-toggle="dropdown" title="' + __s.installation_book_language+ '">' +
                                        '<i class="glyphicon icon-language">' +
                                            '<svg xmlns="http://www.w3.org/2000/svg" height="22" width="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>' +
                                        '</i>' +
                                        '<span style="vertical-align:bottom" class="navbarIconDesc">' + __s.installation_book_language + '</span>' +
                                    '</a>' +
                                    '<ul id="languageMenu" class="kolumny pull-right dropdown-menu">' +
                                        '<li><a href="http://crowdin.net/project/step" target="_new">' + __s.translate_step + '</a></li>' +
                                    '</ul>' +
                                '</span>';

        if (!step.state.isLocal()) {
            html +=             '<a style="padding-left:5px" id="raiseSupportTrigger" data-toggle="modal" data-backdrop="static" data-target="#raiseSupport" title="' + __s.help_feedback + '">' +
                                    '<i class="glyphicon glyphicon-bullhorn"></i><span class="navbarIconDesc">&nbsp;' + __s.help_feedback + '</span>' +
                                '</a>';
        }
        html +=                 '<span class="dropdown">' +
                                    '<a id="more-icon" style="padding-left:5px" class="dropdown-toggle helpMenuTrigger" data-toggle="dropdown" title="' + __s.help + '">' +
                                        '<i class="glyphicon glyphicon-option-vertical"></i><span style="vertical-align:bottom;line-height:10px" class="navbarIconDesc">' + __s.more + '</span>' +
                                    '</a>' +
                                    '<ul class="dropdown-menu pull-right helpMenu" dir="' + (step.state.isLtR() ? "ltr" : "rtl") + '">';

        if (!step.state.isLocal()) {
            html +=                     '<li><a href="/downloads.jsp" title="' + __s.download_desktop_step_about + '">' + __s.download_desktop_step + '</a></li>';
        }

        html +=                         '<li class="quick_tutorial"><a href="javascript:void(0)" name="TUTORIAL">' + __s.quick_tutorial_link + '</a></li>' +
                                        '<li><a href="https://www.stepbible.org/videos" target="_blank">' + __s.video_help + '</a></li>' +
                                        '<li><a href="https://stepbibleguide.blogspot.com" target="_blank">' + __s.help_online + '</a></li>';
        if (step.state.isLocal()) {
            html +=                     '<li class="available_bibles_and_commentaries"><a href="/versions.jsp" target="_blank" name="AVAILABLE_BIBLES_AND_COMMENTARIES">' + __s.available_versions + '</a></li>' +
                                        '<li><a href="/setup.jsp">' + __s.tools_settings + '</a></li>';
        }
        else {
            html +=                     '<li><a href="https://stepweb.atlassian.net/wiki/display/SUG/Resources" target="_blank">' + __s.available_versions + '</a></li>';
        }
            html +=                     '<li class="classicalUI"><a href="javascript:void(0)">' + __s.display_classical_ui + '&nbsp;<span id="classicalUICheck" class="glyphicon glyphicon-check" style="font-size:11px"></span></a></li>' +
                                        '<li class="resetEverything"><a href="javascript:void(0)">' + __s.tools_forget_my_profile + '</a></li>' +
                                        '<li><a href="https://stepbibleguide.blogspot.com/p/volunteers.html" target="_blank">' + __s.we_need_help + '</a></li>';
        if (!step.state.isLocal()) {
            html+=                      '<li><a href="javascript:void(0)" id="provideFeedback" data-toggle="modal" data-backdrop="static" data-target="#raiseSupport">' + __s.help_feedback + '</a></li>' +
                                        '<li><a href="/html/cookies_policy.html" target="_blank">' + __s.help_privacy_policy + '</a></li>';
        }
        html +=                         '<li><a target="_new" href="https://stepbibleguide.blogspot.com/p/copyrights-licences.html" name="COPYRIGHT">' + __s.copyright_info_link + '</a></li>' +
                                        '<li class="aboutModalTrigger"><a href="javascript:void(0)" name="ABOUT">' + __s.help_about + '</a></li>';
        if (step.state.isLocal()) {
            html +=                     '<li><a href="/shutdown.jsp">' + __s.tools_exit + '</a></li>';
        }
        html +=                     '</ul>' +
                                '</span>' +
                            '</span>' +
                        '</div>' +
                    '</span>' +
                    '<form role="form">' +
                        '<div class="input-group" id="top_input_area" style="display:none">' +
                            '<input id="masterSearch" type="text" class="form-control input-lg">' +
                            '<span class="input-group-btn findButton">' +
                                '<span>Search</span><i class="find glyphicon glyphicon-search"></i>' +
                            '</span>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
            '</div>' +
        '</div>';
        $("#stepnavbar").append(html);
    };


    function initDataSources() {
        //format the versions correctly
        step.keyedVersions = {};
        step.itemisedVersions = [];
        for (var ii = 0; ii < window.bibleVersions.length; ii++) {
            var tempVersion = {};
            var currentVersion = window.bibleVersions[ii];
            tempVersion["initials"] = currentVersion[0];
            tempVersion["name"] = currentVersion[1];
            var trueFalseValues = currentVersion[7].split("");
            tempVersion["hasStrongs"] = (trueFalseValues[0]) === "T" ? true : false;
            tempVersion["hasMorphology"] = (trueFalseValues[1]) === "T" ? true : false;
            tempVersion["hasRedLetter"] = (trueFalseValues[2]) === "T" ? true : false;
            tempVersion["hasNotes"] = (trueFalseValues[3]) === "T" ? true : false;
            tempVersion["hasHeadings"] = (trueFalseValues[4]) === "T" ? true : false;
            tempVersion["questionable"] = (trueFalseValues[5]) === "T" ? true : false;
            tempVersion["originalLanguage"] = currentVersion[2];
            tempVersion["languageCode"] = currentVersion[3];
            tempVersion["category"] = currentVersion[4];
            tempVersion["languageName"] = currentVersion[5];
            tempVersion["shortInitials"] = currentVersion[6];
            tempVersion["hasSeptuagintTagging"] = (trueFalseValues[6]) === "T" ? true : false;
            var item = {item: tempVersion, itemType: 'version'};
            step.itemisedVersions.push(item);
            step.keyedVersions[tempVersion.initials] = tempVersion;
            step.keyedVersions[tempVersion.shortInitials] = tempVersion;
        }
        //now mark some versions as recommended
        markAsRecommended('ESV');
        markAsRecommended('NIV');
        markAsRecommended('OHB');
        markAsRecommended('SBLG');
        markAsRecommended('LXX');
        markAsRecommended('Neno');
        markAsRecommended('NVI');
        markAsRecommended('PNVI');

        markAsRecommended('FreSegond');
        markAsRecommended('GerElb1905');
        markAsRecommended('GerSch');
        markAsRecommended('ItaRive');
        markAsRecommended('RusSynodal');
        markAsRecommended('NRT');
        window.bibleVersions = null; // save 68k of space
        for (var i = 0; i < window.availLangs.length; i++) {
            var curElement = window.availLangs[i];
            var currentLang = {};
            currentLang["code"] = curElement[0];
            currentLang["originalLanguageName"] = curElement[1];
            currentLang["userLocaleLanguageName"] = curElement[2];
            var trueFalseValues = curElement[3].split("");
            currentLang["complete"] = (trueFalseValues[0] === "T") ? true : false;
            currentLang["partial"] = (trueFalseValues[1] === "T") ? true : false;
            var newLiElement = "<li ";
            var userLangCode = step.userLanguageCode;
            if (userLangCode === "iw") userLangCode = "he"; // iw is Modern Hebrew and he is old Hebrew
            else if (userLangCode === "in") userLangCode = "id"; // in is the old Indonesia language code
            if (userLangCode === currentLang.code)
                newLiElement += "class=active ";
            if (!currentLang.complete) {
                var title = (currentLang.partial) ? __s.partially_translated : __s.machine_translated;
                newLiElement += 'title="' + title + '" ';
            }
            newLiElement += '><a onclick="window.localStorage.clear(); $.cookie(\'lang\', \'' + 
                currentLang.code + '\')"' + ' lang="' +
                currentLang.code + '" href="/?lang=' + currentLang.code;
            if ($.getUrlVars().indexOf("debug") > -1)
                newLiElement += "&debug";
            newLiElement += '">' + currentLang.originalLanguageName + " - " + currentLang.userLocaleLanguageName;
            if (!currentLang.complete)
                newLiElement += "*";
            newLiElement += "</a></li>";
            $("#languageMenu").append(newLiElement);
        }
        window.availLangs = null; // No longer needed, save 2k of memory
    };

    function markAsRecommended(version) {
        var v = step.keyedVersions[version];
        if (v) {
            v.recommended = true;
        }
    }

    function initSettings() {
        var settings = new SettingsModelList;
        settings.fetch();
        if (settings.length == 0) {
            var setting = new SettingsModel;
            settings.add(setting);
            setting.save();
        }
        step.settings = settings.at(0);

        //override some particular settings to avoid UI shifting on load:
        //we never open up a related words section
        step.settings.save({relatedWordsOpen: false});
		step.tempKeyInput = "";
		if (!step.touchDevice) {
			var timer;
			$(document).keyup(function(e) {
                if ($('#saveClrModalInputArea:visible').length > 0) {
                    e.preventDefault();
                    return false;
                }
                if (e.keyCode == 27) { // escape key
                    $("#quickLexicon").remove();
                    $(".qtip-focus").css("opacity",0)
                }
                const element = document.getElementById('quickLexicon');
                if ((element) && (typeof element.scrollTop === "number") && ($('#down-arrow').length = 1)) {
                    if ((e.keyCode == 39) || (e.keyCode == 40) || (e.keyCode == 34) || // down arrow, right arrow, page down
                        (e.keyCode == 40) || (e.keyCode == 190)) { // > or alt-right-arrow
                        element.scrollTop += 150;
                        e.preventDefault();
                        return false;
                    } else if ((e.keyCode == 38) || (e.keyCode == 37) || (e.keyCode == 33) || // up arrow, left arrow, page up
                        (e.keyCode == 38) || (e.keyCode == 188)) { // > or alt-right-arrow
                        element.scrollTop = Math.max(0, element.scrollTop - 150);
                        e.preventDefault();
                        return false;
                    }
                }

				if (($('#s2id_masterSearch:visible').length == 0) && ($("textarea:visible").length == 0) &&
                    ($('textarea#userTextInput:visible').length == 0) && // input area of the search modal
					(!e.altKey) && (!e.ctrlKey)) {
					var code = (e.keyCode ? e.keyCode : e.which);
                    if ((code == 188) || (code == 190)) {
                        var pC = $(".passageContainer");
                        if (pC.length > 1) {
                            var curActiveId = $(".passageContainer.active")[0].getAttribute("passage-id");
                            var panelToMakeActive = 0;
                            for (var i = 0; i < pC.length; i ++) {
                                if ($(".passageContainer")[i].getAttribute("passage-id") == curActiveId) {
                                    if (code == 188) {
                                        if (i > 0) panelToMakeActive = i - 1;
                                        else panelToMakeActive = pC.length - 1;
                                    }
                                    else {
                                        if (i < (pC.length - 1)) panelToMakeActive = i + 1;
                                        else panelToMakeActive = 0;
                                    }
                                    step.util.activePassageId(panelToMakeActive);
                                    break;
                                }
                            }
                        }
                        step.tempKeyInput = "";
                    }
                    else if (code == 37) {
                        if (e.shiftKey) $("a.previousChapter").click();
                        else $(".passageContainer.active").find("a.previousChapter").click();
                        step.tempKeyInput = "";
                    }
                    else if (code == 39) {
                        if (e.shiftKey) $("a.nextChapter").click();
                        else $(".passageContainer.active").find("a.nextChapter").click();
                        step.tempKeyInput = "";
                    }
                    else if ((code == 187) && (!step.touchDevice)) {
                    	step.util.createNewColumn();
                    	step.tempKeyInput = "";
                    }
                    else if (code == 191) {
                    	step.util.ui.showTutorial();
                    	step.tempKeyInput = "";
                    }
					else if (((code > 48) && (code < 52)) || ((code > 64) && (code < 91))) { // 49 = 1, 51 = 3, 65 = A, 90 = Z
                        var curChar = String.fromCharCode(code).toLowerCase();
                        if (e.shiftKey) {
                            step.tempKeyInput = "";
                            if ((curChar === "t") || (curChar === "b")) step.util.startPickBible();
                            else if (curChar === "s") step.util.searchSelectionModal();
                            else if (curChar === "h") step.util.ui.initSidebar('history');
                            else if ((curChar === "p") || (curChar === "r")) step.util.passageSelectionModal();
                            else if ((curChar === "a") || (curChar === "v")) step.util.ui.initSidebar('analysis');
                            else if (curChar === "c") {
                                $(".sidebar-offcanvas").find("a.glyphicon-remove").click();
                                $("#welcomeExamples").find(".closeColumn").click();
                            }
                        }
                        else {
                            timer && clearTimeout(timer);
                            step.tempKeyInput += curChar;
                            timer = setTimeout( function( ) { // If input is less than 2 characters within 1.5 seconds, clear the input
                                    step.tempKeyInput = "";
                            }, 1500);
                            if (step.tempKeyInput.length >= 2) {
                                var arrayOfTyplicalBooksAndChapters = JSON.parse(__s.list_of_bibles_books);
                                for (var i = 0; i < arrayOfTyplicalBooksAndChapters.length; i++) {
                                    var tempVar = arrayOfTyplicalBooksAndChapters[i][0];
                                    if (!(false || !!document.documentMode)) tempVar = tempVar.normalize("NFD"); // For characters with accent.  For example, Spanish
                                    if (tempVar.replace(/[\u0300-\u036f\s]/g,"").toLowerCase().indexOf(step.tempKeyInput) == 0) {
                                        step.util.passageSelectionModal();
                                        step.tempKeyInput = "";
                                        return;
                                    }
                                }
                                step.tempKeyInput = step.tempKeyInput.substr(1); // does not match any of 66 books, remove the first character
                            }
                        }
					}
				}
			});
		}
    };

    function initSearchDropdown() {
        //setup search view
        window.searchView = new MainSearchView();
        //we will sync the URL on load, if and only if there are arguments, i.e. not the home page...
        //to be firmed up
        searchView.syncWithUrl(step.util.activePassage());
    }

    function patchBackboneHistory() {
        //override history in backbone
        Backbone.history = _.extend(Backbone.history, {
            getFragment: function (fragment) {
                if (fragment == null) {
                    var path = window.location.pathname;
                    if (path && path[0] == '/') {
                        path = path.slice(1);
                    }
                    var query = window.location.search;
                    if (query) {
                        path += query;
                    }
                    return path;
                }
                return fragment.replace(/^[#\/]|\s+$/g, '');
            }
        });
    }

    function identifyLikelyPreviousPassage(firstModel) {
        if (!step.passages || !firstModel) {
            return null;
        }

        var firstReference = firstModel.signature;
        for (var ii = 0; ii < step.passages.length; ii++) {
            var p = step.passages.at(ii);
            if (p.get("signature") == firstReference) {
                //likely to be the same passage (crude, I know!)
                return p;
            }
        }

        return step.passages.at(0);
    }

    function initCoreModelsAndRouter() {
        step.router = new StepRouter();
        step.passages = new PassageModelList();
        step.passages.fetch();
        step.bookmarks = new HistoryModelList();
        step.bookmarks.fetch();


        //need to clean up passages... Ideally, by changing the values of passageIds to be 1,2,3,4,...
        //we reserve 0 for the first column
        for (var ii = 0; ii < step.passages.length; ii++) {
            //start at 1, and go onwards from then
            var p = step.passages.at(ii);
            p.save({
                passageId: ii + 1,
                pageNumber: 1,
                results: p.get("firstPageResults"),
                linked: null
            }, {
                silent: true
            });
        }

        //now passage 0 is the one from the URL
        if (window.tempModel) {
            //because of page size, the 'value' is empty, so we'll need to put this back into the model after everything is over
            var pageValue = $(".passageContainer").find(".passageContent").html().trim();

            //now we can create the correct views
            var modelZero = new PassageModel({passageId: 0, position: -1});
            step.passages.add(modelZero);

            //reset some attributes that weren't on the model to start with (because of space reasons)
            window.tempModel.createSilently = true;
            var likelyPreviousPassage = identifyLikelyPreviousPassage(window.tempModel);

            modelZero.save(window.tempModel, {silent: true});
            modelZero.save({
                isQuickLexicon: likelyPreviousPassage ? likelyPreviousPassage.get("isQuickLexicon") : true,
				isSimilarWord: likelyPreviousPassage ? likelyPreviousPassage.get("isSimilarWord") : true,
				// isEnWithEsLexicon: likelyPreviousPassage ? likelyPreviousPassage.get("isEnWithZhLexicon") : true,
                isEnWithZhLexicon: likelyPreviousPassage ? likelyPreviousPassage.get("isEnWithZhLexicon") : true,
                isVerseVocab: likelyPreviousPassage ? likelyPreviousPassage.get("isVerseVocab") : true,
                results: null,
                linked: null,
                value: pageValue,
                isSwipeLeftRight: likelyPreviousPassage ? likelyPreviousPassage.get("isSwipeLeftRight") : true,
            }, {silent: true});
            new PassageMenuView({
                model: modelZero
            });

            step.router.handleRenderModel(modelZero, true, $.getUrlVar('q'));

            $(".helpMenuTrigger").one('click', function () {
                require(["view_help_menu"], function () {
                    new ViewHelpMenuOptions({});
                });
            });
        }

        if (step.passages.length == 0) {
            step.passages.add(new PassageModel({passageId: 0}));
        }

        // new ExamplesView({ el: $(".examplesColumn") });
		
        var stepUsageCountStorageOrCookie = step.util.localStorageGetItem("step.usageCount");
        var stepUsageCount = parseInt(stepUsageCountStorageOrCookie, 10);
        if (isNaN(stepUsageCount)) stepUsageCount = 0;
        var urlVars = $.getUrlVars();
        if ((urlVars.indexOf("skipwelcome") > -1) || (urlVars.indexOf("clickvocab") > -1) ||
            (step.touchDevice && !step.touchWideDevice) ) { // phones do not have the width to display the Welcome to STEP panel
            step.util.showOrHideTutorial('true'); // URL has skipwelcome
            if (urlVars.indexOf("clickvocab") > -1) {
                var pos = urlVars.q.indexOf("strong=");
                if (pos > -1) {
                    var strongNum = urlVars.q.substring(pos+7).split('|')[0].split('&')[0];
                    step.util.ui.showDef(strongNum);
                }
            }
        }
		else {
			if ((stepUsageCount > 12) && (window.innerWidth > 767)) step.util.ui.showTutorial();
			else new ExamplesView({ el: $(".examplesColumn") });
		}
		stepUsageCount ++;
		step.util.localStorageSetItem("step.usageCount", stepUsageCount);

        $("#stepDisclaimer").popover();
    }

    //can this be done before load? self executing function
    // seams like not used 12/1/2023 PT
    // function registerColumnChangeEvents() {
    //     Backbone.Events.listenTo(Backbone.Events, "columnsChanged", function () {
    //         step.util.reNumberModels();
    //     });
    //     step.util.reNumberModels();
    // }

    $(window).on("load", function () {
        //disable amd
        define.amd = null;

        //first of all, if we have a fragment, let's get rid of it
        if ((window.location.hash || "").indexOf("#") != -1) {
            window.location.hash = "";
        }
        window.step = window.step || {};
        initSettings();
        addNavBar();
        initDataSources();
        patchBackboneHistory();
        initCoreModelsAndRouter();
        initSearchDropdown();

        Backbone.history.start({pushState: true, silent: true});


        try {
            var query = $.getUrlVar("q") || "";

            // If the version (i.e., Bible text) is not specified in the URL, then determine
            // the version (and reference) defaults using the recent history
            if ((query.search(/version/) == -1) && ($.getUrlVars().indexOf("noredirect") == -1)) {
//            if (query.search(/version/) == -1) {
                query = query.replace(/%3D/g, '=').replace(/%7C/g, '|');

                var history = new HistoryModelList;
                if (typeof history === "object") {
                    history.fetch();
                    var histIndex = 0;
                    var mostRecentPassage = "";
                    while (histIndex < history.length && mostRecentPassage == "") {
                        var histItem = history.at(histIndex);
                        if (typeof histItem === "object") {
                            var histItemArgs = histItem.get("args");
                            if ((typeof histItemArgs === "string") && (histItemArgs.search(/reference/) > -1)) {
                                mostRecentPassage = decodeURIComponent(histItemArgs)
                                // get the version(s) from the most recent passage in history
                                var pos = mostRecentPassage.search(/version=[^|]+/);
                                var version = "";
                                while (pos > -1) {
                                    var ver = RegExp.lastMatch;
                                    ver = ver.replace(/version=/, '');
                                    if (typeof step.keyedVersions[ver] === "object") {
                                        version += 'version=' + ver + '|';
                                    }
                                    mostRecentPassage = mostRecentPassage.replace(/version=[^|]+/, '');
                                    pos = mostRecentPassage.search(/version=[^|]+/);
                                }
                                version = version.replace(/\|$/, '');

                                if (query === "") {
                                    // get the reference(s) from the most recent passage in history
                                    pos = mostRecentPassage.search(/reference=[^|]+/);
                                    while (pos > -1) {
                                        query += RegExp.lastMatch + '|';
                                        mostRecentPassage = mostRecentPassage.replace(/reference=[^|]+/, '');
                                        pos = mostRecentPassage.search(/reference=[^|]+/);
                                    }
                                    query = query.replace(/\|$/, '');
                                }

                                if (version !== "" && query !== "") {
                                    console.log("Opening to '%s'", version + '|' + query);
                                    //                            step.router.navigateSearch(version + '|' + query, true, true);
                                    var histItemOptions = histItem.get("options") || "";
                                    var histItemDisplay = histItem.get("display") || "";
                                    if ((typeof histItemOptions === "string") && (typeof histItemDisplay === "string"))
                                        step.router.doMasterSearch(version + '|' + query, histItemOptions, histItemDisplay);
                                }
                            }
                        }
                        ++histIndex;
                    }
                }
            }
        } catch (e) {
            console.log("navigate to version+query error: ", e);
        }

        new FeedbackView();
        if (step.passages.length > 1) {
            //delete all passages that are not passageId: 0
            _.each(step.passages.reject(function (m) {
                return m.get("passageId") == 0
            }), function (m) {
                m.destroy();
            });

            //we restore previous passages
//            new RestorePassageView({ callback: function() {
//                registerColumnChangeEvents();
//            }});
//        } else {
//            registerColumnChangeEvents();
        }

        //do cookie notification
        var countriesRequiringCookie = "UNKNOWN GB DE FR IT ES PL RO NL BE GR SE PT AT BG CY CZ DK EE FI HR HU IE LT LU LV MT SI SK";
        if (countriesRequiringCookie.indexOf(step.userCountryCode) > -1) step.util.raiseOneTimeOnly("cookie_notification", 'info');
        var tmp = step.util.localStorageGetItem('colorCode-openStatus');
        if (tmp) {
            localStorage.removeItem('colorCode-openStatus');
            step.util.ui.openStats();
        }
        var tmp = step.util.localStorageGetItem('colorCode-InfoMsg');
        if (tmp) {
            localStorage.removeItem('colorCode-InfoMsg');
            if (tmp != '""') step.util.raiseOneTimeOnly(JSON.parse(tmp), 'info');
        }
        if (step.state.getIncompleteLanguage()) {
            step.util.raiseOneTimeOnly("machine_translated", 'info');
        }
        if (window.localStorage) {
            var storedVersion = step.util.localStorageGetItem("step.version");
            var downloadedVersion = step.state.getCurrentVersion();
            if (storedVersion != downloadedVersion) {
                //we're upgrading to the new version
                console.log("Upgrading versions: ", storedVersion, downloadedVersion);
                step.util.localStorageSetItem("step.version", downloadedVersion);
            }
        }

        //iframe
        if (window != window.top) {
            step.util.showOrHideTutorial(true);
            var button = $("<button class='stepBreakout btn btn-default btn-xs'><span class='glyphicon glyphicon-new-window'></button>");
            $(".headerButtons").append(button);
            button.on("click", function () {
                window.open(window.location);
            });
        }
		var ua = navigator.userAgent.toLowerCase();
		if (ua.indexOf('firefox') > -1) $("#panel-icon").hide(); // Firefox has some issues with this.
		var pos = Math.max(ua.indexOf("ipad"), ua.indexOf("iphone"));
        if ((typeof navigator.clipboard !== "object") || (typeof navigator.clipboard.writeText !== "function"))
            $("#copy-icon").hide();
		if ( ((pos > -1) && (ua.substr(pos + 4).search(/ cpu os [345678]_/) > -1)) || // older versions of iOS shows a light grey color.  Probably similiar issue as Internet Explorer
			(false || !!document.documentMode) ) { // Internet Explorer use the wrong css based on the <a> tag, so change it to black
			$("#panel-icon").css("color", "black");
			$("#stats-icon").css("color", "black");
			$("#bookmark-icon").css("color", "black");
			$("#examples-icon").css("color", "black");
			$("#fonts-icon").css("color", "black");
			$("#languages-icon").css("color", "black");
			$(".icon-language").css("color", "black");
			$("#raiseSupportTrigger").css("color", "black");
			$("#more-icon").css("color", "black");
		}
		step.util.showIntro();
    });
	$( window ).resize(function() {
		step.util.refreshColumnSize();
	});
})();
