/*
 * earthmap.c
 *
 * Copyright (c) 2013 Yoshi 
 * This software is distributed under the MIT License.(../MIT-LICENSE.txt)
 *
 */

#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <math.h>
#include "type.h"
#define GLOBAL_VALUE_DEFINE
#include "g_variable.h"

#define todeg (180.0f/M_PI)
#define torad (M_PI/180.0f)
#define SITE_MARKER_SIZE  0.03
#define EARTH_SIZE 1.0
#define MAX_PLOT_LINE_NUM 10
#define MAX_VERTEX_NUM  1600
#define MAX_INDEX_NUM   3840

/* dummy */
typedef enum {
	GL_TRIANGLE_STRIP
} GLenum;

typedef struct {
	point pt[3];
} triangle;

typedef struct {
	float *verticies;
	float *normals;
	unsigned short *indices;
	int entry_num;
} verticiesPool;

static EndPoint epoint[MAX_PLOT_LINE_NUM*2];
#if 0
static verticiesPool torus[MAX_PLOT_LINE_NUM];
static int old_torus_entry = 0;
static int n_elem=0;
static int vertex_index=0;
#endif

#if 0
static double tolat(double x, double y, double z);
static double tolon(double x, double y, double z);
static void normalize(point *r);
static void lerp(point *a, point *b, float f, point *r);
static void torusFree(int index);
#endif

static double tox(double lat, double lon);
static double toy(double lat, double lon);
static double toz(double lat, double lon);
static void partialdoughnut(
	float r, float R, int nsides,
	int rings, GLenum type, float span, float offset, int index);
static void partialtorus(float offset, float span, float zoom, int index);
static void plot_line(const float fromlat, const float fromlon,
	const float tolat, const float tolon, const long npkt, const int index);

/* ================================================= */
/* Main Routine                                      */
/* ================================================= */
int main (int argc, char **argv) {
	if (argc != 5) {
		fprintf(stderr, "Usage: %s fromlat fromlon tolat tolon\n", argv[0]); exit(1);
	}
	//Args should be checked numbers by cgi.
#if 1
	fprintf(stdout, "{\n");
	plot_line(
		strtof(argv[1], NULL), strtof(argv[2], NULL),
		strtof(argv[3], NULL), strtof(argv[4], NULL), 100, 0
	);
	fprintf(stdout, "}\n");
#else
	{
		int i = 0;
		//if (old_torus_entry != g_netstat.n_entry)
		if (g_netstat.update_flag==1) {
			for (i = 0; i<MAX_PLOT_LINE_NUM; i++) torusFree(i);
			g_netstat.update_flag=0;
		}
		for (i=0; i<g_netstat.n_entry; i++) {
			plot_line(
				g_netstat.end_pos[i].lat,
				g_netstat.end_pos[i].lon,
				g_netstat.start_pos.lat,
				g_netstat.start_pos.lon,
				10, i);
		}
		epoint[i*2].pos.x = 0.0; epoint[i*2].pos.y = 0.0; epoint[i*2].pos.z = 0.0;
		//old_torus_entry = g_netstat.n_entry;
	}
#endif
	return (0);
}

/* ================================================= */
/* Sub Routines                                      */
/* ================================================= */
#if 0
/**
 * tolat() returns the latitude of a point on the unit sphere.
 * (Latitudes are the "y" axis on a mercator projection map.)
 */
static double tolat(double x, double y, double z)
{
	return(atan2(y, sqrt(1 - y*y)) * todeg);
}

/**
 * tolon() returns the longitude of a point on the unit sphere.
 * (Longitudes are the "x" axis on a mercator projection map.)
 */
static double tolon(double x, double y, double z)
{
	if(y == 1.0 || y == -1.0) return(5000.0); 
	return((atan2(x,z) * todeg));
}

/* normalize point r */
static void normalize(point *r)
{
	float mag;
	mag = r->x * r->x + r->y * r->y + r->z * r->z;
	if (mag != 0.0f) {
		mag = 1.0f / sqrt(mag);
		r->x *= mag;
		r->y *= mag;
		r->z *= mag;
	}
}

