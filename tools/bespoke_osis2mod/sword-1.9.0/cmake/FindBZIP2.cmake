# - Try to find BZIP2
# Once done this will define
#
#  BZIP2_FOUND - system has BZIP2
#  BZIP2_INCLUDE_DIR - the BZIP2 include directory
#  BZIP2_LIBRARY - Link these to use BZIP2
#  BZIP2_DEFINITIONS - Compiler switches required for using BZIP2

# Copyright (c) 2006, Alexander Neundorf, <neundorf@kde.org>
#
# Redistribution and use is allowed according to the terms of the BSD license.
# For details see the accompanying COPYING-CMAKE-SCRIPTS file.


IF (BZIP2_INCLUDE_DIR AND BZIP2_LIBRARY)
    SET(BZIP2_FIND_QUIETLY TRUE)
ENDIF (BZIP2_INCLUDE_DIR AND BZIP2_LIBRARY)

FIND_PATH(BZIP2_INCLUDE_DIR bzlib.h )

FIND_LIBRARY(BZIP2_LIBRARY bz2 )

# handle the QUIETLY and REQUIRED arguments and set BZIP2_FOUND to TRUE if 
# all listed variables are TRUE
INCLUDE(FindPackageHandleStandardArgs)
FIND_PACKAGE_HANDLE_STANDARD_ARGS(BZIP2 DEFAULT_MSG BZIP2_LIBRARY BZIP2_INCLUDE_DIR)

MARK_AS_ADVANCED(BZIP2_INCLUDE_DIR BZIP2_LIBRARY)
