# Diatheke/Tcl 5.0 by Chris Little <chrislit@crosswire.org>

# Copyright 1999-2009 CrossWire Bible Society (http://www.crosswire.org)
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
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

bind pub - !KJV setver_KJV

proc setver_KJV {nick uhost hand channel arg} {
    global botnick chan bibver
    set bibver KJV
    pub_lookup $nick $uhost $hand $channel $arg
}

bind pub - !sKJV setver_sKJV

proc setver_sKJV {nick uhost hand channel arg} {
    global botnick chan bibver
    set bibver KJV
    pub_lookups $nick $uhost $hand $channel $arg
}

proc printBibles {nick} {
	putserv "NOTICE $nick :Bibles (1):"
	putserv "NOTICE $nick :King James Version (1769) with Strongs Numbers and Morphology (!KJV)"
}

proc printComms {nick} {
}

proc printDicts {nick} {
}
