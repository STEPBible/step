# - Try to find XZ
# Once done this will define
#
#  XZ_FOUND - system has XZ
#  XZ_INCLUDE_DIR - the XZ include directory
#  XZ_LIBRARY - Link these to use XZ
#  XZ_DEFINITIONS - Compiler switches required for using XZ

# Copyright (c) 2006, Alexander Neundorf, <neundorf@kde.org>
#
# Redistribution and use is allowed according to the terms of the BSD license.
# For details see the accompanying COPYING-CMAKE-SCRIPTS file.


IF (XZ_INCLUDE_DIR AND XZ_LIBRARY)
    SET(XZ_FIND_QUIETLY TRUE)
ENDIF (XZ_INCLUDE_DIR AND XZ_LIBRARY)

FIND_PATH(XZ_INCLUDE_DIR lzma.h )

FIND_LIBRARY(XZ_LIBRARY lzma )

# handle the QUIETLY and REQUIRED arguments and set XZ_FOUND to TRUE if 
# all listed variables are TRUE
INCLUDE(FindPackageHandleStandardArgs)
FIND_PACKAGE_HANDLE_STANDARD_ARGS(XZ DEFAULT_MSG XZ_LIBRARY XZ_INCLUDE_DIR)

MARK_AS_ADVANCED(XZ_INCLUDE_DIR XZ_LIBRARY)
