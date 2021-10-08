function init_order_version() {
  var s = '<p class="col-12">' + __s.order_of_bible_displayed +
    '<div id="nestedVersion" class="list-group col nested-sortable">';
  var intialsOfAllVersions = window.searchView._getCurrentInitials();
  beforeSort = [];
  for (var i = 0; i < intialsOfAllVersions.length; i++) {
    if (intialsOfAllVersions[i] !== undefined) {
        var curVersion = intialsOfAllVersions[i];
        if (step.keyedVersions[curVersion].name !== undefined) curVersion += ' - ' + step.keyedVersions[curVersion].name;
        s += '<div style="color:#FFFFFF;background-color:#3071A9;font-size:14px;padding:10px 5px 10px 15px;border-style:solid;" class="list-group-item nested-1">' + curVersion +
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
    for (var i = 0; i < afterSort.length; i++) {
        if (i > 0) allVersions += '|version=';
        var curVersion = afterSort[i];
        var pos = curVersion.indexOf(' - ');
        if (pos > 1) curVersion = curVersion.substr(0, pos);
        allVersions += curVersion;
    }
    var activePassageData = step.util.activePassage().get("searchTokens") || [];
    var allReferences = '|reference=';
    numOfReferences = 0;
    for (var i = 0; i < activePassageData.length; i++) {
        if (activePassageData[i].itemType == 'reference') {
            if (numOfReferences > 0) allReferences += '|reference=';
            allReferences += activePassageData[i].item.osisID;
            numOfReferences ++;
        }
    }
    var url = allVersions + allReferences;
    closeVersionOrder();
    console.log("navigateSearch from order_version.html: " + url)
    step.router.navigateSearch(url, true, true);
}

function userCloseVersionOrder() {
    afterSort = beforeSort;
    step.util.closeModal("orderVersionModal");
}