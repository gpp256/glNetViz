
FreeBSD: ports
--------------

To create package, run following commands.

    e.g.
    # cd glNetViz/
    # ./configure --prefix=/opt/glNetViz
    # mkdir -p /usr/ports/www/glnetviz
    # cp mkpkgs/freebsd/* /usr/ports/www/glnetviz/
    # cd /usr/ports/www/glnetviz
    # make makesum
    # make package

Linux: rpm
----------

To create package, run following commands.

    e.g.
    $ cd glNetViz/
    $ ./configure --prefix=/opt/glNetViz
    $ cd mkpkgs/linux-rpm
    $ make

Linux: dpkg
-----------

To create package, run following commands.

    e.g.
    $ cd glNetViz/
    $ ./configure --prefix=/opt/glNetViz
    $ cd mkpkgs/linux-dpkg
    $ make

