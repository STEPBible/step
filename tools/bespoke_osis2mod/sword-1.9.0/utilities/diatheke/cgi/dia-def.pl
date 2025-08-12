#!/usr/bin/perl

#******************************************************************************
#
#  dia-def.pl -	
#
# $Id: dia-def.pl 2841 2013-06-29 10:58:08Z chrislit $
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

#change this variable to hostname of your server
@values = split(/\&/,$ENV{'QUERY_STRING'});
$DOMAIN = $ENV{'REMOTE_ADDR'};
$EXPIRES = 'Fri Dec 31 23:59:00 GMT 2005';

foreach $i (@values) {
    ($varname, $mydata) = split(/=/,$i);
    if ($varname eq "defversion") {
	$COOKIE = "DEFTRANS=$mydata ; expires=$EXPIRES";
    }
    elsif ($varname eq "locale") {
	$COOKIE = "LOCALE=$mydata ; expires=$EXPIRES";
    }
    elsif ($varname eq "settrans") {
	$COOKIE = "SETTRANS=$mydata ; expires=$EXPIRES";
    }
    elsif ($varname eq "setcomm") {
	$COOKIE = "SETCOMM=$mydata ; expires=$EXPIRES";
    }
    elsif ($varname eq "setld") {
	$COOKIE = "SETLD=$mydata ; expires=$EXPIRES";
    }
}

# Set the cookie and send the user the thank you page.
print "Set-cookie: $COOKIE\n";
print "Content-type: text/html\n\n";  #Note extra newline to mark
                                        #end of header.

print "<html><meta http-equiv=\"refresh\" content=\"0\; URL=$ENV{'HTTP_REFERER'}\"></html>";