/* linearly interpolate between a & b, by fraction f */
static void lerp(point *a, point *b, float f, point *r)
{
	r->x = a->x + f*(b->x-a->x);
	r->y = a->y + f*(b->y-a->y);
	r->z = a->z + f*(b->z-a->z);
}
#endif

/**
 * The following three functions returns the x-, y-, and z-coordinate
 * respectively for the specified point on the surface.
 * (These are often used together: maybe make a combined function?)
 */

static double tox(double lat, double lon)
{
	return(sin(lon*torad)*cos(lat*torad));
}

static double toy(double lat, double lon)
{
	return(sin(lat*torad));
}

static double toz(double lat, double lon)
{
	return(cos(lon*torad)*cos(lat*torad));
}

#if 0
static void torusFree(int index) {
	// free
	if (torus[index].verticies != NULL) free(torus[index].verticies);
	if (torus[index].normals != NULL) free(torus[index].normals);
	if (torus[index].indices != NULL) free(torus[index].indices);
	torus[index].verticies = NULL;
	torus[index].normals = NULL;
	torus[index].indices = NULL;
	torus[index].entry_num = 0;
}
#endif

static void partialdoughnut(
	float r, float R, int nsides,
	int rings, GLenum type, float span, float offset, int index)
{
	int i, j;
	float theta, phi, theta1, phi1;

#if 0
	static int init_counter = 0;
	float p0[03], p1[3], p2[3], p3[3];
	float n0[3], n1[3], n2[3], n3[3];

    if (torus[index].entry_num == 0) {
        // 4 x rings x 4 vertices x 3 dim
        int n_elem = 0;
        // calloc
        //netvis_logi(3, "torus: index=%d: allocate memory = %d", index, 48*rings);
        fprintf(stderr, "torus: index=%d: allocate memory = %d¥n", index, 48*rings);
        torus[index].verticies = (float *)calloc(48 * rings, sizeof(float));
        if(torus[index].verticies == NULL) {
            //netvis_logi(3, "torus[index].verticies: Out of Memoryﾂ･n");
            fprintf(stderr, "torus[index].verticies: Out of Memoryﾂ･n");
            return;
        }
        torus[index].normals = (float *)calloc(48 * rings, sizeof(float));
        if(torus[index].normals == NULL) {
            //netvis_logi(3, "torus[index].normals: Out of Memoryﾂ･n");
            fprintf(stderr, "torus[index].normals: Out of Memoryﾂ･n");
            if (torus[index].verticies != NULL) free(torus[index].verticies);
            torus[index].verticies = NULL; return;
        }
        torus[index].indices = (unsigned short *)calloc(48 * rings, sizeof(unsigned short));
        if(torus[index].indices == NULL) {
            //netvis_logi(3, "torus[index].indices: Out of Memoryﾂ･n");
            fprintf(stderr, "torus[index].indices: Out of Memoryﾂ･n");
            if (torus[index].verticies != NULL) free(torus[index].verticies);
            if (torus[index].normals != NULL) free(torus[index].normals);
            torus[index].verticies = NULL; torus[index].normals = NULL;
            return;
        }

    for (i = 0; i < rings; i++) { // 4 * rings
        theta = (float) offset + i *2.0 * (span/360.0) * M_PI / rings;
        theta1 =(float) offset + (i + 1) * 2.0 * (span/360.0) * M_PI / rings;
        for (j = 0; j < nsides; j++) { // 4
            phi = (float) j *2.0 * M_PI / nsides;
            phi1 = (float) (j + 1) * 2.0 * M_PI / nsides;

            p0[0] = cos(theta) * (R + r * cos(phi));
            p0[1] = -sin(theta) * (R + r * cos(phi));
            p0[2] = r * sin(phi);

            p1[0] = cos(theta1) * (R + r * cos(phi));
            p1[1] = -sin(theta1) * (R + r * cos(phi));
            p1[2] = r * sin(phi);

            p2[0] = cos(theta1) * (R + r * cos(phi1));
            p2[1] = -sin(theta1) * (R + r * cos(phi1));
            p2[2] = r * sin(phi1);

            p3[0] = cos(theta) * (R + r * cos(phi1));
            p3[1] = -sin(theta) * (R + r * cos(phi1));
            p3[2] = r * sin(phi1);

            n0[0] = cos(theta) * (cos(phi));
            n0[1] = -sin(theta) * (cos(phi));
            n0[2] = sin(phi);

            n1[0] = cos(theta1) * (cos(phi));
            n1[1] = -sin(theta1) * (cos(phi));
            n1[2] = sin(phi);

            n2[0] = cos(theta1) * (cos(phi1));
            n2[1] = -sin(theta1) * (cos(phi1));
            n2[2] = sin(phi1);

            n3[0] = cos(theta) * (cos(phi1));
            n3[1] = -sin(theta) * (cos(phi1));
            n3[2] = sin(phi1);

            // 1
            torus[index].normals[n_elem*3  ]    = n3[0];
            torus[index].normals[n_elem*3+1]    = n3[1];
            torus[index].normals[n_elem*3+2]    = n3[2];
            torus[index].verticies[n_elem*3  ]  = p3[0];
            torus[index].verticies[n_elem*3+1]  = p3[1];
            torus[index].verticies[n_elem*3+2]  = p3[2];
            n_elem++;
            torus[index].indices[torus[index].entry_num++] = n_elem-1;
            // 2
            torus[index].normals[n_elem*3  ]    = n2[0];
            torus[index].normals[n_elem*3+1]    = n2[1];
            torus[index].normals[n_elem*3+2]    = n2[2];
            torus[index].verticies[n_elem*3  ]  = p2[0];
            torus[index].verticies[n_elem*3+1]  = p2[1];
            torus[index].verticies[n_elem*3+2]  = p2[2];
            n_elem++;
            torus[index].indices[torus[index].entry_num++] = n_elem-1;
            // 3
            torus[index].normals[n_elem*3  ]    = n0[0];
            torus[index].normals[n_elem*3+1]    = n0[1];
            torus[index].normals[n_elem*3+2]    = n0[2];
            torus[index].verticies[n_elem*3  ]  = p0[0];
            torus[index].verticies[n_elem*3+1]  = p0[1];
            torus[index].verticies[n_elem*3+2]  = p0[2];
            n_elem++;
            torus[index].indices[torus[index].entry_num++] = n_elem-1;
            // 4
            torus[index].normals[n_elem*3  ]    = n1[0];
            torus[index].normals[n_elem*3+1]    = n1[1];
            torus[index].normals[n_elem*3+2]    = n1[2];
            torus[index].verticies[n_elem*3  ]  = p1[0];
            torus[index].verticies[n_elem*3+1]  = p1[1];
            torus[index].verticies[n_elem*3+2]  = p1[2];
            n_elem++;
            torus[index].indices[torus[index].entry_num++] = n_elem-1;

        }
    }
    fprintf(stderr, "earthmap create_torus: index=%d: entry_num=%d¥n", 
        index, torus[index].entry_num);
    } // if (torus.entry_num == 0)
#endif

	fprintf(stdout, "\"flows\": [\n");
	theta = (float) offset;
	theta1 =(float) offset + 2.0 * (span/360.0) * M_PI;
	{
	static int n[MAX_PLOT_LINE_NUM] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
	point q, r0, r1;
	float radius;
	int divnum = 12;
	q.x = 0.5 * R * (cos(theta1) + cos(theta));
	q.y = - 0.5 * R * (sin(theta1) + sin(theta));
	q.z = 0;
	radius = 0.5 * R * sqrt(2.0 * (1-cos(theta1)*cos(theta) - sin(theta1)*sin(theta)));
	for (j = 0; j < 4; j++) {
		int rflag=0;
		fprintf(stdout, "  [");
		for (i = n[index]%4; i < divnum; i+=4) {
			phi = (float) i * 2.0 * M_PI / divnum;
			phi1 = (float) (i + 1) * 2.0 * M_PI / divnum;
			r0.x = q.x + radius * cos(phi); r0.y = q.y + radius * sin(phi); r0.z = 0;
			r1.x = q.x + radius * cos(phi1); r1.y = q.y + radius * sin(phi1); r1.z = 0;
			if (r0.x*r0.x+r0.y*r0.y-R*R >= 0) {
				fprintf(stdout, "%c{ \"end\": [%f, %f, %f], \"start\": [%f, %f, %f] }",
						(rflag>0) ? ',' : ' ', r0.x, r0.y, r0.z, r1.x, r1.y, r1.z);
				rflag++;
			}
		}
		n[index]++;
		fprintf(stdout, "  ]%c\n", ((j+1)>=4) ? ' ' : ',');
	}
	}
	fprintf(stdout, "],\n");

	// draw octahedron
	theta = (float) offset;
	theta1 = (float) offset + 2.0 * (span/360.0) * M_PI;
	phi = (float) 0.0;
	phi1 = (float) 2.0 * M_PI;
	{
		point s;
		point e;
		s.x = cos(theta) * (R + r * cos(phi));
		s.y = -sin(theta) * (R + r * cos(phi));
		s.z = r * sin(phi);
		e.x = cos(theta1) * (R + r * cos(phi));
		e.y = -sin(theta1) * (R + r * cos(phi));
		e.z = r * sin(phi);
		epoint[index*2].pos = s;
		epoint[index*2+1].pos = e;
		fprintf(stdout, "\"start\": [%f, %f, %f],\n\"end\": [%f, %f, %f]\n",
				s.x, s.y, s.z, e.x, e.y, e.z);
	}
}

