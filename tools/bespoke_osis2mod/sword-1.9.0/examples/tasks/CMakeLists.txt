##################################################################################
# These are some examples.  If you want examples to be built, you need to define
# SWORD_BUILD_EXAMPLES="Yes".  These will not be installed, so don't worry about
# that.
# 
MESSAGE(STATUS "\n-- CONFIGURING LIBRARY EXAMPLES")
SET(example_PROGRAMS
	parallelbibles
	simpleverselookup
	listbiblebooknames
)

FOREACH(DEMO ${example_PROGRAMS})
	ADD_EXECUTABLE("${DEMO}"	"${DEMO}.cpp")
	TARGET_LINK_LIBRARIES("${DEMO}" sword)
ENDFOREACH(DEMO ${example_PROGRAMS})

