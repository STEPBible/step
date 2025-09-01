#!/usr/bin/perl

#########################################################################
### WARNING: This is for demonstration purposes only. Do not deploy
###          this CGI on a live website. There are security issues.
###          You will likely be hacked if you try to deploy this on a
###          live site.
###
###          For a web Bible interface, please consider using
###          SwordWeb, which can be also be installed on your
###          server: http://www.crosswire.org/swordweb/
########################################################################

#******************************************************************************
#
#  diatheke.pl -
#
# $Id: diatheke.pl 2841 2013-06-29 10:58:08Z chrislit $
#
# Copyright 2000-2013 CrossWire Bible Society (http://www.crosswire.org)
#	CrossWire Bible Society
#	P. O. Box 2528
#	Tempe, AZ  85280-2528
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by the
# Free Software Foundation version 2.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#


# Typical Linux/Unix settings
$err = "2> /dev/null";
$sword_path = "/home/sword";  # SWORD_PATH environment variable you want to use
$diatheke = "nice /usr/bin/diatheke";  # location of diatheke command line program

# Typical Windows settings
#$err = "";
#$sword_path = "C:\\Program Files\\CrossWire\\The SWORD Project";  # SWORD_PATH environment variable you want to use
#$diatheke = "$sword_path\\diatheke.exe";  # location of diatheke command line program

$cgiurl = "http:\/\/www.crosswire.org\/cgi-bin";

$scriptname = "diatheke.pl";
$defaultfontface = "Times New Roman, Times, Roman, serif"; # default font name
$maxverses = 50; # maximum number of verses diatheke will return per query (prevents people from asking for Gen1:1-Rev22:21)
$defaultbook = "KJV"; # book to query when none is selected, but a verse/search is entered
$deflocale = "abbr";  # this is just the default for cases where user has not selected a locale and his browser does not reveal one -- you can also set locale using locale=<locale> in the GET URL

###############################################################################
## You should not need to edit anything below this line.
## Unless you want to modify functionality of course. :)
###############################################################################

$version = "4.2";

sub shell_escape {
    my $input = shift;
    my $result = '';

    foreach my $i (split //, $input) {
    if ($i eq "'") {
        $result .= "'\\''";
    } else {
        $result .= $i;
    }
    }
    return $result;
}


sub plussifyaddress  {
    ($p_ver = @_[0]) =~ tr/ /+/; 
    $p_newline = "<a href=\"$scriptname?verse=$p_ver&@_[1]=on\">";
    return $p_newline;
}

sub urlvers {
    $u_verse = @_[0];
    $u_version = @_[1];
    $u_oldverse = $u_verse;
    $u_verse =~ tr/ /+/;
    $u_newline = "<a href=\"$scriptname?verse=$u_verse&$u_version=on\">$u_oldverse</a>";
    return $u_newline;
}

$ENV{'SWORD_PATH'} = $sword_path;

print "Content-type: text/html\n\n";


if ($ENV{'HTTP_COOKIE'}) {

    $cookie = $ENV{'HTTP_COOKIE'};
    $cookie =~ s/\; /=/g;
    %cookiedata = split(/=/, $cookie);
    
    $defversion = $cookiedata{DEFTRANS};
    $locale = $cookiedata{LOCALE};
}

if ($defversion eq "") {
    $defversion = 'KJV';
}
if ($locale eq "") {
    $locale = $ENV{'HTTP_ACCEPT_LANGUAGE'};
    $locale =~ s/(..).*/$1/;
    if ($locale eq "") {
	$locale = $deflocale;
    }
    elsif ($locale eq "en") {
	$locale = "abbr";
    }
}

$locale = shell_escape($locale);
$hostname = $ENV{'REMOTE_ADDR'};
@values = split(/\&/,$ENV{'QUERY_STRING'});
$n = 0;
$palm = 0;

$latinxlit = "";

