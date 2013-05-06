/*
 * myprimitive.h
 *
 * Copyright (c) 2012 Yoshi 
 * This software is distributed under the MIT License.(../MIT-LICENSE.txt)
 *
 */

#ifndef _EXAMPLE_H_
#define _EXAMPLE_H_

typedef struct Vector {
   double x, y, z;
} Vector;

extern double dot_product(Vector a, Vector b) ;
extern Vector vector_add(Vector a, Vector b) ;
extern void rotate_arrow(Vector s, Vector e) ;

#endif
