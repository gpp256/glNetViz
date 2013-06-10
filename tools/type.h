/*
 * type.h
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../MIT-LICENSE.txt)
 *
 */

#if !defined(_TYPE_CU_H)
#define _TYPE_CU_H

#ifndef M_PI
#define M_PI 3.14159265
#endif

#define FALSE (0)
#define TRUE (1)

#define EPSILON 1.0e-10

//#define DEPTH 2
#define TOL 1.0e-7

//#define MAX_SPHERE_NUM 32

/*!This macro gets number of array element.*/
#define Number(ary) (sizeof(ary)/sizeof(ary[0]))

#define DMIN(x,y) ((x)<(y)?(x):(y))
#define DMAX(x,y) ((x)<(y)?(y):(x))
#define Compare(x,y,z) ((x)<=(y) && (x)<=(z))
#define SIGN(x) (((x)<0)?(-1):(1))
#define Floor(x) (((x)<0.0)?((int)((x)-1.0)):((int)(x)))
#define Range(x,y,z) ((x)>=(y) && (x)<=(z))

#define  LOG_TAG    "native_gles"
#define  LOGI(...)  __android_log_print(ANDROID_LOG_INFO,LOG_TAG,__VA_ARGS__)
#define  LOGE(...)  __android_log_print(ANDROID_LOG_ERROR,LOG_TAG,__VA_ARGS__)

typedef struct {
	double m00, m01, m02, m03;
	double m10, m11, m12, m13;
	double m20, m21, m22, m23;
	double m30, m31, m32, m33;
}matrix4d;

typedef struct {
	double x,y,z,w;
}point4d;

#if 0
typedef struct {
	char *data;
	unsigned int num;
	size_t len;
} GArray;
#endif

typedef struct {
    float x, y, z;
} point;

typedef struct {
  float x,y,z;
} GLVector;

typedef struct {
  float x,y,z;
} GLVector3f;

typedef struct {
  double x,y,z;
} GLVector3lf;

typedef struct {
  float r,g,b,o;
} GLColor;

typedef struct {
	matrix4d rmatrix;
	float fx;
	float fy;
	float af;
	float scale;
} TouchInfo;

typedef struct {
	GLVector3f pos;
	GLVector3f v;
	TouchInfo tinfo;
	float lonlat[2];
} ViewPoint;

typedef struct {
	point pos;
	float vink;
	GLVector3f rot;
	float fromlon;
	float longitude;//Œo“x
	float latitude;	//ˆÜ“x
} EndPoint;

typedef struct {
    float lon, lat;
} GeoPosition;

#define MAX_GEO_ENTRY 10
#define MAX_CONNTRACK_ENTRY 10

typedef struct {
	int n_entry;
	GeoPosition end_pos[MAX_GEO_ENTRY];
	GeoPosition start_pos;
	int strength[MAX_GEO_ENTRY];
	int colorbar_max;
	int update_flag;
} NetStat;

typedef struct {
	int n_entry;
	float srcdst[MAX_CONNTRACK_ENTRY*4];
	int update_flag;
} ConntrackInfo;

typedef struct {
	float min, max;	  //
	float CT[200][3]; // Color Table
} cl_colorbar;

#endif
