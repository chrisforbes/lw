$(function(){

    var post_event = function(uri, data) {
        $.ajax(uri, {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(data) { poll_event(true); }
        });
    };

    /* set up dragging of lists */
    $('#main').sortable({
        tolerance:'pointer',
        placeholder:'list-placeholder',
        forcePlaceholderSize: true
    });

    $(document).on('sortupdate','#main', function(ev,ui) {
        ev.stopPropagation();
        post_event( '/list/move', {
            'list': ui.item.attr('id'),
            'after': ui.item.prev().attr('id') || null
        });
    });

    var setup_list = function(el) {
        el.sortable({
            tolerance:'pointer',
            placeholder:'card-placeholder',
            forcePlaceholderSize: true,
            connectWith: '#main div.list-body'
        }).disableSelection();
    };

    /* set up dragging of cards around */

    $(document).on('sortupdate','div.list-body', function(ev,ui) {
        ev.stopPropagation();

        if (ui.item.closest('div.list').attr('id') != $(this).closest('div.list').attr('id')) {
            return;
        }

        post_event( '/card/move', {
            'list': ui.item.closest('div.list').attr('id'),
            'card': ui.item.attr('id'),
            'after': ui.item.prev().attr('id') || null
        });
    });

    /* set up add machinery */
    $(document).on('click', 'div.list-footer', function(ev,ui) {
        $(this).prev('div.add-machinery').show()
            .find('textarea').focus();
    });

    $(document).on('submit', 'div.add-machinery', function() { return false; });

    $(document).on('click', 'div.add-machinery :reset', function(ev,ui) {
        $(this).closest('div.add-machinery').hide();
    });

    $(document).on('click', 'div.add-machinery :submit', function(ev,ui) {
        var form = $(this).closest('div.add-machinery');
        var list = $(this).closest('div.list');

        post_event('/card/new', {
            'list': list.attr('id'),
            'label': form.find('textarea').val()
        });

        form.find('textarea').val('');
        form.hide();
    });

    /* set up card editing machinery */
    $(document).on('click', 'div.card', function(ev,ui) {
        alert('Editing card ' + $(this).html());
    });

    $.getJSON('/raw', function(data) {
        last_event_id = data.last_event_id;

        for( var li in data.lists ) {
            var l = data.lists[li];
            var list_el = $('#templates #list-template').clone();
            list_el.attr('id', l.name);
            list_el.find('.list-header').html(l.label);

            list_el.appendTo($('#main'));
            var list_body = list_el.find('.list-body');

            for( var ci in l.cards ) {
                var c = l.cards[ci];
                var card_el = $('#templates #card-template').clone();
                card_el.attr('id', c.name);
                card_el.html(c.desc);
                card_el.appendTo(list_body);
            }

            setup_list(list_body);
        }

        poll_event();
    });

    var event_handlers = {};
    var handle_event = function(ev) {
        if (last_event_id >= ev.id) return;
        last_event_id = ev.id;

        if (event_handlers[ev.type])
            event_handlers[ev.type](ev);
    };

    var bind_handler = function(evtype, f) {
        event_handlers[evtype] = f;
    };

    bind_handler('new_card', function(ev) {
        var el = $('#templates #card-template').clone();
        el.attr('id', ev.data.name);
        el.html(ev.data.desc);

        if (ev.data.after) el.insertAfter('#'+ev.data.after);
        else el.prependTo($('div.list#' + ev.data.list + ' div.list-body'));
    });

    bind_handler('card_move', function(ev) {
        var el = $('#'+ev.data.card).detach();
        if (ev.data.after) el.insertAfter('#'+ev.data.after);
        else el.prependTo('#'+ev.data.list+' div.list-body');
    });

    bind_handler('list_move', function(ev) {
        var el = $('#'+ev.data.list).detach();
        if (ev.data.after) el.insertAfter('#'+ev.data.after);
        else el.prependTo('#main');
    });

    var poll_event;
    poll_event = function(oneshot) {
        $.ajax('/events', {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( { 'since': last_event_id } ),
            success: function(data) {
                for (var i in data.events) {
                    handle_event( data.events[i] );
                }
                /* get things again in 10s */
                if (!oneshot) {
                    setTimeout( poll_event, 10000 );
                }
            }});
    };
});
