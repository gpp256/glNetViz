/*
 * myprimitive.c
 *
 * Copyright (c) 2012 Yoshi 
 * This software is distributed under the MIT License.(../MIT-LICENSE.txt)
 *
 */
#include <stdio.h>
#include <math.h>
#include "myprimitive.h"

#define glRotatef(r,x,y,z) { \
	printf("%.10lf, %d, %d, %d\n", (r), (x), (y), (z)); \
	}

double dot_product(Vector a, Vector b) {
  return (a.x*b.x + a.y*b.y + a.z*b.z);
}

void rotate_arrow(Vector start, Vector end) {

	if(end.x-start.x==0){/* x: ==0 */
		if(end.y-start.y==0){
			if(end.z-start.z>0)glRotatef(-90.0,0,1,0);
			if(end.z-start.z<0)glRotatef(90.0,0,1,0);
		}
		else{
			glRotatef((180*atan2((end.z-start.z),(end.y-start.y)))/M_PI,1,0,0);
			glRotatef(90.0,0,0,1);
		}
	}
	else if(end.y-start.y==0){/* y : ==0 */
		glRotatef(-((180*atan2((end.z-start.z),(end.x-start.x)))/M_PI),0,1,0);
	}
	/* when x: !=0 && y: !=0, following executed. */
	else if(end.z-start.z==0){/* z : ==0 */
		glRotatef((180*atan2((end.y-start.y),(end.x-start.x)))/M_PI,0,0,1);
	}
	else if(end.z-start.z>0){ /* z : >0 */
		glRotatef(-((180*atan2((end.z-start.z),(end.x-start.x)))/M_PI),0,1,0);
		if(end.x-start.x>0){
			if((end.x-start.x)<=(end.z-start.z)){
				glRotatef((180*atan2((end.y-start.y),(end.z-start.z)))/M_PI,0,0,1);
			}
			else{
				glRotatef((180*atan2((end.y-start.y),(end.x-start.x)))/M_PI,0,0,1);
			}
		}
		else if(end.x-start.x<0){
			if(-(end.x-start.x)<=(end.z-start.z)){
				glRotatef((180*atan2((end.y-start.y),(end.z-start.z)))/M_PI,0,0,1);
			}
			else{
				glRotatef((180*atan2((end.y-start.y),-(end.x-start.x)))/M_PI,0,0,1);
			}
		}
		else{
			/* impossible. */
		}
	}
	else if(end.z-start.z<0){ /* z : <0 */
		//glRotatef(-((180*atan2((end.z-start.z),(end.x-start.x)))/M_PI),0,1,0);
		if(end.x-start.x>0){
			if((end.x-start.x)<=-(end.z-start.z)){
				glRotatef(-((180*atan2((end.z-start.z),(end.x-start.x)))/M_PI),0,1,0);
				glRotatef((180*atan2((end.y-start.y),-(end.z-start.z)))/M_PI,0,0,1);
			}
			else{
				glRotatef(-((180*atan2((end.z-start.z),(end.x-start.x)))/M_PI),0,1,0);
				glRotatef((180*atan2((end.y-start.y),(end.x-start.x)))/M_PI,0,0,1);
			}
		}
		else if(end.x-start.x<0){
			glRotatef(-((180*atan2((end.z-start.z),(end.x-start.x)))/M_PI),0,1,0);
			if(-(end.x-start.x)<=-(end.z-start.z)){
				glRotatef((180*atan2((end.y-start.y),-(end.z-start.z)))/M_PI,0,0,1);
			}
			else{
				glRotatef((180*atan2((end.y-start.y),-(end.x-start.x)))/M_PI,0,0,1);
			}
		}
		else{
			/* impossible. */
		}
	}
	else{
		/* impossible. */
	}
}

Vector vector_add(Vector a, Vector b) {
  Vector r;
  r.x = a.x + b.x;
  r.y = a.y + b.y;
  r.z = a.z + b.z;
  return r;
}
