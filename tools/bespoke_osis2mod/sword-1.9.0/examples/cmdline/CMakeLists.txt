##################################################################################
# These are some examples.  If you want examples to be built, you need to define
# SWORD_BUILD_EXAMPLES="Yes".  These will not be installed, so don't worry about
# that.
# 
MESSAGE(STATUS "\n-- CONFIGURING LIBRARY EXAMPLES")
SET(example_PROGRAMS
	listoptions
	lookup
	outplain
	outrender
	search
	verserangeparse
	stripaccents
)

FOREACH(DEMO ${example_PROGRAMS})
	ADD_EXECUTABLE("${DEMO}"	"${DEMO}.cpp")
	TARGET_LINK_LIBRARIES("${DEMO}" sword)
ENDFOREACH(DEMO ${example_PROGRAMS})

##################################################################################
# This example uses pthreads explicity.  I don't know if it supports anything else,
# but until I find out, I will force it to find PTHREADS only
# 

FIND_PACKAGE(Threads)

IF(CMAKE_USE_PTHREADS_INIT OR CMAKE_HP_PTHREADS_INIT)
	ADD_EXECUTABLE(threaded_search	threaded_search.cpp)
	TARGET_LINK_LIBRARIES(threaded_search
		sword
		${CMAKE_THREAD_LIBS_INIT}
	)
ENDIF(CMAKE_USE_PTHREADS_INIT OR CMAKE_HP_PTHREADS_INIT)
