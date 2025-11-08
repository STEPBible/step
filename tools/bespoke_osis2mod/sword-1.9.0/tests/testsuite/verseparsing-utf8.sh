#!/bin/sh
#******************************************************************************
#
# This only works if --with-icu was passed to configure 
#
# $Id: verseparsing-utf8.sh 3063 2014-03-04 13:04:11Z chrislit $
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

### German test keys
../parsekey "Matthäus 2:3-12" "de" KJV ge 1
../parsekey "Römer 2:13" "de" KJV ge 1
../parsekey "Matthäus 1:2-Röm 3:13" "de" KJV ge 1
../parsekey "1. Könige 2" "de" KJV ge 1

../parsekey "1. Könige - 2. Könige; Markus 1:1; Matthäus 2:1; Matthäus; 1.Kön" "de" KJV ge 1
../parsekey "1. Könige - 2. Könige; Markus 1:1; Matthäus 2:1; Matthäus; 1.Kön-2.Kön;I Kings-Matthäus" "de" KJV ge 1
../parsekey "Maleachi 1:1 - Matthäus 2:1" "de" KJV ge 1
