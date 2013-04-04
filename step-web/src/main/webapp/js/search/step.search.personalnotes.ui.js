/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project All rights
 * reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. Neither the name of the Tyndale House, Cambridge
 * (www.TyndaleHouse.com) nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
step.search.ui.personalnotes = {
        loaded : [false, false],
        editorIncluded : false,
        path : "./libs/tiny_mce/", 
        
        init : function(passageId) {
            var self = this;
                
            if(!this.editorIncluded) {
                $.getScript(self.path + 'jquery.tinymce.js', function() {
                    self.initEditor(passageId);
                });
                
                this.editorIncluded = true;
            } else {
                self.initEditor(passageId);
            }
        },
        
        initEditor : function(passageId) {
            var self = this;
            var passageContent = step.util.getPassageContent(passageId);
            
            $(passageContent).empty();
            var notesArea = $("<div></div>");
            $(passageContent).append(notesArea);
            $(notesArea).tinymce({
                script_url : self.path + "tiny_mce.js",
                mode: "specific_textareas",
                width : "100%",
                theme: "advanced",
                plugins : "pagebreak,style,table,save,iespell,preview,searchreplace,print,contextmenu,paste,directionality",
                
                theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,bullist,numlist,|,justifyleft,justifycenter,justifyright,justifyfull,|,outdent,indent,blockquote,|,forecolor,backcolor,sub,sup",
                theme_advanced_buttons2 : "formatselect,fontselect,fontsizeselect,cut,copy,paste,pastetext,pasteword,|,search,replace,|,undo,redo,|,preview",
                theme_advanced_buttons3 : "tablecontrols,|,hr,removeformat",
//                theme_advanced_resizing : true,

                // Example content CSS (should be your site CSS)
                content_css : "./css/passage.css"
            });
        },
        
        save : function(passageId) {
            
        },
        
        newDoc : function(passageId) {
            
        },
        
        deleteDoc : function(passageId) {
            
        }
};

$(document).ready(function() {
    var namespace = "personalnotes";
    step.state.trackState([
                           ".personalNotesSearch",
                           ".personalNotesCurrent",
                           ], namespace);
    
    $(".personalNotesSave").button({
        icons : { primary : "ui-icon-disk" }, text : false
    }).click(function() {
        step.search.ui.personalnotes.save(step.passage.getPassageId(this));
    });

    $(".personalNotesNew").button({
        icons : { primary : "ui-icon-document" }, text : false
    }).click(function() {
        step.search.ui.personalnotes.newDoc(step.passage.getPassageId(this));
    });

    $(".personalNotesDelete").button({
        icons : { primary : "ui-icon-trash" }, text : false
    }).click(function() {
        step.search.ui.personalnotes.deleteDoc(step.passage.getPassageId(this));
    });

});

$(step.search.ui).hear("personal-notes-state-has-changed", function(s, data){
    var passageId = data.passageId;
    step.search.ui.personalnotes.init(passageId);
});

$(step.search.ui).hear("SEARCH_PERSONAL_NOTES-activated", function(s, data) {
    var passageId = data.passageId;
    step.search.ui.personalnotes.init(passageId);
});
