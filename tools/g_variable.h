/*
 * g_variable.h
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../MIT-LICENSE.txt)
 *
 */

/*====================================*/
/*      g_variable.h                  */
/*   Declare global variable.         */
/*   Last Modified 2002 3/1           */
/*====================================*/
#ifndef G_VARIABLE_H_INCLUDE
#define G_VARIABLE_H_INCLUDE

/*====================================*/
/* Define or Extern macros.           */
/* Example:                           */
/*  GLOBAL int g_flag;                */
/* when you want to initialize value, */
/*  GLOBAL int g_max GLOBAL_VAL(100); */
/*------------------------------------*/
/* If you want to define object, you  */
/* must define GLOBAL_VALUE_DEFINE    */
/* before define this file, else if   */
/* want to extern, must not define it.*/
/*====================================*/
/* Define */
#ifdef GLOBAL_VALUE_DEFINE
#define GLOBAL
#define GLOBAL_VAL(v) = (v)
/* Extern */
#else
#define GLOBAL extern
#define GLOBAL_VAL(v) 
#endif

#include "type.h"

/* --- global variables --- */

/* Plot3d */
GLOBAL ViewPoint g_eye;	/* Camera */
GLOBAL NetStat g_netstat;
GLOBAL cl_colorbar g_colorbar;
GLOBAL ConntrackInfo g_conninfo;

#undef GLOBAL
#undef GLOBAL_VAL

#endif
/*====================================*/
/*      EOF "g_variable.h"            */
/*====================================*/
