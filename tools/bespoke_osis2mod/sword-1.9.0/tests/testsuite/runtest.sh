#!/bin/sh
#******************************************************************************
#
# Runs a single test
#
# $Id: runtest.sh 3063 2014-03-04 13:04:11Z chrislit $
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

if [ "$1" = "" ]; then
	echo usage: $0 "<test_to_run (no .sh)>"
	exit 1
fi

./$1.sh > $1.try
BAD=`diff -uBb $1.try $1.good`
if [ "$BAD" = "" ]; then
	if [ "$2" = "-q" ]; then
		exit 0
	else
		echo PASSED!
	fi
	exit 0
else
	if [ "$2" = "-q" ]; then
		exit 1
	else
		echo "Script failed at: (- bad output; + should have been)"
		diff -u $1.try $1.good
	fi
	exit 1
fi
