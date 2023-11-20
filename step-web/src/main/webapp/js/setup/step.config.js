// add case insensitive contains
$.expr[":"].icontains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});


if (!step) {
    step = {};
}

step.config = {
    deleteModule: "glyphicon-remove",
    addModule: "glyphicon-plus",
    currentInstalls : [],
    currentIndexing : [],
    confirmedInternet : false,
    installers : [],
    
    init: function() {
        var self = this;
        // get all installed modules
        this.populateInstalledModules();

        // add click handler to acknowledge warning message
        $("#dismissWarning").click(function() {
            $(this).remove();
            self.populateInstallableModules();
        });

        //kick off update progress thread...
        this.updateProgress();
    },

    receiveItem: function(draggedItem, parent) {
        var self = this;
        var item = $.data(draggedItem.get(0), "item");
        draggedItem.remove();
        var module = self.renderVersion(item, $(parent));
        
        //now work out where it landed and do the appropriate action:
        if($(parent).attr('id') == 'installedColumn') {

        } else {

        }
    },

    /** modules that have yet to be installed */
    populateInstallableModules: function(index) {
        
        var installableColumn = $("#toBeInstalledColumn");
        var self = this;
        $("#loadingRepo").show();
        
        //look for installer with correct index
        var isRepoInternet = true;
        for(var i = 0; i < this.installers.length; i++) {
            if(this.installers[i].index == index) {
                //found
                isRepoInternet = this.installers[i].accessesInternet;
                break;
            }
        }
        
        if(!this.confirmedInternet && isRepoInternet) {
            var confirmed = confirm(__s.installation_accesses_internet);
            if(confirmed != true) {
                return;
            }
            this.confirmedInternet = true;
        }
        
        $.get(MODULE_GET_ALL_INSTALLABLE_MODULES + index + "/BIBLE,COMMENTARY", function(data) {
            $("#loadingRepo").hide();
            
            var versionsContainer = $("#toBeInstalledColumn .versionsContainer");
            versionsContainer.empty();
            if(data.length == 0) {
                versionsContainer.append(__s.installation_all_modules_installers);
            }
            
            $.each(data, function(i, item) {
                self.renderVersion(item, installableColumn, index);
            });
        });
    },

    /** loads the installed modules from the server */
    populateInstalledModules: function() {
        var self = this;
        var installedColumn = $("#installedColumn");
        $.get(MODULE_GET_ALL_MODULES, function(data) {
            $.each(data, function(i, item) {
                self.renderVersion(item, installedColumn).addClass("installed");
            });
        });
    },

    updateProgress: function() {
        var self = this;
        this.queryProgress(SETUP_PROGRESS_INSTALL, this.currentInstalls, 0, function(initials) {
            //now kick off indexing
            //indexing is now in progress
            self.currentIndexing.push(initials);
            $.get(SETUP_REINDEX + initials, function() {
            });
        });

        
        this.queryProgress(SETUP_PROGRESS_INDEX, this.currentIndexing, 50, function(initials) {
            //move the item to the other list
            $("#installedColumn").append($("[data-initials='" + initials + "'").addClass("installed"));
            var infoMessage = $("<div class='bg-success infoMessage'>").append("<span class='pull-right close'>&times;</span>").append(sprintf(__s.installation_module_complete, initials));
            infoMessage.on('click', function() { $(this).remove(); });
            $("body").prepend(infoMessage);

        });
                
        step.util.delay(function() { step.config.updateProgress(); }, 1000);
    },
    
    queryProgress: function(progressUrl, versions, offsetProgress, completeHandler) {
        var self = this;
        if(versions != 0) {
            $.get(progressUrl + versions.join(), function(data) {
                if(data.errorMessage) {
                    for(var i = 0; i < versions.length; i++) {
                        self.currentInstalls = [];
                    }
                    $("#installError").remove();
                    $("body").prepend($("<div id='installError'>").append(__s.error_during_install));
                }


                for(var i = 0; i < versions.length; i++) {
                    var item = $("#" + versions[i]);
                    var currentWidth = item.width();
                    var newWidth = 100 - ((data[i] * 100 / 2) + offsetProgress)  + "%";
                    var realNewWidth = currentWidth > newWidth ? currentWidth : newWidth;
                    item.animate({
                        //because we do indexing to, the current progress is only up-to 50%
                        width: realNewWidth
                    }, 900);
                    
                    if(data[i] == 1) {
                        //remove from in progress list
                        var initials = versions.splice(i, 1) || [];
                        if(initials.length > 0) {
                            if (completeHandler) {
                                completeHandler(initials[0]);
                            }
                        }
                    }
                }
            });
        }
    },
    
    renderVersion: function(item, column, installer) {
        var self = this;

        var category = item.category == 'BIBLE' ? __s.bible : __s.commentary;
        var features = step.util.ui.getFeaturesLabel(item);
        if (features == "") {
            features = " " + __s.not_applicable;
        }


        var isInstallColumn = column.attr("id") == "installedColumn";
        var module = $(
                "<div class='version' data-initials='" + item.shortInitials + "'>" +
                        "<button class='pull-right remove-version' title='" + __s.remove + "'>" +
                            "<span class='glyphicon " + this.deleteModule + "'></span>" +
                        "</button>" +
                        "<button class='pull-right  add-version' title='" + __s.install_now + "'>" +
                        "<span class='glyphicon " + this.addModule + "'></span>" +
                        "</button>" +
                        "<span class='versionContainer'>" +
                            "<div class='versionHeader'>" +
                                "<span class='name'>" +
                                    item.name +
                                "</span> " +
                                "(<span class='initials'>" + item.shortInitials + "</span>) " +
                            "</div>" +
                            "<div class='row'>" +
                                "<span class='col-xs-6 col-md-4'>" +
                                    "<label>" +
                                        __s.category +
                                    "</label>" +
                                    "<span class='category'>" + category + "</span>" +
                                "</span>" +
                                "<span class='col-xs-6 col-md-4'>" +
                                    "<label>" + __s.language + "</label>" +
                                    "<span class='languageName'>" + item.languageName + "</span> " +
                                    "(<span class='languageCode'>" + item.languageCode + "</span>)" +
                                "</span>" +
                                "<span class='features col-xs-6 col-md-4'>" +
                                    "<label>" +
                                        __s.features +
                                    "</label>" +
                                    features +
                                "</span>" +
                            "</div>" +
                        "</span>" +
                 "</div>");

        $(module).data("installer", installer);

        if(column.attr("id") == "installedColumn") {
            module.addClass("bg-success");
        } else {
            module.addClass("bg-danger");
        }

        $.data(module.get(0), "item", item);
        column.find(".versionsContainer").append(module);

        this.addHandlers(module);
        return module;
    },
    addHandlers: function(module) {
        var self = this;
        $("." + this.addModule, module).parent().on("click", function() {
            $("<div class='progressBar' id='"  + $(module).data("initials") + "'>&nbsp;</div>").appendTo(module);
            module.removeClass("bg-danger");
            module.addClass("bg-success");

            //index module
            //bible is about to be installed - add progress bar...
            var initials = $(module).data("initials");
            self.currentInstalls.push(initials);
            var installer = $(module).data("installer");
            if(installer == undefined) {
                installer = -1;
            }

            $.get(SETUP_INSTALL_BIBLE + installer + "/" + initials, function() {
            });
        });
        $("." + this.deleteModule, module).parent().on("click", function() {
            //remove item
            $.get(SETUP_REMOVE_MODULE + $(module).data("initials"), function(data) {
                $(module).remove();
            });
        });
    },
    sortBy: function(field) {
        $("#sortLinks a").removeClass("selected");
        $("#" + field + "Sort").addClass('selected');


        var comparator = function(a, b) { return $.data(a, "item")[field] < $.data(b, "item")[field] ? -1 : 1; };
        $("#installedColumn .version").sortElements(comparator);
        $("#toBeInstalledColumn .version").sortElements(comparator);

        $(".version *").removeClass("ui-state-highlight");
        $(".version ." + field).addClass("ui-state-highlight");
    },
    
    filterBy: function(field) {
        if(!field) {
            field = $(".filterBy").val();
        }
        
        
        var value = $("#filterValue").val();
        $(".version").hide();
        var lc = $("#toBeInstalledColumn ." + field + ":icontains(\"" + value +"\")").closest(".version").show();
        var rc = $("#installedColumn ." + field + ":icontains(\"" + value +"\")").closest(".version").show();
    },

    createOption: function(option) {
        var repositories = $("#repositories");
        var optionElement = $("<option></option>").html(option.name).val(option.index);
        repositories.append(optionElement);
        this.installers.push(option);
        return optionElement;
    },
    
    populateRepositories: function() {
        var self = this;
        var repositories = $("#repositories");
        $.get(SETUP_GET_INSTALLERS, function(data) {
            //the list of installers
            for(var i = 0; i < data.length; i++) {
                self.createOption(data[i]);
            }
        });
        
        repositories.change(function() {
            $("#selectRepository").remove();
            
            var selectedOption = $(this).find(":selected");
            var installerIndex = selectedOption.val() || "";
            if(installerIndex == 'INSTALL_FROM_DIRECTORY') {
                $.get(MODULE_ADD_DIRECTORY_INSTALLER, function(data) {
                    var option = self.createOption(data);
                    option.prop("selected", true);
                    repositories.trigger('change');
                });
            } else if(installerIndex != "") {
                step.config.populateInstallableModules(installerIndex);
            }
        });
    }
};

$(document).ready(function() {
    step.config.init();
    step.config.populateRepositories();
    $("#filterValue").keyup(function() {
        step.config.filterBy();
    });
    $(".filterBy").on("change", function() {
       step.config.filterBy($(this).val());
    });
    $(".sortBy").on("change", function() {
        step.config.sortBy($(this).val());
    });

    $.each($(".version"), function() {
        step.config.addHandlers($(this));
    });
});
