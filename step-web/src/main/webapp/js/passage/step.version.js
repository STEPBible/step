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
NO_STRONGS = "The selected Bible will not be clickable as it does not support the Vocabulary feature.";

step.version = {
        warned : {},
        quickEnglish : ["ASV", "BBE", "DRC", "ESV", "KJV", "NETtext", "RWebster", "WEB"],
        deeperEnglish : ["JPS", "LEB", "Rotherham", "AB", "YLT"],
        names : {
            asv         : {name : "American Standard Version "},
            bbe         : {name : "Bible in Basic English "},
            drc         : {name : "Douay-Rheims Catholic Bible "},
            esv         : {name : "English Standard Version"},
            kjv         : {name : "King James Version (\"Authorised\") "},
            nasb        : {name : "New American Standard Bible "},
            nettext     : {name : "New English Translation "},
            rwebster    : {level : 0},
            web         : {name : "World English Bible "},
            jps         : {name : "Jewish Publication Society (OT)"},
            leb         : {name : "Lexham English Bible "},
            rotherham   : {name : "Emphasized Bible "},
            ab          : {name : "Translation of Greek Septuagint (OT)"},
            ylt         : {name : "Young's over-literal translation of Hebrew & Greek"},
            
            abp         : {name : "Interlinear for Greek Septuagint (OT)" }, 
            etheridge   : {name : "Translation of Syriac Peshitta (NT)"}, 

            abpgrk      : {name : "Orthodox Greek Septuagint (Grk, OT)"},
            lxx         : {name : "Septuagint from Rahlf+Goettingen (Grk, OT)"},
            peshitta    : {name : "Syriac version (Syriac, NT)"},
            tnt         : {name : "Greek edition of Tregelles (Grk. NT)"},
            vulgate     : {name : "Latin Bible by Jerome (Lat. +Ap)"},
            whnu        : {name : "Westcott & Hort + NA27/UBS3 (Grk. NT)"},
            wlc         : {name : "BHS corrected to Leningrad codex (Heb. OT)"},
            
            //            DRC = Translation of Latin Vulgate (Eng. OT+Ap+NT)
            chiuns      : {name: "和合本圣经 （简体版）" },
            chincvs     : {name: "新译本 （简体版）" },
            chincvt     : {name: "新譯本 (繁體版)"}
        },
        
        updateInfoLink : function(passageId) {
            var version = step.state.passage.version(passageId);
            $(".infoAboutVersion", step.util.getPassageContainer(passageId)).attr("href", "version.jsp?version=" + version).attr("title", "Information about the " + version + " Bible / Commentary");
        },
        
        warnIfNoStrongs : function(passageId, version) {
            if(!step.keyedVersions) {
                return;
            }
            
            var self = this;
            var keyedVersion = step.keyedVersions[version.toUpperCase()];
            if(keyedVersion && keyedVersion.category == 'BIBLE' && !keyedVersion.hasStrongs && !step.version.warned[keyedVersion.initials]) {
                   step.util.raiseInfo(passageId, NO_STRONGS);
                   step.version.warned[keyedVersion.initials] = true;           
               } 
        }
};

$(step.version).hear("versions-initialisation-completed", function(source, data) {
    step.version.warnIfNoStrongs(0, step.state.passage.version(0));
    step.version.warnIfNoStrongs(1, step.state.passage.version(1));
});

$(step.version).hear("version-changed-0", function(source) {
    step.version.updateInfoLink(0);
   
    //raise info box to warn, if not strong version...
    step.version.warnIfNoStrongs(0, step.state.passage.version(0));
});

$(step.version).hear("version-changed-1", function(source) {
    step.version.updateInfoLink(1); 
    
    //raise info box to warn, if not strong version...
    step.version.warnIfNoStrongs(1, step.state.passage.version(0));
 });


$(step.version).hear("filter-versions", function(source, data) {
    var element = data;
    var target = $(element);
    
    step.version.refreshVersions(target, step.version.filteredVersions(target));
    //hack for IE.
    element.focus();
});


