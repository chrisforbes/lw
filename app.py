from bottle import \
    request, response, get, post, view, run, static_file, debug, abort

debug(True)

# a sequence.
class Seq(object):
    def __init__(self, current_value=0):
        self.current_value = current_value

    def next(self):
        self.current_value += 1
        return self.current_value

    def current(self):
        return self.current_value

# the model, stashed in teh memory for now.
# TODO: push it out to a db
class Board(object):
    def __init__(self):
        self.lists = [
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

        self.card_seq = Seq(6)
        self.list_seq = Seq(3)
        self.event_seq = Seq(-1)
        self.events = []

    def add_event(self, etype, data):
        self.events.append( {
          'id': self.event_seq.next(),
          'type': etype,
          'data': data })

    def remove_card(self, card_id):
        for l in self.lists:
            for c in l['cards']:
                if card_id == c['name']:
                    l['cards'].remove(c)
                    return c
        raise ValueError()

def indexof_first(xs, f):
    return ([i for i,x in enumerate(xs) if f(x)] or [-1])[0]

def insert_after(xs, x, after):
    xs.insert(1 + indexof_first(xs,
        lambda a:a['name'] == after), x)

board = Board()

@post('/events')
def get_events():
    since_id = request.json['since']
    return { 'events': [e for e in board.events if e['id'] > since_id] }

@post('/card/new')
def new_card():
    # 1. update the model
    list_id = request.json['list']
    label = request.json['label']
    new_id = 'card-%d' % (board.card_seq.next(),)
    new_card = { 'name': new_id, 'desc': label }
    the_list = [l for l in board.lists if l['name'] == list_id][0]
    after_id = len(the_list['cards']) and the_list['cards'][-1]['name'] or None
    the_list['cards'].append(new_card)

    # 2. notify other listeners
    board.add_event( 'new_card', {
        'list': list_id,
        'after': after_id,
        'name': new_card['name'],
        'desc': new_card['desc'],
        })

@post('/list/new')
def new_list():
    # 1. update the model
    after_id = len(board.lists) and board.lists[-1]['name'] or None
    list_id = 'list-%d' % (board.list_seq.next(),)
    label = request.json['label']
    new_list = { 'name': list_id, 'label': label, 'cards': [] }
    board.lists.append(new_list)

    # 2. notify other listeners
    board.add_event( 'new_list', {
        'after': after_id,
        'name': new_list['name'],
        'label': new_list['label'],
        })

@post('/list/move')
def list_move():
    # 1. update the model
    list_id = request.json['list']
    after_id = request.json['after']

    the_list = [l for l in board.lists if l['name'] == list_id][0]
    board.lists.remove(the_list)

    insert_after(board.lists, the_list, after_id)

    # 2. notify other listeners
    board.add_event( 'list_move', {
        'list': list_id,
        'after': after_id
        })

@post('/card/move')
def card_move():
    # 1. update the model
    list_id = request.json['list']
    card_id = request.json['card']
    after_id = request.json['after']

    card = board.remove_card(card_id)
    the_list = [l for l in board.lists if l['name'] == list_id][0]
    insert_after(the_list['cards'], card, after_id)

    # 2. notify other listeners
    board.add_event( 'card_move', {
        'list': list_id,
        'card': card_id,
        'after': after_id
        })

@get('/')
@view('templates/board.tpl')
def get_page():
    return get_raw_model()

@get('/raw')
def get_raw_model():
    return {
      'lists': board.lists,
      'last_event_id': board.event_seq.current()
    }

@get('/static/<path:path>')
def get_static(path):
    return static_file(path, root='static')

run(reloader=True, host='0.0.0.0')
