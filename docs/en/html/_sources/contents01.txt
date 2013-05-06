#############################
Quick Start
#############################
 
.. Prerequisites for building
.. ---------------------------
.. a and b is needed for building the glNetViz. 

.. index:: 
   pair: Git; git clone 
.. index:: Autotools
.. index:: 
   pair: Apache; httpd.conf
.. index:: 
   pair: Apacht; .htaccess

Building and Installing
---------------------------

To install, run the following commands in the glNetViz directory.

.. The steps for building this tools are as follows.

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

..  check and edit the apache configuration file(/opt/glNetViz/.htaccess). 

.. index:: 
   pair: Perl; CGI.pm
.. index:: 
   pair: Perl; "JSON::PP.pm"
.. index:: 
   pair: Perl; "YAML.pm"
.. index:: 
   pair: Perl; "ExtUtils::MakeMaker"

Other Dependent Components
----------------------------

Some perl modules are needed for starting the glNetViz. 

.. csv-table:: table #01: other dependent components
   :widths: 10, 60, 30

   Component, URL, License
   CGI, http://search.cpan.org/~markstos/CGI.pm-3.63/lib/CGI.pm,  Artistic License 2.0
   JSON::PP, http://search.cpan.org/~makamaka/JSON-PP-2.27202/lib/JSON/PP.pm, Artistic License 2.0
   YAML, http://search.cpan.org/~mstrout/YAML-0.84/lib/YAML.pm, Artistic License 2.0
   ExtUtils::MakeMaker, http://search.cpan.org/~bingos/ExtUtils-MakeMaker-6.66/lib/ExtUtils/MakeMaker.pm, Artistic License 2.0

|

To install some components, run the following commands.

.. index:: 
   pair: Perl; YAML.pm

.. code-block:: bash

    e.g.
    Debian GNU/Linux:
    $ sudo apt-get install perl-modules
    $ sudo apt-get install libyaml-perl


You can access glNetViz sample pages with a web browser that supported WebGL.

.. code-block:: bash

    e.g.
    http://youripaddress/glNetViz/examples/


.. index:: 
   pair: jQuery; jQuery UI
.. index:: 
   pair: jQuery; jquery-sprintf
.. index:: minMatrix

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

|
