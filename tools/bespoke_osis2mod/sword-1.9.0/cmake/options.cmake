# Borrowed
#
# This macro implements some very special logic how to deal with the cache.
# By default the various install locations inherit their value from their "parent" variable
# so if you set CMAKE_INSTALL_PREFIX, then EXEC_INSTALL_PREFIX, PLUGIN_INSTALL_DIR will
# calculate their value by appending subdirs to CMAKE_INSTALL_PREFIX .
# This would work completely without using the cache.
# But if somebody wants e.g. a different EXEC_INSTALL_PREFIX this value has to go into
# the cache, otherwise it will be forgotten on the next cmake run.
# Once a variable is in the cache, it doesn't depend on its "parent" variables
# anymore and you can only change it by editing it directly.
# this macro helps in this regard, because as long as you don't set one of the
# variables explicitely to some location, it will always calculate its value from its
# parents. So modifying CMAKE_INSTALL_PREFIX later on will have the desired effect.
# But once you decide to set e.g. EXEC_INSTALL_PREFIX to some special location
# this will go into the cache and it will no longer depend on CMAKE_INSTALL_PREFIX.
macro(_SET_FANCY _var _value _comment)
    if (NOT DEFINED ${_var})
        set(${_var} ${_value})
    else()
        set(${_var} "${${_var}}" CACHE STRING "${_comment}")
    endif()
endmacro(_SET_FANCY)

# Installation options
IF(APPLE)
	SET(SWORD_INSTALL_DIR "/opt/local")
ELSEIF(MSVC)
	SET(SWORD_INSTALL_DIR "C:/Program Files (x86)/libsword")
ELSE(APPLE)
	SET(SWORD_INSTALL_DIR "/usr/local")
ENDIF(APPLE)

# A list of the options that the library supports
_SET_FANCY(CMAKE_INSTALL_PREFIX "${SWORD_INSTALL_DIR}" "Directory into which to install architecture-dependent files. Defaults to ${SWORD_INSTALL_DIR}.")

_SET_FANCY(LIB_INSTALL_DIR "${CMAKE_INSTALL_PREFIX}/lib" "Object code library install directory. Defaults to ${SWORD_INSTALL_DIR}/lib")

_SET_FANCY(INCLUDE_INSTALL_DIR "${CMAKE_INSTALL_PREFIX}/include" "C Header files install directory. Defaults to ${SWORD_INSTALL_DIR}/include.")

SET(BINDIR "${CMAKE_INSTALL_PREFIX}/bin" CACHE STRING "Directory to install binary executable files. Defaults to ${SWORD_INSTALL_DIR}/bin.")

_SET_FANCY(SYSCONF_INSTALL_DIR "${CMAKE_INSTALL_PREFIX}/etc" "Directory to install global config files. Defaults to ${SWORD_INSTALL_DIR}/etc.")

_SET_FANCY(SHARE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}/share" "Directory to install global data files. Defaults to ${SWORD_INSTALL_DIR}/share.")

_SET_FANCY(SWORD_PYTHON_INSTALL_DIR "${CMAKE_INSTALL_PREFIX}" STRING "Directory where the Python bindings will be installed. Defaults to default Python path.")

_SET_FANCY(SWORD_PYTHON_2 FALSE STRING "Set to TRUE to build Swig Python bindings for Python 2")

_SET_FANCY(SWORD_PYTHON_3 FALSE STRING "Set to TRUE to build Swig Python bindings for Python 3")

_SET_FANCY(SWORD_PERL FALSE STRING "Set to TRUE to build Swig Perl bindings")

# Post-processing of variables
MACRO(PROCESS_VERSION LEVEL VALUE)
    SET(SWORD_VERSION_${LEVEL} ${VALUE})
    IF(${VALUE} LESS 10)
        SET(${LEVEL} "00${VALUE}")
    ELSEIF(${VALUE} LESS 100)
        SET(${LEVEL} "0${VALUE}")
    ELSE()
        SET(${LEVEL} "${VALUE}")
    ENDIF()
ENDMACRO()

STRING(REGEX MATCHALL "^([0-9]+)\\.([0-9]+)\\.([0-9]+)\\.?([0-9]+)?$"
    SWORD_VERSION_PARTS "${SWORD_VERSION}")
# We don't always have a nano version
IF("${CMAKE_MATCH_4}" STREQUAL "")
    SET(CMAKE_MATCH_4 "0")
ENDIF("${CMAKE_MATCH_4}" STREQUAL "")

SET(SWORD_VERSION_MAJOR ${CMAKE_MATCH_1}) # No post-processing on this, so it's not octal
PROCESS_VERSION("MINOR" ${CMAKE_MATCH_2})
PROCESS_VERSION("MICRO" ${CMAKE_MATCH_3})
PROCESS_VERSION("NANO"  ${CMAKE_MATCH_4})

SET(SWORD_VERSION_STR "${SWORD_VERSION}")
SET(SWORD_VERSION_NUM "${SWORD_VERSION_MAJOR}${MINOR}${MICRO}${NANO}")

MESSAGE(STATUS "SWORD Version ${SWORD_VERSION_NUM}")

IF(SWORD_PYTHON_2 OR SWORD_PYTHON_3 OR SWORD_PERL)
	MESSAGE(STATUS "Building SWIG Bindings")
	SET(SWORD_SWIG_BINDINGS 1)
ELSE()
	SET(SWORD_SWIG_BINDINGS 0)
ENDIF()

IF(SWORD_SWIG_BINDINGS)
	SET(SWORD_BINDINGS TRUE)
ELSE()
	SET(SWORD_BINDINGS FALSE)
ENDIF()
