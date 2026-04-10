function init_order_version(mode) {

  var firstParagraph = (mode === 'color') ? 'To enable Color Code Grammar, update the display order by dragging a Bible with morphology (marked with a <span style="color:red;font-size=18px">*</span> character) to the top of the list of Bibles.' : __s.order_of_bible_displayed; 
  var s = 
    '<svg style="display:none">' +
      '<symbol id="dots6" style="fill:white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">' +
        '<circle cx="3" cy="2" r="2"/><circle cx="8" cy="2" r="2"/>' +
        '<circle cx="3" cy="7" r="2"/><circle cx="8" cy="7" r="2"/>' +
        '<circle cx="3" cy="12" r="2"/><circle cx="8" cy="12" r="2"/>' +
      '</symbol></svg>' +
      '<p class="col-12"dir="' + (step.state.isLtR() ? "ltr" : "rtl") + '">' + firstParagraph +
    '<div id="nestedVersion" class="list-group col nested-sortable">';
  var intialsOfAllVersions = window.searchView._getCurrentInitials();
  beforeSort = [];
  for (var i = 0; i < intialsOfAllVersions.length; i++) {
    if (intialsOfAllVersions[i] !== undefined) {
        var curVersion = intialsOfAllVersions[i];
        if (step.keyedVersions[curVersion].name !== undefined) {
          curVersion = '<span>' + curVersion + '</span>' +
            ((step.keyedVersions[curVersion].hasMorphology && (mode === 'color')) ? '<span style="color:red;font-size:18px">*</span>' : '') +
            '<span> - ' + step.keyedVersions[curVersion].name + '</span>';
        }
        s += '<div style="color:#FFFFFF;background-color:#3071A9;font-size:14px;padding:10px 5px 10px 15px;border-style:solid;" class="list-group-item nested-1">' +
          '<svg height="14px" width="12px" ><use href="#dots6" /></svg>' +
          '&nbsp;&nbsp;' +
        curVersion +
          '<div class="list-group nested-sortable"></div></div>';
        beforeSort.push(curVersion);
    }
  }
  s += '</div>';
  $('#sortVersionModal').append($(s));

  var nestedSortables = [].slice.call(document.querySelectorAll('.nested-sortable'));
  for (var j = 0; j < nestedSortables.length; j++) {
    new Sortable(nestedSortables[j], {
      animation: 150,
      onEnd: function(evt) {
        afterSort = [];
        for (var j = 0; j < $('#nestedVersion')[0].children.length; j ++) {
          afterSort.push($('#nestedVersion')[0].children[j].innerText.replace(/(\r\n|\n|\r)/gm,"")); // Dec 2020.  Safari browser on iPhone has an extra 0A character at the end of the string.
		  $('#updateVersionOrderButton').text(__s.update_display_order)
          $('#updateVersionOrderButton').show();
        }
      }
    });
  }
  $('#updateVersionOrderButton').hide();
}

function saveVersionOrder() {
    if (typeof afterSort === "undefined") afterSort = beforeSort;
    var allVersions = "version=";
    var newMasterVersion = "";
    var otherVersions = [];
    var osisIds = [];
    var isChangedForColorCodeGrammar = false;
    for (var i = 0; i < afterSort.length; i++) {
        if (i > 0) allVersions += URL_SEPARATOR + 'version=';
        var curVersion = afterSort[i];
        var pos = curVersion.indexOf(' - ');
        if (pos > 1) curVersion = curVersion.substr(0, pos);
        curVersion = curVersion.replace(/\s/g,"");
        var removedAsterisk = curVersion.replace(/\*/g,"");
        if (curVersion !== removedAsterisk) {
          curVersion = removedAsterisk;
          if (i == 0)
            isChangedForColorCodeGrammar = true;
        }
        allVersions += curVersion;
        if (i == 0) newMasterVersion = curVersion;
        else if (otherVersions.indexOf() == -1) otherVersions.push(curVersion);
    }
    var activePassageData = step.util.activePassage().get("searchTokens") || [];
    var allReferences = URL_SEPARATOR + 'reference=';
    numOfReferences = 0;
    for (var i = 0; i < activePassageData.length; i++) {
        if (activePassageData[i].itemType === 'reference') {
            if (numOfReferences > 0) allReferences += URL_SEPARATOR + 'reference=';
            allReferences += activePassageData[i].item.osisID;
            osisIds.push(activePassageData[i].item.osisID);
            numOfReferences ++;
        }
    }
    var url = allVersions + allReferences;
    step.util.closeModal("orderVersionModal");
    if (!step.util.checkFirstBibleHasPassage(newMasterVersion, osisIds, otherVersions)) return;
    step.router.navigateSearch(url, true, true, isChangedForColorCodeGrammar);
    if (isChangedForColorCodeGrammar) {
      setTimeout( function() {
        javascript:step.util.ui.initSidebar('color') }, 1500);
    }
}

function userCloseVersionOrder() {
    afterSort = beforeSort;
    step.util.closeModal("orderVersionModal");
}