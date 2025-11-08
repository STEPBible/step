# Diatheke/Tcl 5.0 by Chris Little <chrislit@crosswire.org>
# Based on code schema of <cking@acy.digex.net>

# Copyright 1999-2009 CrossWire Bible Society (http://www.crosswire.org)
# 	CrossWire Bible Society
# 	P. O. Box 2528
# 	Tempe, AZ  85280-2528
#
# This program is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by the
# Free Software Foundation version 2.
#
# This program is distributed in the hope that it will be useful, but
# WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
# GNU General Public License for more details.

# modify this to reflect actual location of diatheke and dict binaries
set diatheke "/usr/bin/diatheke"
set dict "/usr/bin/dict"

set diaver 5.0

proc publookupverse {vlookup} {
    global botnick chan bibver diatheke

    set arg "-b"
    set n [string first "@" $vlookup]
    if {$n > -1 && $n < 2} {
	append arg n
    }

    set n [string first "#" $vlookup]
    if {$n > -1 && $n < 2} {
	append arg f
    }
    set vlookup [string trimleft $vlookup "#"]
    set vlookup [string trimleft $vlookup "@"]
    set vlookup [string trimleft $vlookup "#"]

    regsub -all {[\[\]\{\}\#\%\\\$\'\"\/\s]} $vlookup { } vlookup
    catch {exec $diatheke -f plaintext -o $arg -b $bibver -k "$vlookup" >& /tmp/fooout.$botnick}
    catch {set foofile [open /tmp/fooout.$botnick]}
    while {[gets $foofile fooverse] >= 0} {
	set len [string length $fooverse]
	set i 0
	set j 255
	while {$j < $len} {
	    if {[regexp ">" $fooverse]} {
		while {[string index $fooverse $j] != ">" && [string index $fooverse $j] != "\n"} {set j [expr $j - 1]}
	    } else {
		while {[string index $fooverse $j] != " " && [string index $fooverse $j] != "\n"} {set j [expr $j - 1]}
	    }
	    set foo2 [string range $fooverse $i $j]
	    set foo2 [string trim $foo2]
	    regsub -all -nocase {(<FI>|<CM>|<FB>)} $foo2 {} foo2
	    regsub -all {<RF>} $foo2 {(footnote: } foo2
	    regsub -all {<Rf>} $foo2 {)} foo2
	    putmsg $chan "$foo2"
	    set i [expr $j + 1]
	    set j [expr $j + 256]
	    if {$j > $len} {set j $len}
	}
	set foo2 [string range $fooverse $i end]
	set foo2 [string trim $foo2]
	regsub -all -nocase {(<FI>|<CM>|<FB>)} $foo2 {} foo2
	regsub -all {<RF>} $foo2 {(footnote: } foo2
	regsub -all {<Rf>} $foo2 {)} foo2
	putmsg $chan "$foo2"
    }
    
    catch {close $foofile}
    exec rm /tmp/fooout.$botnick
    return 1
}

proc pub_lookup {nick uhost hand channel arg} {
    global von chan bibver
    set chan $channel
    if {$von==0} {
	putmsg $nick "Verse display is currently off."
	return 0
    }
    if {($von==2) && (![matchattr $hand 3]) && (![matchattr $hand o])} {
	putmsg $nick "Only ops can display verses at this time."
	return 0
    }

    publookupverse $arg
}

#----------------------------------------------------------------------

proc pubsearchword {vlookup} {
    global botnick chan bibver diatheke
    regsub -all {[\[\]\{\}\#\%\\\$\'\"\/\s]} $vlookup { } vlookup
    catch {exec $diatheke -s $bibver "$vlookup" >& /tmp/fooout.$botnick}
    catch {set foofile [open /tmp/fooout.$botnick]}

    while {[gets $foofile fooverse] >= 0} {
	set len [string length $fooverse]
	set i 0
	set j 72
	while {$j < $len} {
	    while {[string index $fooverse $j] != ";" && [string index $fooverse $j] != ")" && [string index $fooverse $j] != "\n"} {set j [expr $j + 1]}
	    set foo2 [string range $fooverse $i $j]
	    set foo2 [string trim $foo2]
	    putmsg $chan "$foo2"
	    set i [expr $j + 1]
	    set j [expr $j + 73]
	    if {$j > $len} {set j $len}
	}
	set foo2 [string range $fooverse $i end]
	set foo2 [string trim $foo2]
	putmsg $chan "$foo2"
    }
    catch {close $foofile}
    
    putmsg $chan "$fooverse"
    exec rm /tmp/fooout.$botnick
    return 1
}

proc pub_lookups {nick uhost hand channel arg} {
    global von chan bibver
    set chan $channel
    if {$von==0} {
	putmsg $nick "Verse display is currently off."
	return 0
    }
    if {($von==3)  && (![matchattr $hand 3]) && (![matchattr $hand o]) && (![isvoice $nick $chan])} {
	putmsg $nick "Sorry, only ops and voiced users can do searches right now."
	return 0
    }
    if {($von==2) && (![matchattr $hand 3]) && (![matchattr $hand o])} {
	putmsg $nick "Sorry, only ops can do searches right now."
	return 0
    }
    
    pubsearchword $arg
}

#----------------------------------------------------------------------

proc publookupdict {vlookup} {
    global botnick chan bibver diatheke
    regsub -all {[\[\]\{\}\#\%\\\$\'\"\/\s]} $vlookup { } vlookup
    catch {exec $diatheke -f plaintext -b $bibver -k "$vlookup" >& /tmp/fooout.$botnick}
    catch {set foofile [open /tmp/fooout.$botnick]}

    while {[gets $foofile fooverse] >= 0} {
	putmsg $chan "$fooverse"
    }
    catch {close $foofile}
    exec rm /tmp/fooout.$botnick
    return 1
}

proc pub_lookupd {nick uhost hand channel arg} {
    global von chan bibver
    set chan $channel
    if {$von==0} {
	putmsg $nick "Verse display is currently off."
	return 0
    }
    if {($von==3) && (![matchattr $hand 3]) && (![matchattr $hand o]) && (![isvoice $nick $chan])} {
	putmsg $nick "Sorry, only ops and voiced users can use dictionaries and indices right now."
	return 0
    }
    if {($von==2) && (![matchattr $hand 3]) && (![matchattr $hand o])} {
	putmsg $nick "Sorry, only ops can use dictionaries and indices right now."
	return 0
    }

    publookupdict $arg
}

# Saving this as an example of some interesting (but now lost) functionality
# whereby the argument is overridden by the current date for a daily
# devotional query.

#bind pub - !losung setver_losung
#proc setver_losung {nick uhost hand channel arg} {
#    global botnick chan bibver
#    set bibver losung_en_99
#    set arg [exec date "+%m.%d"]
#    pub_lookupd $nick $uhost $hand $channel $arg
#}

#----------------------------------------------------------------------

proc publookupcomm {vlookup} {
    global botnick chan bibver diatheke
    regsub -all {[\[\]\{\}\#\%\\\$\'\"\/\s]} $vlookup { } vlookup
    catch {exec $diatheke -c $bibver "$vlookup" >& /tmp/fooout.$botnick}
    catch {set foofile [open /tmp/fooout.$botnick]}
    while {[gets $foofile fooverse] >= 0} {
	set len [string length $fooverse]
	set i 0
	set j 72
	while {$j < $len} {
	    while {[string index $fooverse $j] != " " && [string index $fooverse $j] != "\n"} {set j [expr $j + 1]}
	    set foo2 [string range $fooverse $i $j]
	    set foo2 [string trim $foo2]
	    regsub -all -nocase {(<FI>|<CM>|<FB>)} $foo2 {} foo2
	    regsub -all {<RF>} $foo2 {(footnote: } foo2
	    regsub -all {<Rf>} $foo2 {)} foo2
	    putmsg $chan "$foo2"
	    set i [expr $j + 1]
	    set j [expr $j + 73]
	    if {$j > $len} {set j $len}
	}
	set foo2 [string range $fooverse $i end]
	set foo2 [string trim $foo2]
	regsub -all -nocase {(<FI>|<CM>|<FB>)} $foo2 {} foo2
	regsub -all {<RF>} $foo2 {(footnote: } foo2
	regsub -all {<Rf>} $foo2 {)} foo2
	putmsg $chan "$foo2"
    }
    catch {close $foofile}
    exec rm /tmp/fooout.$botnick
    return 1
}

proc pub_lookupc {nick uhost hand channel arg} {
    global von chan bibver
    set chan $channel
    if {$von==0} {
	putmsg $nick "Verse display is currently off."
	return 0
    }
    if {($von==3) && (![matchattr $hand 3]) && (![matchattr $hand o]) && (![isvoice $nick $chan])} {
	putmsg $nick "Sorry, only ops and voiced users can use commentaries right now."
	return 0
    }
    if {($von==2) && (![matchattr $hand 3]) && (![matchattr $hand o])} {
	putmsg $nick "Sorry, only ops can use commentaries right now."
	return 0
    }

    publookupcomm $arg
}

#----------------------------------------------------------------------

bind pub - !dict dictlookup

proc dictlookup {nick uhost hand channel arg} {
    global botnick von dict
    
    if {$von==0} {
	putmsg $nick "Verse display is currently off."
	return 0
    }
    if {($von==3) && (![matchattr $hand 3]) && (![matchattr $hand o]) && (![isvoice $nick $channel])}  {
	putmsg $nick "Sorry, only ops and voiced users can use dictionaries and indices right now."
	return 0
    }
    if {($von==2) && (![matchattr $hand 3]) && (![matchattr $hand o])} {
	putmsg $nick "Only ops can use dictionaries and indices right now."
	return 0
    }
    
    regsub -all {[\[\]\{\}\#\%\\\$\'\"\/\s]} $arg { } arg
    catch {exec $dict "$arg" >& /tmp/fooout.$botnick}
    catch {set foofile [open /tmp/fooout.$botnick]}
    catch {set fooverse [gets $foofile]}
    while {[gets $foofile fooverse] >= 0} {
	set fooverse [string trim $fooverse]
	putmsg $channel "$fooverse"
    }
    catch {close $foofile}
    exec rm /tmp/fooout.$botnick
    return 1
}

#----------------------------------------------------------------------

bind pub - !biblehelp pub_help
bind msg - biblehelp pub_help

proc pub_help {nick uhost hand channel arg} {
    global diaver
    global von
    putserv "NOTICE $nick :Diatheke/Tcl BibleBot version $diaver"

    if {(($von==0) || ($von==2)) && (![matchattr $hand 3]) && (![matchattr $hand o])} {
	putserv "NOTICE $nick :BibleBot displays are currently turned off."
	return 1
    }

    putserv "NOTICE $nick :Supported commands:"
    putserv "NOTICE $nick :Help, using \"!biblehelp\""
    putserv "NOTICE $nick :Book list, using \"!books\" (it's long)"
    putserv "NOTICE $nick :Check display status, using \"!status\""
    putserv "NOTICE $nick :Bible lookups, using \"!<bible version> <book> <chapter>:<verse>\""
    putserv "NOTICE $nick :verse ranges can be specified by adding \"-<last verse>\" to this"
    putserv "NOTICE $nick :To turn Strong's numbers and/or footnotes on, use @ and/or # respectively before the book name.  For example \"!kjv @#Gen 1:4\" will retrieve Genesis 1:3 with the Strong's numbers and footnotes associated with it."

    if {($von==3) && (![matchattr $hand 3]) && (![matchattr $hand o]) && (![isvoice $nick $channel])}  {
	return 1
    }

    putserv "NOTICE $nick :Commentary lookups, using \"!<commentary> <book> <chapter>:<verse>\""
    putserv "NOTICE $nick :Dictionary/index lookups, using \"!<dictionary> <word or number>\""
    putserv "NOTICE $nick :Bible searches, using \"!s<bible version> <word>\""
    putserv "NOTICE $nick :Diatheke/Tcl defaults to PHRASE search mode.  To use MULTI-WORD search mode, preface your search with an @.  To use REGEX mode, preface your search with a #.  For example: \"!skjv @Jesus love\" will print a list of all verses in the KJV containing the words Jesus and love."

    if {(![matchattr $hand 3]) && (![matchattr $hand o])}  {
	return 1
    }

    putserv "NOTICE $nick :To turn verse display off, use \"!verseoff\""
    putserv "NOTICE $nick :To turn all displays on for all users, use \"!verseon\""
    putserv "NOTICE $nick :To turn all displays on for ops only, use \"!verseon o\""
    putserv "NOTICE $nick :To turn verse diaplays on for regular users and all other displays on for ops and voiced users only, use \"!verseon v\" (default)"
}

bind pub - !books pub_books
bind msg - books pub_books

proc pub_books {nick uhost hand channel arg} {
    global von

    if {(($von==0) || ($von==2)) && (![matchattr $hand 3]) && (![matchattr $hand o])} {
	putserv "NOTICE $nick :BibleBot displays are currently turned off."
	return 1
    }

    printBibles $nick

    if {($von==3) && (![matchattr $hand 3]) && (![matchattr $hand o]) && (![isvoice $nick $channel])}  {
	return 1
    }

    printComms $nick
    printDicts $nick
}

#----------------------------------------------------------------------

bind pub - !status pub_status
bind msg - status pub_status

proc pub_status {nick uhost hand channel arg} {
    global von
    
    if {$von==0} {
	putserv "NOTICE $nick :All BibleBot displays are currently off."
    } elseif {$von==1} {
	putserv "NOTICE $nick :All BibleBot displays are currently on."
    } elseif {$von==2} {
	putserv "NOTICE $nick :All BibleBot displays are currently on for ops only."
    } else {
	putserv "NOTICE $nick :Verse displays are currently on for all users, but other BibleBot displays are currently restricted to ops and voiced users."
    }
    return 1
}

#---------------------------------------------------------------------

proc pub_verseon {nick uhost hand channel arg} {
    global von
    if {![matchattr $hand 3] && ![matchattr $hand o]} {
	return 0
    } elseif {$arg=="v"} {
	set von 3
#	putserv "NOTICE $nick :Long Text Display is now on for voiced only!"
    } elseif {$arg=="o"} {
	set von 2
#	putserv "NOTICE $nick :Verse Display is now on for ops only!"
    } else {
	set von 1
#	putserv "NOTICE $nick :All Display is now on!"
    }
    pub_status $nick $uhost $hand $channel $arg
    return 1
}
bind pub - !verseon pub_verseon
bind msg - verseon pub_verseon

proc pub_verseoff {nick uhost hand channel arg} {
    global von
    
    if {![matchattr $hand 3] && ![matchattr $hand o]} {
	return 0
    }
    set von 0
#    putserv "NOTICE $nick :Verse Display is now off!"
    pub_status $nick $uhost $hand $channel $arg
    return 1
}
bind pub - !verseoff pub_verseoff
bind msg - verseoff pub_verseoff

proc dcc_verseoff {hand idx arg} {
    global von
    global whovoff
    if {![matchattr $hand 3] && ![matchattr $hand o]} {
	return 0
    }
    set von 0
    set whovoff $hand
    return 1
}
bind dcc - verseoff dcc_verseoff

proc dcc_verseon {hand idx arg} {
    global von
    if {![matchattr $hand 3] && ![matchattr $hand o]} {
	return 0
    }
    elseif {$arg=="v"} {
	set von 3
    }
    elseif {$arg=="o"} {
	set von 2
    } else {
	set von 1
    }
    return 1
}
bind dcc - verseon dcc_verseon

#sets default von mode
set von 1
