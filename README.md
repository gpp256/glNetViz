glNetViz
========

The glNetViz is a free tool for visualizing computer network topologies with WebGL.

With the abilities of real time visualizing network traffics flowing around the local network and to/from the Internet, you can manage and supervise the various network more easily and efficiently. The glNetViz is aiming for the convenient tool which can easily visualize the network topologies from the serialized data in YAML or JSON.

Examples
---------
![http://gpp256.zapto.org/glNetViz/examples/sample08_01.png](http://gpp256.zapto.org/glNetViz/examples/sample08_01.png)

* [http://gpp256.zapto.org/glNetViz/examples/](http://gpp256.zapto.org/glNetViz/examples/)

Quick Start
------------

To install, run the following commands in the glNetViz directory.

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
    $ sudo cat /opt/glNetViz/.htaccess

Some perl modules are needed for starting the glNetViz. 

To install some components, run the following commands.

    e.g.
    Debian GNU/Linux:
    $ sudo apt-get install perl-modules
    $ sudo apt-get install libyaml-perl

You can access glNetViz sample pages with a web browser that supported WebGL.

    e.g.
    http://youripaddress/glNetViz/examples/


Links
--------

users guide(en): http://gpp256.zapto.org/glNetViz/docs/en/html/index.html  
users guide(ja): http://gpp256.zapto.org/glNetViz/docs/ja/html/index.html  
blog: http://gpp256.blogspot.jp  

License
----------
Copyright &copy; 2013 Yoshi(@gpp256)  
Distributed under the [MIT License][mit].  

[MIT]: http://www.opensource.org/licenses/mit-license.php
