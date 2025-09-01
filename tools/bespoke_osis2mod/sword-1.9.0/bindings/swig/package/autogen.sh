#!/bin/sh
echo "*** copying swig files"
cp -a ../*.i .
cp -a ../*.h .
cp -R ../local .

echo "*** Recreating libtool"
if test -z "$LTIZE"; then
LTIZE="$AUTODIR""libtoolize"
fi
echo "$LTIZE"
       $LTIZE --force --copy;

ACLOCAL="$AUTODIR""aclocal"
echo "*** Recreating aclocal.m4"
echo "$ACLOCAL"
	$ACLOCAL -I .;

echo "*** Recreating configure"
AUTOCONF="$AUTODIR""autoconf"
	$AUTOCONF;
	
echo "*** Recreating the Makefile.in files"
AUTOMAKE="$AUTODIR""automake"
	$AUTOMAKE -ac --foreign;
