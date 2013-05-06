###########################
glNetViz Library Reference
###########################

This page is under construction.

1. :ref:`JavaScript<glnetviz-javascript>` 
2. :ref:`Perl<glnetviz-perl>` 
3. :ref:`Python<glnetviz-python>` 
4. :ref:`Ruby<glnetviz-ruby>` 
5. :ref:`C<glnetviz-c>` 
6. :ref:`Configuration Files<glnetviz-config>` 

|

.. #. access the HTML page with browser that supported WebGL.

.. _glnetviz-javascript: 

JavaScript
--------------------------

.. index:: 
   pair: glNetViz; generateSphereObjects()

**glNetViz.generateSphereObjects()**
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Generate sphere objects.  The parameters of sphere objects are stored in a sphader program object.

Specification: 

.. code-block:: javascript

   glNetViz.generateSphereObjects(program);
   // ==============================================
   // parameters: 
   //         program: shader programs (object)
   //
   // returned values  : No value is returned.
   //
   // errors/exceptions: No error is returned. 
   //
   // changelog: 
   // ==============================================

Usage example:

.. code-block:: javascript

   // create shader programs
   var prg = glNetViz.createProgram(v_shader, f_shader);
   // create spheres
   glNetViz.generateSphereObjects(prg);
   (...snip...)
   glNetViz.putSphere(
   	prg.spheres["red"]["v"], prg.spheres["red"]["n"], 
   	prg.spheres["red"]["c"], prg.spheres["red"]["i"], 
   	attLocation, [ 3, 3, 4 ]
   );

See Also: 

* glNetViz.createProgram()
* glNetViz.putSphere()

|

.. index:: 
   pair: glNetViz; createProgram()

**glNetViz.createProgram()**
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Description: 

|

.. index:: 
   pair: glNetViz; putSphere()

**glNetViz.putSphere()**
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Description: 

|



.. _glnetviz-perl: 

Perl
--------------------------

.. _glnetviz-python: 

Python
--------------------------

.. _glnetviz-ruby: 


Ruby
--------------------------
.. _glnetviz-c: 

C
--------------------------

|

.. _glnetviz-config: 

Configuration Files 
--------------------------

The steps for generating WebGL Pages are as follows.

1. create the YAML format data.

.. code-block:: bash
  :linenos:

  e.g. 
  sample03 configuration file:
  ---
  controller_list:
    - ipaddr: 192.168.1.4
      name: Controller01
      origin:
        - 0
        - 0
        - 0
      posidx: 0
      rad: 0
  switch_list:
    0x000000000001:
      name: SW01
      posidx: 199
      rad: 5
    0x000000000002:
      name: SW02
      posidx: 259
      rad: 5
    0x000000000003:
      name: SW03
      posidx: 498
      rad: 5
   (...snip...)

2. refer to the YAML format data from HTML(JavaScript).

..   host_list:
..     00:0c:29:03:17:33:
..       name: Host01
..       posidx: 553
..       rad: 5
..     00:0c:29:1f:8e:8a:
..       name: Host02
..       posidx: 28
..       rad: 5
..   other_link:
..     - color: gray
..       dobj: FW01
..       name: FW_LINK01
..       offset:
..         - 0.0
..         - 0.0
..         - 0.0
..       sobj: 0x000000000003
..     - color: gray
..       dobj: FW01
..       name: FW_LINK02
..       offset:
..         - 0.2
..         - 0.2
..         - 0.2
..       sobj: 0x000000000003
..   other_obj:
..     - name: FW01
..       neighbor_obj: 0x000000000003
..       objtype: cube
..       posidx: 489
..       rad: 5
..       scale:
..         - 1.2
..         - 1.6
..         - 1.2
..       texture_id: 3


|

