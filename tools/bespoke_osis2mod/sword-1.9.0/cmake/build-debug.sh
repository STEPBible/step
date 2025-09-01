#!/bin/bash
#
# A sample script showing how to build most of the options available to this system.
# Invoke it from the top directory of SWORD by calling $ cmake/build-debug.sh
#

set -ex -o pipefail
rm -rf build
mkdir -p build
cd build
# Configure with Python and Perl bindings, examples, tests and a debug build into
# a shared library
cmake -DSWORD_PYTHON_3:BOOL=TRUE \
	-DSWORD_PERL:BOOL=TRUE \
	-DSWORD_BUILD_EXAMPLES="Yes" \
	-DSWORD_BUILD_TESTS="Yes" \
	-DLIBSWORD_LIBRARY_TYPE="Shared" \
	-DCMAKE_BUILD_TYPE="Debug" .. \
	-DCMAKE_INSTALL_PREFIX="~/"
make -j10
make -j3 tests
cd ..

echo "Now the library has been built, along with the Perl and Python bindings. \
Both will be installed to the the user's home directory if you are building \
under Linux or a similar Unix-like environment if you execute the command \
'make install' from the build directory with privileges to write into the \
~/ directory."
