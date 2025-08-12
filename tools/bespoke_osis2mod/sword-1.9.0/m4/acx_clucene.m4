dnl CLucene detection m4
AC_DEFUN([ACX_CLUCENE], [
AC_LANG_SAVE
AC_LANG(C++)


# Ask user for path to clucene-core stuff:.
AC_ARG_WITH(clucene,
	AC_HELP_STRING([ --with-clucene=<path>],
		[prefix of CLucene-Core installation. e.g. /usr/local or /usr]),,)

AC_MSG_CHECKING([how to include clucene 0.x])
if test "x$with_clucene" = "xno"; then
	AC_MSG_RESULT(excluding support)
else
#try some default locations
if test -z "$with_clucene" || test "x$with_clucene" = "xyes"; then
	#use parent of this directory, and some common library paths
	with_clucene=$(cd "../" && pwd)
	with_clucene="$with_clucene /usr /usr/local"
else
	#use an absolute path
	with_clucene=$(cd "$with_clucene" && pwd)
fi
clucene_set_failed=
CLUCENE_CXXFLAGS=
CLUCENE_LIBS=
for flag in $with_clucene; do
	if test -z "$clucene_set_failed"; then
		if test -e "$flag/include/CLucene.h"; then
# 64-bit checks first
			if test -e "$flag/lib64/libclucene.la" || test -e "$flag/lib64/libclucene.so"; then
				clucene_set_failed=$flag
				CLUCENE_LIBS="-L$flag/lib64 -lclucene"
				if test -e "$flag/include/CLucene/clucene-config.h"; then
					CLUCENE_CXXFLAGS="-I$flag/include"
				else
					CLUCENE_CXXFLAGS="-I$flag/include -I$flag/lib64"
				fi
			else
# 32-bit checks
				if test -e "$flag/lib/libclucene.la" || test -e "$flag/lib/libclucene.so"; then
					clucene_set_failed=$flag
					CLUCENE_LIBS="-L$flag/lib -lclucene"
					if test -e "$flag/include/CLucene/clucene-config.h"; then
						CLUCENE_CXXFLAGS="-I$flag/include"
					else
						CLUCENE_CXXFLAGS="-I$flag/include -I$flag/lib"
					fi
				fi
			fi
		fi
	fi

	if test -z "$clucene_set_failed"; then
		if test -e "$flag/src/CLucene/StdHeader.h"; then
			if test -e "$flag/src/libclucene.la"; then
				CLUCENE_LIBS="-L$flag/src/ -lclucene"
				CLUCENE_CXXFLAGS="-I$flag/src/"
				clucene_set_failed=$flag/src/
			fi
		fi
	fi
done

if test -z "$clucene_set_failed"; then
	clucene_set_failed="true"
        with_clucene="no"
	AC_MSG_RESULT(excluding support)
else
	AC_MSG_RESULT($clucene_set_failed)
fi

if test "$clucene_set_failed" = "true"; then
	AC_MSG_WARN([Could not detect clucene location.  To enable clucene, you must
		call configure with the --with-clucene option specifying the location.
	    This tells configure where to find the CLucene Core library and headers.
	    e.g. --with-clucene=/usr/local or --with-clucene=/usr])
fi
AC_SUBST(CLUCENE_LIBS)
AC_SUBST(CLUCENE_CXXFLAGS)
fi



AC_LANG_RESTORE
])dnl ACX_CLUCENE