$optionfilters = "";
$debug=1;
foreach $i (@values) {
    ($varname, $mydata) = split(/=/,$i);
    if ($varname ne "Submit" && $varname ne "lookup") {
	if ($varname eq "verse") {
	    $verse = $mydata;
	    $verse =~ tr/+/ /;
	    $verse =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
            $verse = shell_escape($verse);
	}
	elsif ($varname eq "search" && $mydata ne "" && $mydata ne "off") {
            $search = "-s '" . shell_escape($mydata) . "'";
	}
	elsif ($varname eq "range" && $mydata ne "" && $mydata ne "off") {
	    $range = $mydata;
	    $range =~ tr/+/ /;
	    $range =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
	    $range = "-r '" . shell_escape($range) . "'";
	}

	elsif ($varname eq "strongs") {
	    $optionfilters .= "n";
	}
	elsif ($varname eq "footnotes") {
	    $optionfilters .= "f";
	}
	elsif ($varname eq "headings") {
	    $optionfilters .= "h";
	}
	elsif ($varname eq "morph") {
	    $optionfilters .= "m";
	}	
	elsif ($varname eq "hebcant") {
	    $optionfilters .= "c";
	}
	elsif ($varname eq "hebvowels") {
	    $optionfilters .= "v";
	}
	elsif ($varname eq "grkacc") {
	    $optionfilters .= "a";
	}
	elsif ($varname eq "lemmas") {
	    $optionfilters .= "l";
	}	
	elsif ($varname eq "scriprefs") {
	    $optionfilters .= "s";
	}
	elsif ($varname eq "arshape") {
	    $optionfilters .= "r";
	}
	elsif ($varname eq "bidi") {
	    $optionfilters .= "b";
	}

	elsif ($varname eq "latinxlit") {
	    $latinxlit = "-t Latin";
	}	

	elsif ($varname eq "palm") {
	    $palm = 1;
	}
	elsif ($varname eq "debug") {
	    $debug = 1;
	}
	elsif ($varname eq "locale") {
	    $locale = shell_escape($mydata);
	}
	elsif ($varname eq "maxverses") {
	    $maxverses = shell_escape($mydata);
	}
	elsif ($mydata eq "on" || $mydata eq "ON") {
	    $versions[$n] = shell_escape($varname);
	    $n++;
	}
    }
}
if ($optionfilters ne "") {
    $optionfilters = "-o " . $optionfilters;
}



if ($n == 0) {
    $versions[0] = $defaultbook;
    $n++;
}

