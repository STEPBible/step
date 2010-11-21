
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