######################################################################
# This will test to see if the system has a regex.h file.  If so, then
# that header will be included and the library will not build its own
# regex support.  If the regex.h is located, then it is assumed that the
# Standard C Library has built-in support for Regex and it will not be
# necessary for SWORD to use its own system internally.
#
# Variables:
# REGEX_INCLUDE_DIR	- the directory containing the regex.h file
# REGEX_FOUND		- Set to true if the system's regex.h exists

# We call this twice because on Mac, at least for me, it finds a regex.h
# inside of /System/Library/Frameworks/Ruby.framework/Headers, which is
# the paramount of useless.  By calling it the first time with some basic
# Unix/Linux compatible forced paths, if it finds it there, then we won't
# have to search again, the value will be cached.  However, if the first
# call to FIND_PATH fails, then the search will be run again below.
FIND_PATH(REGEX_INCLUDE_DIR regex.h
	PATHS /usr/include /usr/local/include
	NO_DEFAULT_PATH
	ONLY_CMAKE_FIND_ROOT_PATH
)
# Second call
IF(NOT REGEX_INCLUDE_DIR)
	FIND_PATH(REGEX_INCLUDE_DIR regex.h
			ONLY_CMAKE_FIND_ROOT_PATH	# Hopefully that will assist in iPhone stuffs
		 )
ENDIF(NOT REGEX_INCLUDE_DIR)

FIND_LIBRARY(REGEX_LIBRARY
	NAMES regex gnurx)

IF(REGEX_INCLUDE_DIR)
	SET(REGEX_FOUND 1)
	MESSAGE(STATUS "System regex.h: Yes")
ELSE(REGEX_INCLUDE_DIR)
	MESSAGE(STATUS "System regex.h: No")
ENDIF(REGEX_INCLUDE_DIR)

MARK_AS_ADVANCED(
	REGEX_INCLUDE_DIR
)

