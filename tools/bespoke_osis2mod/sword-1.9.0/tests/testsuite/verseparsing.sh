#!/bin/sh
#******************************************************************************
#
# $Id: verseparsing.sh 3063 2014-03-04 13:04:11Z chrislit $
#
# Copyright 1998-2009 CrossWire Bible Society (http://www.crosswire.org)
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

../parsekey "jn.1.1-2.5,9,3;7.9" en KJV ge 1
../parsekey "jn.1.1-2.5" en KJV ge 1

../parsekey "1jn.2.3" en KJV ge 1
../parsekey "1 jn.2.3" en KJV ge 1
../parsekey "Ijn.2.3" en KJV ge 1
../parsekey "I jn.2.3" en KJV ge 1
../parsekey "1jn 2.3" en KJV ge 1
../parsekey "1 jn 2.3" en KJV ge 1
../parsekey "Ijn 2.3" en KJV ge 1
../parsekey "I jn 2.3" en KJV ge 1
../parsekey "1jn.2:3" en KJV ge 1
../parsekey "1 jn.2:3" en KJV ge 1
../parsekey "Ijn.2:3" en KJV ge 1
../parsekey "I jn.2:3" en KJV ge 1
../parsekey "1jn 2:3" en KJV ge 1
../parsekey "1 jn 2:3" en KJV ge 1
../parsekey "Ijn 2:3" en KJV ge 1
../parsekey "I jn 2:3" en KJV ge 1

../parsekey "1.jn.2.3" en KJV ge 1
../parsekey "1. jn.2.3" en KJV ge 1
../parsekey "I.jn.2.3" en KJV ge 1
../parsekey "I. jn.2.3" en KJV ge 1
../parsekey "1.jn 2.3" en KJV ge 1
../parsekey "1. jn 2.3" en KJV ge 1
../parsekey "I.jn 2.3" en KJV ge 1
../parsekey "I. jn 2.3" en KJV ge 1
../parsekey "1.jn.2:3" en KJV ge 1
../parsekey "1. jn.2:3" en KJV ge 1
../parsekey "I.jn.2:3" en KJV ge 1
../parsekey "I. jn.2:3" en KJV ge 1
../parsekey "1.jn 2:3" en KJV ge 1
../parsekey "1. jn 2:3" en KJV ge 1
../parsekey "I.jn 2:3" en KJV ge 1
../parsekey "I. jn 2:3" en KJV ge 1

### German test keys
../parsekey "1. Johannes 2:3" "de" KJV ge 1

### Range parsing tests
../parsekey "1. Johannes 1:1-3:10" "de" KJV ge 1
../parsekey "1. Joh 1:1-3:10" "de" KJV ge 1
../parsekey "1Jn 1:1-3:10" en KJV ge 1
../parsekey "1. Johannes 1:1 - 3:10" "de" KJV ge 1
../parsekey "1. Joh 1:1 - 3:10" "de" KJV ge 1
../parsekey "1Jn 1:1 - 3:10" en KJV ge 1
../parsekey "1. Johannes 1:1 -3:10" "de" KJV ge 1
../parsekey "1. Joh 1:1 -3:10" "de" KJV ge 1
../parsekey "1Jn 1:1 -3:10" en KJV ge 1
../parsekey "1. Johannes 1:1- 3:10" "de" KJV ge 1
../parsekey "1. Joh 1:1- 3:10" "de" KJV ge 1
../parsekey "1Jn 1:1- 3:10" en KJV ge 1

### List parsing tests
../parsekey "1Jn 1:1 3:10" en KJV ge 1
../parsekey "1Jn 1:1  3:10" en KJV ge 1
../parsekey "1Jn 1:1,3:10" en KJV ge 1
../parsekey "1Jn 1:1, 3:10" en KJV ge 1
../parsekey "1Jn 1:1 ,3:10" en KJV ge 1
../parsekey "1Jn 1:1 , 3:10" en KJV ge 1
../parsekey "1Jn 1:1;3:10" en KJV ge 1
../parsekey "1Jn 1:1; 3:10" en KJV ge 1
../parsekey "1Jn 1:1 ;3:10" en KJV ge 1
../parsekey "1Jn 1:1 ; 3:10" en KJV ge 1
../parsekey "1Jn 1:1a ; 3:10b" en KJV ge 1

### Suffix parsing
../parsekey "1Jn 1:1-2a; 3:10b-11" en KJV ge 1
../parsekey "1Jn 1:1c;3:10d-12e,13" en KJV ge 1
../parsekey "Luke 2:45b-3:1a;3:1b-7;3:8-14;3:15-21a" en KJV ge 1

../parsekey "1Jn1.1f; 3:10ff" en KJV ge 1
../parsekey "1Jn1.1ff;3:10f" en KJV ge 1
../parsekey "1Jn1.1,8ff; 3:10-12,14f,17ff" en KJV ge 1
../parsekey "1Jn2.3f." en KJV ge 1
../parsekey "1Jn2.3ff." en KJV ge 1

### check for 'f' in book name which might trigger 'and following'
../parsekey "Song of 3:5" en KJV ge 1
../parsekey "Song of Sol 3:5" en KJV ge 1
../parsekey "Revelation of John 1:1" en KJV ge 1

### check for 'inscriptio' and 'subscriptio' special chapters which parse to Book 0:0 and Book 1:0 respectively (for INTF)
../parsekey "Matt.Inscriptio" en KJV ge 1 0 1
../parsekey "Matt.Subscriptio" en KJV ge 1 0 1
../parsekey "Matt Inscriptio" en KJV ge 1 0 1
../parsekey "Matt  Inscriptio" en KJV ge 1 0 1
../parsekey "Matt  subsc" en KJV ge 1 0 1



en_abbrevs="
Gen Genes Exod Ex Exo Lev Le Levi Num Nu Numb Deut Deu De Josh Jos Joshu
Judg Jdg Judge Ruth Ru Rut 1Sam 1Sa 1Samu 2Sam 2Sa 2Samu 1Kgs 1Ki 1King
2Kgs 2Ki 2King 1Chr 1Chron 1Ch 2Chr 2Chron 2Ch Ezra Ezr Neh Ne Nehe
Esth Es Est Job  Ps Psa Psalm Prov Pr Pro Eccl Ec Ecc Song So Son
Isa Is Isai Jer Jere Je Lam La Lament Ezek Ez Eze Dan Dan Da Hos Hos
Hose Joel Joe Amos Am Amo Obad Ob Oba Jonah Jon Jona Mic Mi Mica Nah Na
Nahu Hab Haba Ha Zeph Zep Hag Hagg Zech Ze Zecha Mal Mala
Matt Mt Mat Mark Mar Ma Luke Lk Luk John Joh Jn Acts Ac A Rom Ro Roma
1Cor 1Co 1Cori 2Cor 2Co 2Cori Gal Ga Gala Eph Ep Ephes Ph Phi Phil Phili Philip
Col Co Colo 1Thess 1Th 1Thes 2Thess 2Th 2Thes 1Tim 1Ti 1Timo
2Tim 2Ti 2Timo Titus Tit Titu Phlm Phile Heb Hebrews Hebr
Jas James Jam 1Pet 1Pe 1Pete 2Pet 2Pe 2Pete 1John 1Jn 1J
2John 2Jn 2J 3John 3Jn 3J Jude Jud Ju Rev Re Reve
"
for i in $en_abbrevs
do
  ../parsekey $i en KJV ge 1
done

