#!/bin/bash -e
#
# A sample script showing how to build most of the options available to this system.
# Invoke it from the top directory of SWORD by calling $ cmake/build-release.sh
#

mkdir -p build
cd build
# Configure with Python and Perl bindings, examples, tests and a debug build into
# a shared library, plus static option as well.  They will be installed to the
# /opt/sword directory
cmake -DSWORD_PYTHON_3:BOOL=TRUE \
	-DSWORD_PERL:BOOL=TRUE \
	-DSWORD_BUILD_EXAMPLES="Yes" \
	-DSWORD_BUILD_TESTS="Yes" \
	-DLIBSWORD_LIBRARY_TYPE="Shared Static" \
	-DCMAKE_BUILD_TYPE="Release" \
	-DCMAKE_INSTALL_PREFIX="/opt/sword" ..
make -j10
cd ..

echo "Now the library has been built, along with the Perl and Python bindings. \
If you now execute 'make install' from the build directory you will \
install the library to /opt/sword if you have privileges to write there \
with the account you execute the install from."