static void partialtorus(float offset, float span, float zoom, int index)
{
	float size = (SITE_MARKER_SIZE/2)/zoom;
	partialdoughnut(size, size+1, 4, (int)span/6+2,
		GL_TRIANGLE_STRIP, span, (M_PI/180.0)*offset, index);
}

/**
 * This is only used from makeearth, to plot a line on the globe.
 * There is some difficultish maths in this one.
 *
 * "to" and "from" in the comments in the code refers to the two
 * points given as arguments.
 */
static void plot_line(
	const float fromlat,
	const float fromlon,
	const float tolat,
	const float tolon,
	const long npkt,
	const int index)
{
	float vink;
	float linesweep;
	
	linesweep = acos(tox(tolat, tolon)*tox(fromlat, fromlon)
		+toy(tolat, tolon)*toy(fromlat, fromlon)
		+toz(tolat, tolon)*toz(fromlat, fromlon)) * todeg;
	
	vink = todeg*acos((sin(tolat*torad)-sin(fromlat*torad)*cos(linesweep*torad))/
		( cos(fromlat*torad) * sin(linesweep*torad)));
	
	if(fromlon > 0.0) {
		if(tolon > fromlon || tolon < fromlon - 180.0) vink = -vink;
	} else {
		if(tolon > fromlon && tolon < fromlon + 180.0) vink = -vink;
	}

	/*   Rotate "to" to a position 'south' of "from".   */
	fprintf(stdout, "\"rot\": [ [%f, %lf, %lf, %lf], ",
		vink, tox(fromlat, fromlon), toy(fromlat, fromlon), toz(fromlat, fromlon));

	epoint[index*2].vink = vink;
	epoint[index*2].rot.x = tox(fromlat, fromlon);
	epoint[index*2].rot.y = toy(fromlat, fromlon);
	epoint[index*2].rot.z = toz(fromlat, fromlon);
	epoint[index*2].longitude = fromlon;
	epoint[index*2].latitude = fromlat;
	
	/*   ...and rotate them onto the z=0 plane.   */
	fprintf(stdout, "[%f, %lf, %lf, %lf] ],\n", 90.0+fromlon, 0.0, 1.0, 0.0);
	
	epoint[index*2].fromlon = 90+fromlon;
	epoint[index*2+1] = epoint[index*2];
	epoint[index*2+1].longitude = tolon;
	epoint[index*2+1].latitude = tolat;
	
	partialtorus((float)fromlat-180.0, (float)linesweep, EARTH_SIZE, index);
}
