#-------------------------------------------------------------------------
# Look for Php4
#-------------------------------------------------------------------------

AC_DEFUN([SW_FIND_PHP4],
[

PHP4BIN=

AC_ARG_WITH(php4,[  --with-php4=path	  Set location of PHP4 executable],[ PHP4BIN="$withval"], [PHP4BIN=])

if test -z "$PHP4BIN"; then
AC_PATH_PROGS(PHP4, php php4)
else
PHP4="$PHP4BIN"
fi
AC_MSG_CHECKING(for PHP4 header files)
dirs="/usr/include/php /usr/local/include/php /usr/local/apache/php /usr/include/php4 /usr/local/include/php4 /usr/local/apache/php4"
for i in $dirs; do
	if test -r $i/php_config.h -o -r $i/php_version.h; then
		AC_MSG_RESULT($i)
		PHP4EXT="$i"
		PHP4INC="-I$PHP4EXT -I$PHP4EXT/Zend -I$PHP4EXT/main -I$PHP4EXT/TSRM"
		break;
	fi
done
if test -z "$PHP4INC"; then
	AC_MSG_RESULT(not found)
fi

AC_SUBST(PHP4INC)
	
])
