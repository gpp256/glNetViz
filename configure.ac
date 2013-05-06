#                                               -*- Autoconf -*-
# Process this file with autoconf to produce a configure script.

#AC_PREREQ([2.68])
AC_INIT([glNetViz], [0.9], [gpp65536@yahoo.co.jp])
AC_CONFIG_SRCDIR([perl_modules/myprimitive.c])
AC_CONFIG_HEADERS([config.h])

# Checks for programs.
AC_PROG_CC
AC_PROG_INSTALL
#AC_PATH_PROG([CMD_CURL],[curl],AC_MSG_ERROR(curl command not found.))
AC_PATH_PROG([CMD_CURL],[curl],[/usr/bin/curl])

# Checks for libraries.

# Checks for header files.
AC_CHECK_HEADERS([stdlib.h string.h math.h perl.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_HEADER_STDBOOL
AC_TYPE_SIZE_T

# Checks for library functions.
AC_FUNC_MALLOC
AC_FUNC_STRTOD
AC_CHECK_FUNCS([memset])
AC_CONFIG_FILES([Makefile
                 perl_modules/Makefile.PL
                 lib/cgi/sdn.pm
])
AC_OUTPUT
