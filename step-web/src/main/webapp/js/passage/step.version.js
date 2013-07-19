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
    warned: {},
    names: {
        asv: {name: "American Standard Version "},
        bbe: {name: "Bible in Basic English "},
        drc: {name: "Douay-Rheims English Translation of Vulgate "},
        esv: {name: "English Standard Version"},
        kjv: {name: "King James Version (\"Authorised\") "},
        nasb: {name: "New American Standard Bible "},
        nettext: {name: "New English Translation "},
        rwebster: {level: 0},
        web: {name: "World English Bible "},
        jps: {name: "Jewish Publication Society (OT)"},
        leb: {name: "Lexham English Bible "},
        rotherham: {name: "Emphasized Bible "},
        ab: {name: "Translation of Greek Septuagint (OT)"},
        ylt: {name: "Young's very literal translation"},

        aleppo: {name: "Heb.OT: Aleppo Codex"},
        osmhb: {name: "Heb.OT: Leningrad Codex based on BHS"},
        wlc: {name: "Heb.OT: Leningrad Codex based on BHS"},

        lxx: {name: "Grk.OT: Septuagint (Rahlf+Goettingen)"},
        abpgrk: {name: "Grk.OT: Septuagint (Orthodox trad.)"},
        abp: {name: "Grk.OT: Eng.trans. (Brenton rev.)"},

        antoniades: {name: "Grk.NT: Orthodox Patriarchal Edition"},
        byz: {name: "Grk.NT: Majority or Byzantine text"},
        elzevir: {name: "Grk.NT: Elzevir 'Textus Receptus'"},
        sblgnt: {name: "Grk.NT: SBL edition"},
        tisch: {name: "Grk.NT: Tischendorf 8th ed."},
        tnt: {name: "Grk.NT: Tregelles ed. with corrections"},
        tr: {name: "Grk.NT: 'Textus Receptus' of the KJV"},
        whnu: {name: "Grk.NT: W+Hort with NA+UBS variants"},

        vulgate: {name: "Latin Bible, Vulgate by Jerome"},
        vulgsistine: {name: "Latin Bible, Vulgate Sixti"},
        vulghetzenauer: { name: "Latin Bible, Vulgate Clem. ed., Hetzenauer" },
        vulgconte: { name: "Latin Bible, Vulgate Clem. ed., Conte" },
        vulgclementine: {name: "Latin Bible, Vulgate Clem. ed., C & T" },
        sp: { name: "Samaritan Pentateuch (Books of Moses)" },
        spmt : {  name: "Samaritan Pentateuch with Hebrew MT" },
        spvar : {  name: "Samaritan Pentateuch with MT & DSS" },
        spdss : {  name: "Samaritan Pentateuch v Dead Sea Scrolls" },
        spe : {  name: "Samaritan Pentateuch in KJV English" },

        peshitta: {name: "Syriac NT Peshitta" },
        etheridge: {name: "Syriac NT Peshitta English transl." },
        murdock: {name: "Syriac NT Peshitta English transl." },

        chiuns: {name: "和合本圣经 （简体版）" },
        chincvs: {name: "新译本 （简体版）" },
        chincvt: {name: "新譯本 (繁體版)"}
    },

    updateInfoLink: function (passageId) {
        var version = step.state.passage.version(passageId);
        $(".infoAboutVersion",
            step.util.getPassageContainer(passageId))
            .attr("href", "version.jsp?version=" + version)
            .attr("title", sprintf(__s.info_about_bible, version));
    },

    warnIfNoStrongs: function (passageId, version) {
        if (!step.keyedVersions || !version) {
            return;
        }

        var self = this;
        var keyedVersion = step.keyedVersions[version.toUpperCase()];
        if (keyedVersion && keyedVersion.category == 'BIBLE' && !keyedVersion.hasStrongs && !step.version.warned[keyedVersion.initials]) {
            step.util.raiseInfo(passageId, NO_STRONGS);
            step.version.warned[keyedVersion.initials] = true;
        }
    }
};
