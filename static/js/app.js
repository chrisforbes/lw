$(function(){
    /* set up dragging of lists */
    $('#main').sortable({
        tolerance:'pointer',
        placeholder:'list-placeholder',
        forcePlaceholderSize: true
        });

    $('#main').bind( 'sortupdate', function(ev,ui) {
        var update = {
            'list': ui.item.attr('id'),
            'after': ui.item.prev().attr('id') || null,
        };
        $.ajax( '/list/move', {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(update) });
        });

    /* set up dragging of cards around */
    $('div.list-body').sortable({
        tolerance:'pointer',
        placeholder:'card-placeholder',
        forcePlaceholderSize: true,
        connectWith: 'div.list-body'
        }).disableSelection();

    $('div.list-body').bind( 'sortupdate', function(ev,ui) {
        var update = {
            'list': $(this).closest('div.list').attr('id'),
            'card': ui.item.attr('id'),
            'after': ui.item.prev().attr('id') || null,
        };

        $.ajax( '/card/move', {
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(update) });

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
            success: function(data) {
                /* insert the card */
                var newCard = $('<div class=card id=' + data.name + 
                    '>' + data.desc + '</div>');
                list.find('div.list-body').append(newCard);
            }});
        });
});
