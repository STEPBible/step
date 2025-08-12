####################################################################
# And, of course, diatheke is a beast unto itself
#
# Let's go!
#
ADD_EXECUTABLE(diatheke
	diatheke.cpp
	corediatheke.cpp
	diathekemgr.cpp
	diafiltmgr.cpp
	thmlcgi.cpp
	gbfcgi.cpp
	osiscgi.cpp
)
IF(BUILDING_SHARED)
	TARGET_LINK_LIBRARIES(diatheke sword)
ELSE(BUILDING_SHARED)
	TARGET_LINK_LIBRARIES(diatheke sword_static)
ENDIF(BUILDING_SHARED)
INSTALL(TARGETS diatheke
	DESTINATION "${BINDIR}"
	COMPONENT utilities
)

