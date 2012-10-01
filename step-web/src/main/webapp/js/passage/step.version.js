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
step.version = {
        quickEnglish : ["ASV", "BBE", "DRC", "ESV", "KJV", "NETtext", "RWebster", "WEB"],
        deeperEnglish : ["JPS", "LEB", "Rotherham", "AB", "YLT"],
        names : {
            asv         : {name : "American Standard Version ", level : 0},
            bbe         : {name : "Bible in Basic English ", level : 0},
            drc         : {name : "Douay-Rheims Catholic Bible ", level : 0},
            esv         : {name : "English Standard Version", level : 0},
            kjv         : {name : "King James Version (\"Authorised\") ", level : 0},
            nasb        : {name : "New American Standard Bible ", level : 0},
            nettext     : {name : "New English Translation ", level : 0},
            rwebster    : {level : 0},
            web         : {name : "World English Bible ", level : 0},
            jps         : {name : "Jewish Publication Society (OT)", level : 1},
            leb         : {name : "Lexham English Bible ", level : 1},
            rotherham   : {name : "Emphasized Bible ", level : 1},
            ab          : {name : "Translation of Greek Septuagint (OT)", level : 1},
            ylt         : {name : "Young's over-literal translation of Hebrew & Greek", level : 1},
            
            abp         : {name : "Interlinear for Greek Septuagint (OT)", level : 2 }, 
            etheridge   : {name : "Translation of Syriac Peshitta (NT)", level : 2}, 

            abpgrk      : {name : "Orthodox Greek Septuagint (Grk, OT)", level : 2},
            lxx         : {name : "Septuagint from Rahlf+Goettingen (Grk, OT)", level : 2},
            peshitta    : {name : "Syriac version (Syriac, NT)", level : 2},
            tnt         : {name : "Greek edition of Tregelles (Grk. NT)", level : 2},
            vulgate     : {name : "Latin Bible by Jerome (Lat. +Ap)", level : 2},
            whnu        : {name : "Westcott & Hort + NA27/UBS3 (Grk. NT)", level : 2},
            wlc         : {name : "BHS corrected to Leningrad codex (Heb. OT)", level : 2},
            
            //            DRC = Translation of Latin Vulgate (Eng. OT+Ap+NT)
            chiuns      : {name: "和合本圣经 （简体版）" },
            chincvs     : {name: "新译本 （简体版）" },
            chincvt     : {name: "新譯本 (繁體版)"}
        },
        
        updateInfoLink : function(passageId) {
            var version = step.state.passage.version(passageId);
            $(".infoAboutVersion", step.util.getPassageContainer(passageId)).attr("href", "version.jsp?version=" + version).attr("title", "Information about the " + version + " Bible / Commentary");
        },
};


$(step.version).hear("version-changed-0", function(source, data) {
   step.version.updateInfoLink(0);
});

$(step.version).hear("version-changed-1", function(source, data) {
    step.version.updateInfoLink(1); 
 });


$(step.version).hear("filter-versions", function(source, data) {
    var element = data;
    var target = $(element);
    
//    var versionsToKeep = step.version.filteredVersions(target);
//    $.map(versionsToKeep, function(n, i) {
//       return i.initials;
//    });
//    
//    $(".filteredCompleteVersions .versionKey").filter(function() {
//        return $.inArray($(this).html()) == -1;
//    }).hide();
    
    
    step.version.refreshVersions(target, step.version.filteredVersions(target));
//    target.filteredcomplete("search", "");
    
    //hack for IE.
    element.focus();
});


