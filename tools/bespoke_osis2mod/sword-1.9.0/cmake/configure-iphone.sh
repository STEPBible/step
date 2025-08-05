#! /bin/bash
# Usage: accepts 2 arguments - in order - SDK version, root of the source
# Anything after those first two commands are passed to CMake
if [ $# -lt 2 ]
then
	echo "usage: $0 <SDK Version> <root of build> [additional CMake parameters]"
	exit
fi

unset CPATH
unset C_INCLUDE_PATH
unset CPLUS_INCLUDE_PATH
unset OBJC_INCLUDE_PATH
unset LIBS
unset DYLD_FALLBACK_LIBRARY_PATH
unset DYLD_FALLBACK_FRAMEWORK_PATH

export SDKVER="$1"
shift
export DEVROOT="/Developer/Platforms/iPhoneOS.platform/Developer"
export SDKROOT="$DEVROOT/SDKs/iPhoneOS$SDKVER.sdk"
export PKG_CONFIG_PATH="$SDROOT/usr/lib/pkgconfig":"/opt/iphone-$SDKVER/lib/pkgconfig":"/usr/local/iphone-$SDKVER/lib/pkgconfig"
export PKG_CONFIG_LIBDIR="$PKG_CONFIG_PATH"
export MAINFOLDER=$1
shift

cmake \
     -DCMAKE_TOOLCHAIN_FILE="$MAINFOLDER/cmake/toolchains/iphone-$SDKVER.toolchain" \
     -DCMAKE_INSTALL_PREFIX="/opt/iphone-$SDKVER" \
	$MAINFOLDER $*
