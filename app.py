from bottle import \
    request, response, get, post, view, run, static_file, debug, abort

debug(True)

# the model, stashed in teh memory for now.
# TODO: push it out to a db
lists = [
    { 'name':'list-1',
      'label':'Backlog',
      'cards': [
        { 'name':'card-1', 'desc':'Do a thing' },
        { 'name':'card-2', 'desc':'Do another thing, with a longer description' },
      ]
    },
    { 'name':'list-2',
      'label':'In Progress',
      'cards': [
        { 'name':'card-3', 'desc':'A thing which is initially in progress.' },
        { 'name':'card-4', 'desc':'Another thing we\'re halfway through building.' },
      ]
    },
    { 'name':'list-3',
      'label':'Done',
      'cards': [
        { 'name':'card-5', 'desc':'Acquire beer.' },
        { 'name':'card-6', 'desc':'Put beer in fridge.' },
      ]
    },
]

@post('/list/move')
def list_move():
    return {}

@post('/card/move')
def card_move():
    return {}

@get('/')
@view('templates/board.tpl')
def get_page():
    return { 'lists': lists }

@get('/static/<path:path>')
def get_static(path):
    return static_file(path, root='static')

run(reloader=True, host='0.0.0.0')
