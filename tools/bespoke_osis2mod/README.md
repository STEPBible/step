bespoke_osis2mod is based on the osis2mod utility from CrossWire Bible Society
(www.crosswire.org).  Changes have been made for STEPBible (www.stepbible.org)
to use bespoke versification, which uses custom canon definitions in JSON
format.

The changes may be redistributed and/or modified under the terms of the GNU
General Public License, as published by the Free Software Foundation version 2.


To build on Windows using Visual Studio
=======================================

1. Build sword and utilities

The solution file is "utilities.sln" found under sword-1.9.0\utilities\vcppmake

This Solution does not use the Common Language Runtime (CLR).

This version has been tested with VS 2013. Loading with a later version will
require a Platform Toolset upgrade.

After loading the solution, ensure that the Solution Configuration is set to
"Release", then build.

The solution is configured to build all the sword modules. However, you may
limit the build to just libsword and osis2mod.


2. Build icu dependency

The solution file for this is "allinone.sln" found under icu-sword\allinone

This Solution does not use the Common Language Runtime (CLR).

This solution requires VS 2022.

After loading the solution, ensure that the Solution Configuration is set to
"Release", then build.

The output from this solution is found under bin\ as 3 DLLs, icudt51.dll,
icuin51.dll and icuuc51.dll


3. Putting it all together

Create a folder for running osis2mod.exe,and copy the following files to the
folder:

    sword-1.9.0\utilities\vcppmake\Release\osis2mod.exe
    sword-1.9.0\lib\vcppmake\Release\libsword.dll
    bin\icudt51.dll
    bin\icuin51.dll
    bin\icuuc51.dll



To build on Linux systems
=========================

The following dependencies are required on Ubuntu:

    g++
    libtool
    zlib1g-dev
    libicu-dev

These may differ on other distributions.


Run the configuration utility script and compile:

    cd sword-1.9.0
    ./usrinst.sh --enable-tests=no --with-curl=no
    make

To install the osis2mod command under /bin, run the following under the root ID
or in conjunction the sudo command:

    make install



