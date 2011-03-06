
/**
 * extending jquery to have array comparison
 */
function compare(s, t) {
	if(s == null || t == null) {
		return t == s;
	}
	
    if (s.length != t.length) { return false; }
    var a = s.sort(),
        b = t.sort();
    for (var i = 0; t[i]; i++) {
        if (a[i] !== b[i]) { 
                return false;
        }
    }
    return true;
};


/**
 * adds a button next to a specified element
 * @param textbox the box to which to add the dropdown button
 * @param icon the icon to stylise the button
 */
function addButtonToAutoComplete(textbox, icon) {
	$( "<button>&nbsp;</button>" ).attr( "tabIndex", -1 )
	.attr( "title", "Show all Bible versions" )
	.insertAfter( textbox )
	.button({
		icons: {
			primary: icon
		},
		text: false
	})
	.removeClass( "ui-corner-all" )
	.addClass( "ui-corner-right ui-button-icon no-left-border" )
	.click(function() {
		// close if already visible
		if ( textbox.autocomplete( "widget" ).is( ":visible" ) ) {
			textbox.autocomplete( "close" );
			return;
		}

		// pass empty string as value to search for, displaying all results
		textbox.autocomplete( "search", "" );
		textbox.focus();
	});
}

function extractLast( term ) {
	return split( term ).pop();
}

/**
 * looks for the next space in the name provided and returns the shortest name available
 * @param longName the long name to be shortened
 * @param minLength the min length from which to start
 */
function shortenName(longName, minLength) {
	var ii = longName.indexOf(' ', minLength);
	if(ii > 0) {
		return longName.substring(0, ii) + "...";
	}
	
	//unable to shorten
	return longName;
}

