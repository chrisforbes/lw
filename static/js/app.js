$(function(){

    /* set up dragging of lists */
    $('#main').sortable({
        tolerance:'pointer',
        placeholder:'list-placeholder',
        forcePlaceholderSize: true,
        });

    $('#main').bind( 'sortupdate', function(ev,ui) {
        var update = {
            'list': ui.item.attr('id'),
            'after': ui.item.prev().attr('id') || null,
        };
        $.ajax( '/list/move', {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(update),
            success: function(data) { poll_event(true); }
            });
        });

    /* set up dragging of cards around */
    $('div.list-body').sortable({
        tolerance:'pointer',
        placeholder:'card-placeholder',
        forcePlaceholderSize: true,
        connectWith: 'div.list-body',
        }).disableSelection();

    $('div.list-body').bind( 'sortupdate', function(ev,ui) {
        if (ui.item.closest('div.list').attr('id') != $(this).closest('div.list').attr('id')) {
            ev.stopPropagation();
            return;
        }

        var update = {
            'list': ui.item.closest('div.list').attr('id'),
            'card': ui.item.attr('id'),
            'after': ui.item.prev().attr('id') || null,
        };

        $.ajax( '/card/move', {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(update),
            success: function(data) { poll_event(true); }
            });

        ev.stopPropagation();   /* if we let this continue to bubble, #main's handler
                                    gets involved too; we don't want that. */
        });

    /* set up add machinery */
    $('div.list-footer').bind( 'click', function(ev,ui) {
        $(this).prev('div.add-machinery').show().find('textarea').focus();
        });

    /* break the normal form handling */
    $('div.add-machinery form').submit(function() { return false; });

    $('div.add-machinery :reset').bind( 'click', function(ev,ui) {
        $(this).closest('div.add-machinery').hide();
        });

    $('div.add-machinery :submit').bind( 'click', function(ev,ui) {
        var form = $(this).closest('div.add-machinery');
        var list = $(this).closest('div.list');

        var update = { 
            'list': list.attr('id'),
            'label': form.find('textarea').val()
        };

        form.find('textarea').val('');
        form.hide();

        $.ajax( '/card/new', {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(update),
            success: function(data) { poll_event(true); },
            });
        });

    var handle_event = function(ev) {
        if (last_event_id >= ev.id) return;
        last_event_id = ev.id;

        switch( ev.type ) {
        case 'new_card':
            {
                var el = $('<div class=card type=display:none id=' + ev.data.name + 
                    '>' + ev.data.desc + '</div>');

                if (ev.data.after) el.insertAfter('#'+ev.data.after).fadeIn();
                else el.prependTo($('div.list#' + ev.data.list + ' div.list-body')).fadeIn();
            }
            break;
        case 'card_move':
            {
                var el = $('#'+ev.data.card).detach();
                if (ev.data.after) el.insertAfter('#'+ev.data.after);
                else el.prependTo('#'+ev.data.list+' div.list-body');
            }
            break;
        case 'list_move':
            {
                var el = $('#'+ev.data.list).detach();
                if (ev.data.after) el.insertAfter('#'+ev.data.after);
                else el.prependTo('#main');
            }
            break;
        }
    };

    var poll_event;
    poll_event = function(oneshot) {
        $.ajax('/events', {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify( { 'since': last_event_id } ),
            success: function(data) {
                for (i in data.events) {
                    handle_event( data.events[i] );
                }
                /* get things again in 10s */
                if (!oneshot) {
                    setTimeout( poll_event, 10000 );
                }
            }});
    };
    poll_event();
});
