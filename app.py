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

next_id = 7

next_event_id = 0
events = []

def indexof_first(xs, f):
    return ([i for i,x in enumerate(xs) if f(x)] or [-1])[0]

def insert_after(xs, x, after):
    xs.insert(1 + indexof_first(xs,
        lambda a:a['name'] == after), x)

def remove_card(card_id):
    for l in lists:
        for c in l['cards']:
            if card_id == c['name']:
                l['cards'].remove(c)
                return c
    raise ValueError()

def add_event(etype, data):
    global events, next_event_id
    events.append( {
      'id': next_event_id,
      'type': etype,
      'data': data })
    next_event_id += 1

@post('/events')
def get_events():
    global events
    since_id = request.json['since']
    return { 'events': [e for e in events if e['id'] > since_id] }

@post('/card/new')
def new_card():
    global next_id

    # 1. update the model
    list_id = request.json['list']
    label = request.json['label']
    new_id = 'card-%d' % (next_id,)
    next_id += 1
    new_card = { 'name': new_id, 'desc': label }
    the_list = [l for l in lists if l['name'] == list_id][0]
    the_list['cards'].append(new_card)

    # 2. notify other listeners TODO
    add_event( 'new_card', {
        'list': list_id,
        'after': 'foo',
        'name': new_card['name'],
        'desc': new_card['desc'],
        })

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
    # 1. update the model
    list_id = request.json['list']
    card_id = request.json['card']
    after_id = request.json['after']

    card = remove_card(card_id)
    the_list = [l for l in lists if l['name'] == list_id][0]
    insert_after(the_list['cards'], card, after_id)

    # 2. notify other listeners TODO
    return {}

@get('/')
@view('templates/board.tpl')
def get_page():
    return { 'lists': lists }

@get('/raw')
def get_raw_model():
    return { 'lists': lists }

@get('/static/<path:path>')
def get_static(path):
    return static_file(path, root='static')

run(reloader=True, host='0.0.0.0')
