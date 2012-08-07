from bottle import \
    request, response, get, post, view, run, static_file, debug

debug(True)

@post('/list/move')
def list_move():
    return {}

@post('/card/move')
def card_move():
    return {}

@get('/')
@view('templates/board.tpl')
def get_page():
    return {}

@get('/static/<path:path>')
def get_static(path):
    return static_file(path, root='static')

run(reloader=True, host='0.0.0.0')
