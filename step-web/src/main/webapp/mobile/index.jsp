<!DOCTYPE html>
<!--HTML5 doctype-->
<html>

<head>
    <title>UI Starter</title>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <link rel="stylesheet" type="text/css" href="css/icons.css" />
    <link rel="stylesheet" type="text/css" href="css/af.ui.css" />

    <link rel="stylesheet" type="text/css" href="/css/passage.css" />


    <!-- uncomment for apps
    <script type="text/javascript" charset="utf-8" src="http://localhost:58888/_appMobi/appmobi.js"></script>
    <script type="text/javascript" charset="utf-8" src="http://localhost:58888/_appMobi/xhr.js"></script>
    -->
    <script type="text/javascript" charset="utf-8" src="ui/af.ui.min.js"></script>
    <!--<script type="text/javascript" charset="utf-8" src="plugins/af.selectBox.js"></script>-->
    <script type="text/javascript" charset="utf-8" src="plugins/af.scroller.js"></script>
    <!-- include touch on desktop browsers only -->
    <script>
        if (!((window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in window)) {
            var script = document.createElement("script");
            script.src = "plugins/af.desktopBrowsers.js";
            var tag = $("head").append(script);
            $.os.android = true; //let's make it run like an android device
            $.os.desktop = true;
        }

    </script>
    <script type="text/javascript">

        function doPassageSearch() {
            //do the passage search.
            $.ui.toggleSideMenu();

            var options = "";
            if($("#H").prop("checked")) { options += 'H'; }
            if($("#V").prop("checked")) { options += 'V'; }
            if($("#A").prop("checked")) { options += 'A'; }

            $.getJSON(
                    "/rest/bible/getBibleText/" + $("#book").val()+ "/" + $("#reference").val() + "/" + options, null,
                    function(data) {
                        $(".passageContentHolder").remove();
                        $("#passageContainer").append(data.value);
                        $(".passageContentHolder").scroller();
                        
                    }
            );
        }

        var webRoot = "./";
//        $.ui.autoLaunch = true; //By default, it is set to true and you're app will run right away.  We set it to false to show a splashscreen
        /* This function runs when the body is loaded.*/
        var init = function () {
            $.ui.setBackButtonVisibility(true);
            $.ui.setBackButtonText("Back");// We override the back button text to always say "Back"
//            $.ui.disableNativeScrolling(true);
            $.ui.launch();
        };

        document.addEventListener("DOMContentLoaded", init, false);
        $.ui.ready(function () {
            //This function will get executed when $.ui.launch has completed
            $.ui.setBackButtonVisibility(true);
            $.ui.setBackButtonText("Back");// We override the back button text to always say "Back"
        });


        /* This code is used for native apps */
        var onDeviceReady = function () {
            AppMobi.device.setRotateOrientation("portrait");
//            AppMobi.device.setAutoRotate(true);

            webRoot = AppMobi.webRoot + "/";
            //hide splash screen
//            AppMobi.device.hideSplashScreen();

        };
        document.addEventListener("appMobi.device.ready", onDeviceReady, false);
    </script>
</head>

<body>
<div id="afui"> <!-- this is the main container div.  This way, you can have only part of your app use UI -->
    <!-- this is the header div at the top -->
    <div id="header">
        <a href="javascript:$.ui.toggleSideMenu()" class="button" style="float:right">Options</a>
    </div>
    <div id="content">
        <!-- here is where you can add your panels -->
        <div title='Welcome' id="main" class="panel" selected="true" >
            <div id="passageContainer" js-scrolling="true">

            </div>


        </div>
    </div>
    <!-- bottom navbar. Add additional tabs here -->
    <div id="navbar">
        <div class="horzRule"></div>
        <a href="#main" id='navbar_home' class='icon home'>home</a>
    </div>

    <nav id="main_nav">
        <div class='title'>Home</div>
        <label for="book">Book</label>
        <select id="book">
            <option>ESV</option>
            <option>KJV</option>
        </select>

        <label for="reference">Reference</label>
        <input type="text" id="reference" value="Mat 1" />
        
        <div class="input-group">

            <input type="checkbox"  id="H" value="1" />
            <label for="H">Headings</label>

            <input type="checkbox"  id="V" value="1" />
            <label for="V">Verse Numbers</label>

            <input type="checkbox"  id="A" value="1" />
            <label for="A">Ancient Vocab</label>


            <br />
</div>

        <a class="button" value="Search" onclick="javascript:doPassageSearch()" >Search</a>
            </nav>
</body>
</html>
