#!/bin/sh
echo "*** Sword build system generation"
echo "*** Recreating libtool"
if test -z "$LTIZE"; then
LTIZE="$AUTODIR""libtoolize"
fi
echo "$LTIZE"
	$LTIZE --force --copy;

ACLOCAL="$AUTODIR""aclocal"
echo "*** Recreating aclocal.m4"
echo "$ACLOCAL"
	$ACLOCAL -I m4;

echo "*** Recreating configure"
AUTOCONF="$AUTODIR""autoconf"
AUTOHEAD="$AUTODIR""autoheader"
	$AUTOHEAD ;
	$AUTOCONF;
	
echo "*** Recreating the Makefile.in files"
AUTOMAKE="$AUTODIR""automake"
	$AUTOMAKE -a -c --foreign;
