#!/bin/sh
#******************************************************************************
#  usrinst.sh -	Convenience script specifying most common development options
#		to ./configure
#
# $Id: usrinst.sh 3822 2020-11-03 18:54:47Z scribe $
#
# Copyright 2002-2013 CrossWire Bible Society (http://www.crosswire.org)
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

OPTIONS="--prefix=/usr $OPTIONS"
if [ -d /usr/lib64 ]
then
	OPTIONS="--libdir=/usr/lib64 $OPTIONS"
else
	OPTIONS="--libdir=/usr/lib $OPTIONS"
fi
OPTIONS="--sysconfdir=/etc $OPTIONS"
OPTIONS="--without-conf $OPTIONS"
OPTIONS="--disable-shared $OPTIONS"
OPTIONS="--enable-debug $OPTIONS"
#OPTIONS="--enable-profile $OPTIONS"
#OPTIONS="--disable-logdebug $OPTIONS"
#OPTIONS="--disable-loginfo $OPTIONS"

OPTIONS="--with-cxx11time $OPTIONS"
#OPTIONS="--with-cxx11regex $OPTIONS"
OPTIONS="--with-icuregex $OPTIONS"
#OPTIONS="--with-icusword $OPTIONS"
#OPTIONS="--without-icu $OPTIONS"
#OPTIONS="--without-clucene $OPTIONS"
#OPTIONS="--without-curl $OPTIONS"

#OPTIONS="--disable-tests $OPTIONS"
#OPTIONS="--disable-utilities $OPTIONS"


# Use these for Windows DLL build
#LIBS="-no-undefined"
#OPTIONS="lt_cv_deplibs_check_method=pass_all $OPTIONS"

# These are for experimental purposes, review,
# may not be available on all platforms, are unsupported,
# and no modules should be released which depend on them. 
# If significant gains in size and speed are achieved,
# we should discuss the portability of these libraries
# and decide if we should make the switch to prefer one
# of these compression systems over zlib.
# That's not to say that support for these is not appreciated
# (chrislit)-- on the contrary, this is the R in R&D, we just
# need to consider portability: ios, android-ndk, and
# windows support, before implying modules can be made with them.
# I am all for switching to one, by policy, if we observe appreciable
# gains and confirm portability.  I only see support disadvantages to
# expanding compression options, otherwise.

#OPTIONS="--with-bzip2 $OPTIONS"
#OPTIONS="--with-xz $OPTIONS"


LIBS="$LIBS" ./configure $OPTIONS $*


echo ""
echo ""
echo ""
echo "Configured to NOT write a global /etc/sword.conf on 'make install'."
echo "If this is the first time you've installed sword, be sure to run"
echo "'make install_config' if you would like a basic configuration installed"
echo ""
echo "Next you might try something like: "
echo ""
echo "make"
echo "sudo make install"
echo "# (and optionally)"
echo "sudo make install_config"
echo "make register"
echo ""
echo ""
echo ""
