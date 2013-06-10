glNetViz
========

The glNetViz is a free tool for visualizing computer network topologies with WebGL.

With the abilities of real time visualizing network traffics flowing around the local network and to/from the Internet, you can manage and supervise the various network more easily and efficiently. The glNetViz is aiming for the convenient tool which can easily visualize the network topologies from the serialized data in YAML or JSON.

Examples
---------
![http://gpp256.zapto.org/glNetViz/examples/sample08_01.png](http://gpp256.zapto.org/glNetViz/examples/sample08_01.png)

Take a look at the demo:

* [http://gpp256.zapto.org/glNetViz/examples/](http://gpp256.zapto.org/glNetViz/examples/)

Quick Start
------------

To install, run the following commands in the glNetViz directory.

    e.g.  
    Debian GNU/Linux:
    $ sudo apt-get install apache2
    $ git clone https://github.com/gpp256/glNetViz.git
    $ cd glNetViz/
    $ ./configure --prefix=/opt/glNetViz
    $ make 
    $ sudo make install
    $ sudo chown -R www-data:www-data /opt/glNetViz
    $ sudo cp /etc/apache2/ports.conf{,.backup130506}
    $ sudo vi /etc/apache2/ports.conf
    $ sudo diff /etc/apache2/ports.conf{.backup130506,}
    9c9
    < Listen 80
    ---
    > Listen 0.0.0.0:80
    $ sudo cp /etc/apache2/sites-enabled/000-default{,.backup130506}
    $ sudo vi /etc/apache2/sites-enabled/000-default
    $ sudo diff /etc/apache2/sites-enabled/000-default{.backup130506,}
    0a1
    > AddHandler cgi-script .cgi
    40a41,48
    >     Alias /glNetViz/ /opt/glNetViz/
    >     <Directory "/opt/glNetViz">
    >         AllowOverride All
    >         Options ExecCGI
    >         Order allow,deny
    >         Allow from all
    >     </Directory>
    $ sudo /etc/init.d/apache2 restart

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
