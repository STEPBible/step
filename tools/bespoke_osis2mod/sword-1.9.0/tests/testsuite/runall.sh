#!/bin/sh
#******************************************************************************
#
# Runs entire test suite
#
# $Id: runall.sh 3063 2014-03-04 13:04:11Z chrislit $
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

TESTSUITE=`for i in *.good; do basename $i .good; done`

for i in $TESTSUITE; do
	echo -n "$i: "
	./runtest.sh $i -q
	if [ $? -ne 0 ]; then
		echo FAILED
		echo ""
		echo To see problems, try running:
		echo ./runtest.sh $i
		echo ""
		exit 1
	else
		echo PASSED.
	fi
done
echo "ALL PASSED!"
exit 0
fi