if ($verse eq "") {

    @versionlist = `$diatheke -b system -k modulelist $err`;    
    @versionlist2 = @versionlist;
    @localelist = `$diatheke -b system -k localelist $err`;

    print <<DEF1;
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Diatheke Online Bible</title>
</head>

<body>

<form method="get" action="$scriptname">
  <p /><input type="radio" name="search" checked value="" /><font face="Arial, Helvetica, sans-serif">Verse/Commentary Lookup&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  Verse or Search key:</font><input type="text" name="verse" size="20"><input type="submit" name="Submit" value="Submit"><input type="reset" name="Reset" value="Reset"><br />
  <input type="radio" name="search" value="phrase" /><font face="Arial, Helvetica, sans-serif">Phrase Search</font><br />
  <input type="radio" name="search" value="multiword" /><font face="Arial, Helvetica, sans-serif">Multiple Word Search</font><br />
  <input type="radio" name="search" value="regex" /><font face="Arial, Helvetica, sans-serif">Regular Expression Search</font><br />
<br />
  <table width="100%" border="0">
    <tr> 
      <td colspan="2" width="100%"> 

      <table>
      <tr>
        <td> 
          <font size="-1" face="Arial, Helvetica, sans-serif">Custom Range Restriction</font>
        </td>
        <td> 
          <input type="text" name="range" size="20">
        </td>
      </tr>
      </table>

      </td>
    </tr>

    <tr> 
      <td width="50%"> 
        <input type="checkbox" name="strongs" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Strong's Numbers</font></td>
      <td width="50%"> 
        <input type="checkbox" name="headings" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Section Headings</font></td>
    </tr>
    <tr> 
      <td width="50%"> 
        <input type="checkbox" name="footnotes" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Footnotes</font></td>
      <td width="50%"> 
        <input type="checkbox" name="scriprefs" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Scripture Cross-References</font></td>
    </tr>
    <tr> 
      <td width="50%"> 
        <input type="checkbox" name="morph" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Morphology</font></td>
      <td width="50%"> 
        <input type="checkbox" name="hebvowels" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Hebrew Vowels</font></td>
    </tr>
    <tr> 
      <td width="50%"> 
        <input type="checkbox" name="lemmas" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Lemmas</font></td>
      <td width="50%"> 
        <input type="checkbox" name="hebcant" value="on">
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Hebrew Cantillation 
        Marks </font></td>
    </tr>
    <tr> 
      <td width="50%"> 
        <input type="checkbox" name="latinxlit" value="on">
        <font face="Arial, Helvetica, sans-serif" size="-1">Latin Transliterate</font> 
      </td>
      <td width="50%"> 
        <input type="checkbox" name="grkacc" value="on" checked>
        <font size="-1" face="Arial, Helvetica, sans-serif">Show Greek Accents</font> 
      </td>
    </tr>
  </table>
  <br />
  <table BORDER="0" WIDTH="100%">
DEF1
    
    foreach $line (@versionlist) {
	chomp($line);

	if ($line eq "Biblical Texts:") {
	    print "<tr><td><font face=$defaultfontface><b>Biblical Texts:</b></font><br /></td></tr>";
	}
	elsif ($line eq "Commentaries:") {
	    print "<tr><td><font face=$defaultfontface><b>Commentaries:</b></font></td></tr>";
	}
	elsif ($line eq "Dictionaries:") {
	    print "<tr><td><font face=$defaultfontface><b>Dictionaries & Lexica:</b></font></td></tr>";
	}
	else {
	    $line =~ s/([^:]+) : (.+)/<tr><td><input type=\"checkbox\" name=\"$1\" value=\"on\"><font size=\"-1\" face=$defaultfontface>$2 ($1)<\/font><\/td><\/tr>/;
	    print "$line\n";
	}

    }

    print <<DEF2;
        </table>
</form>

<form method="get" action="dia-def.pl">
  Select default Bible version for cross-references:&nbsp;<select name="defversion" size="1">
  
DEF2
    
    $biblesflag = 1;
    foreach $line (@versionlist2) {
	if ($biblesflag == 1) {
	    chomp ($line);
	    if ($line eq "Biblical Texts:") {
	    }
	    elsif ($line eq "Commentaries:") {
		$biblesflag = 0;
	    }
	    else {
		$line =~ s/([^:]+) : (.+)/<option value=\"$1\">$2 ($1)<\/option>/;
		print "$line\n";
	    }
	}
    }

    print <<DEF3;
</select><input type="submit" name="Submit" value="Submit"></form><br/><form method="get" action="dia-def.pl">Select locale:&nbsp;
<select name="locale" size="1"><option value="">browser default</option>
<option value="en">en</option>
DEF3
    foreach $line (@localelist) {
	chomp($line);
	print "<option value=\"$line\">$line<\/option>";
    }
print <<DEF4
</select>
<input type="submit" name="Submit" value="Submit">
</form>
</body>
</html>
DEF4

}
else {



if ($palm == 0) {
print <<END;

<html><head>
<title>Diatheke Interlinear Bible</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="palmcomputingplatform" content="true">
<meta name="historylisttext" content="Diatheke">
<style type="text/css">
#divBottom{position:absolute; visibility:hidden; font-family:arial,helvetica; height:30; width:100; font-size:10pt; font-weight:bold}
A:link, A:visited, A:active{text-decoration: none}
</style>
<script type="text/javascript" language="JavaScript">
/********************************************************************************
Copyright (C) 1999 Thomas Brattli
This script is made by and copyrighted to Thomas Brattli at www.bratta.com
Visit for more great scripts. This may be used freely as long as this msg is intact!
I will also appriciate any links you could give me.
********************************************************************************/
//Default browsercheck, added to all scripts!
function checkBrowser(){
    this.ver=navigator.appVersion;
    this.dom=document.getElementById?1:0;
    this.ie5=( (this.ver.indexOf("MSIE 6")>-1 || this.ver.indexOf("MSIE 5")>-1) && this.dom)?1:0;
    this.ie4=(document.all && !this.dom)?1:0;
    this.ns5=(this.dom && parseInt(this.ver) >= 5) ?1:0;
    this.ns4=(document.layers && !this.dom)?1:0;
    this.bw=(this.ie5 || this.ie4 || this.ns4 || this.ns5);
    return this;
}
bw=new checkBrowser()
/********************************************************************************
Remeber to set the look of the divBottom layer in the stylesheet (if you wan't
another font or something)
********************************************************************************/
/*Set these values, gright for how much from the right you wan't the layer to go
and gbottom for how much from the bottom you want it*/
var gright=160
var gbottom=80



/********************************************************************************
Constructing the ChangeText object
********************************************************************************/
function makeObj(obj,nest){
    nest=(!nest) ? '':'document.'+nest+'.';
    this.css=bw.dom? document.getElementById(obj).style:bw.ie4?document.all[obj].style:bw.ns4?eval(nest+"document.layers." +obj):0;
    this.moveIt=b_moveIt;
}
function b_moveIt(x,y){this.x=x; this.y=y; this.css.left=this.x; this.css.top=this.y}

/********************************************************************************
Initilizing the page, getting height and width to moveto and calls the 
object constructor
********************************************************************************/
    function geoInit(){
	oGeo=new makeObj('divBottom');
	pageWidth=(bw.ie4 || bw.ie5)?document.body.offsetWidth-4:innerWidth;
	pageHeight=(bw.ie4 || bw.ie5)?document.body.offsetHeight-2:innerHeight;
	checkIt();
	// sets the resize handler.
	onresize=resized;
	if(bw.ie4 || bw.ie5) window.onscroll=checkIt;
	// shows the div
	oGeo.css.visibility='visible';
    }
/********************************************************************************
This function executes onscroll in ie and every 30 millisecond in ns
and checks if the user have scrolled, and if it has it moves the layer.
********************************************************************************/
function checkIt(){
    if(bw.ie4 || bw.ie5) oGeo.moveIt(document.body.scrollLeft +pageWidth-gright,document.body.scrollTop+pageHeight-gbottom);
    else if(bw.ns4){
	oGeo.moveIt(window.pageXOffset+pageWidth-gright, window.pageYOffset+pageHeight-gbottom);
	setTimeout('checkIt()',30);
    }
}

//Adds a onresize event handler to handle the resizing of the window.
function resized(){
    pageWidth=(bw.ie4 || bw.ie5)?document.body.offsetWidth-4:innerWidth;
    pageHeight=(bw.ie4 || bw.ie5)?document.body.offsetHeight-2:innerHeight;
    if(bw.ie4 || bw.ie5) checkIt()
}


//Calls the geoInit onload
if(bw.bw && !bw.ns5) onload=geoInit;

//Here we will write the div out so that lower browser won't see it.'
if(bw.bw && !bw.ns5) document.write('<div id="divBottom"><table><tr><td align="center">Powered by<br /><img src="http://www.crosswire.org/sword/pbsword.gif"><br /><a href="http://www.crosswire.org/">www.crosswire.org</td></tr></table></div>')
</script>

</head>

<body bgcolor="#FFFFFF"><font face="$defaultfontface">

END
}
else {
print <<END

<html><head>
<title>HANDiatheke</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="palmcomputingplatform" content="true">
<meta name="historylisttext" content="HANDiatheke">
</head>
<body bgcolor="#FFFFFF"><font face="$defaultfontface">
END
}
for ($i = 0; $i < $n; $i++) {
    
    $line = "$diatheke $search $range $optionfilters $latinxlit -l '$locale' -m '$maxverses' -f cgi -b '$versions[$i]' -k '$verse' $err";

    if ($debug) {
	print "<br /><i>command line: $line\n</i><br /><br />";
    }
    $line = `$line`;

    chomp($line);

    $line =~ s/!DIATHEKE_URL!/$scriptname\?/g;

#    Parse and link to Strong's references if present
    
    $info = `$diatheke -b info -k '$versions[$i]' $err`;
    $info =~ /([^\;]+)\;([^\;]+)/;
    $format = $1;
    $type = $2;
    
    if ($versions[$i] eq "StrongsHebrew") {
	$line =~ s/(see HEBREW for )([0-9]+)/<a href=\"$scriptname?verse=$2&StrongsHebrew=on\">$1$2\<\/a\>/g;
    }
    elsif($versions[$i] eq "StrongsGreek") {
	$line =~ s/(see GREEK for )([0-9]+)/<a href=\"$scriptname?verse=$2&StrongsGreek=on\">$1$2\<\/a\>/g;
    }
    #case for searches
    elsif($search ne "") {
	$line =~ s/<entry>([^<]+)<\/entry>/urlvers($1, $versions[$i])/eg;
    }
    #case for non-ThML, non-Bible texts
    elsif($type ne "Biblical Texts") {
	$book = $verse;
	$book =~ s/^([A-Za-z0-9]+) [0-9]+:[0-9]+.*/$1/;
	$chapter = $verse;
	$chapter =~ s/[A-Za-z0-9]+ ([0-9]+):[0-9]+.*/$1/;
	$line =~ s/\#*([1-9]*[A-Z][a-z]+\.*) ([0-9]+):([0-9]+-*,*[0-9]*)\|*/<a href=\"$scriptname?verse=$1+$2%3A$3&$defversion=on\">$1 $2:$3\<\/a\>/g;
	$line =~ s/\#([0-9]+):([0-9]+-*,*[0-9]*)\|*/<a href=\"$scriptname?verse=$book+$1%3A$2&$defversion=on\">$book $1:$2\<\/a\>/g;
	$line =~ s/\#([0-9]+-*,*[0-9]*)\|*/<a href=\"$scriptname?verse=$book+$chapter%3A$1&$defversion=on\">$book $chapter:$1\<\/a\>/g;
    }

    if ($locale ne "abbr") {
	$line =~ s/href=\"$scriptname([^\"]+)\"/href=\"$scriptname$1&locale=$locale\"/g;
    }
    if ($palm == 1) {
	$line =~ s/href=\"$scriptname([^\"]+)\"/href=\"$cgiurl\/$scriptname$1&palm=on\"/g;
    }

    print "$line <br /><br />\n";
}

if ($palm == 1) {
    print "<hr>Powered by Diatheke (http:\/\/www.gotjesus.org\/sword\/diatheke) and the SWORD Project (http:\/\/www.crosswire.org\/sword).";
}

print "<br /><br /><br /><br /></font></body></html>";

}


