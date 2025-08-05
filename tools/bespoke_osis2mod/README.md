bespoke_osis2mod is based on the osis2mod utility from CrossWire Bible Society
(www.crosswire.org).  Changes have been made for STEPBible (www.stepbible.org)
to use bespoke versification, which uses custom canon definitions in JSON
format.

The changes may be redistributed and/or modified under the terms of the GNU
General Public License, as published by the Free Software Foundation version 2.


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



