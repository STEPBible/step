SET(MINGW32_ROOT "/usr/i686-w64-mingw32/sys-root/mingw")

SET(CMAKE_SYSTEM_NAME Windows)

# specify the cross compiler
SET(CMAKE_C_COMPILER /usr/bin/i686-w64-mingw32-gcc)
SET(CMAKE_CXX_COMPILER /usr/bin/i686-w64-mingw32-g++)

# where is the target environment
SET(CMAKE_FIND_ROOT_PATH "${MINGW32_ROOT}" /usr/local/i686-w64-mingw32)

# search for programs in the build host directories
SET(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
# for libraries and headers in the target directories
SET(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
SET(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

# FindQt4.cmake queries qmake to get information,
# which doesn't work when crosscompiling
SET(QT_HEADERS_DIR ${CMAKE_FIND_ROOT_PATH}/include)
SET(QT_LIBRARY_DIR ${CMAKE_FIND_ROOT_PATH}/lib)

# set the resource compiler (RHBZ #652435)
SET(CMAKE_RC_COMPILER /usr/bin/i686-w64-mingw32-windres)

# override boost library suffix which defaults to -mgw
SET(Boost_COMPILER -gcc45)

# Since ICU is all strange and smart and stuff, let's do this
SET(ICU_CONFIG_BIN_PATH "${MINGW32_ROOT}/bin/")
SET(ICU_CONFIG_OPTS "--noverify")

INCLUDE_DIRECTORIES("${MINGW32_ROOT}/include/glib-2.0")
INCLUDE_DIRECTORIES("${MINGW32_ROOT}/lib/glib-2.0/include")

SET(CROSS_COMPILE_MINGW32 TRUE)
