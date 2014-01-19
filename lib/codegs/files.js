

function resolveFilename(request, filename) {

    if (request == core_module) {
        return request;
    }

    var dirname = getDirname(filename);
    var path = join(dirname, request);

    switch (path) {
    case filename:
        ;
    case basename:
        is('.js');
        is('.json');

    case dirname:
        is('package.json');
        is('index.js');
    }

    return '';
}
