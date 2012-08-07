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

def indexof_first(xs, f):
    for (i,x) in enumerate(xs):
        if f(x):
            return i
    return -1

def insert_after(xs, x, after):
    lists.insert(1 + indexof_first(xs,
        lambda a:a['name'] == after), x)

def remove_card(card_id):
    pass

@post('/list/move')
def list_move():
    # 1. update the model
    list_id = request.json['list']
    after_id = request.json['after']

    the_list = [l for l in lists if l['name'] == list_id][0]
    lists.remove(the_list)

    insert_after(lists, the_list, after_id)

    # 2. notify other listeners TODO
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
