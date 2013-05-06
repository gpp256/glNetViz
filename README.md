glNetViz
========

Welcome!
----------

The glNetViz is a free tool for visualizing computer network topologies with WebGL.

With the abilities of real time visualizing network traffics flowing around the local network and to/from the Internet, you can manage and supervise the various network more easily and efficiently.

Quick Start
------------

To install, run the following commands in the glNetViz directory.

.. code-block:: bash

    e.g.
    $ git clone https://github.com/gpp256/glNetViz.git
    $ cd glNetVis
    $ ./configure --prefix=/opt/glNetViz
    $ make
    $ sudo make install
    $ sudo chown -R www:www /opt/glNetViz
    $ sudo cp /usr/local/etc/apache/httpd.conf{,.backup130506}
    $ sudo vi /usr/local/etc/apache/httpd.conf
    $ sudo diff /usr/local/etc/apache/httpd.conf{.backup130506,}
    315a316,323
    >     Alias /glNetViz/ /opt/glNetViz/
    >     <Directory "/opt/glNetViz">
    >         AllowOverride All
    >         Options ExecCGI
    >         Order allow,deny
    >         Allow from all
    >     </Directory>
    $ sudo /usr/local/etc/rc.d/apache restart
    $ sudo vi /opt/glNetViz/.htaccess

Some perl modules are needed for starting the glNetViz. 

To install some components, run the following commands.

.. code-block:: bash

    e.g.
    Debian GNU/Linux:
    $ sudo apt-get install perl-modules
    $ sudo apt-get install libyaml-perl

You can access glNetViz sample pages with a web browser that supported WebGL.

.. code-block:: bash

    e.g.
    http://youripaddress/glNetViz/examples/

glNetViz Components
----------------------------

.. csv-table:: table #2: outline of the files that will be installed
   :widths: 30, 70
 
   Location , Description 
   docs/* , users manual
   examples/* , sample scripts and HTML files
   "lib/{js,css,cgi}/*", "common libraries and dependent libraries (`jQuery <http://jquery.com/>`_ , `jQuery UI <http://jqueryui.com/>`_ , `jquery-sprintf <https://github.com/azatoth/jquery-sprintf>`_ , `minMatrix <http://wgld.org/d/library/l001.html>`_ )" 
   lib/textures/* , texture files                         
   lib/conf/* , configuration files
   .htaccess , apache configuration file

Links
--------

:users guide(en): http://gpp256.zapto.org/glNetViz/docs/en/html/index.html
:users guide(ja): http://gpp256.zapto.org/glNetViz/docs/ja/html/index.html
:blog: http://gpp256.blogspot.jp

License
----------
Copyright &copy; 2013 Yoshi(gpp65536@yahoo.co.jp)  
Distributed under the [MIT License][mit].  

[MIT]: http://www.opensource.org/licenses/mit-license.php
