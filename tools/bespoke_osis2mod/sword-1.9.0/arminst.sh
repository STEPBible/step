#!/bin/sh
#******************************************************************************
# Convenience script specifying ARM options to ./configure
#
# $Id: arminst.sh 3063 2014-03-04 13:04:11Z chrislit $
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
#


OPTIONS="--host=arm-linux $OPTIONS"
OPTIONS="--without-curl $OPTIONS"
OPTIONS="--disable-shared $OPTIONS"
OPTIONS="--without-lucene $OPTIONS"

export PATH=$PATH:/usr/local/arm/2.95.3/bin/

. ./usrinst.sh

