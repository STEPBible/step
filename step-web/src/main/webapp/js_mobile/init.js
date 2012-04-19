init();

function init() {
	$(document).ready(function() {
		
		
		var url = BIBLE_GET_BIBLE_TEXT + "KJV" + "/" + "Exodus 1";
		
		//send to server
		$.get(url, function (text) {
			//we get html back, so we insert into passage:
			$("#mobileMainPane").html(text.value);
		});
	});
}
