$(function(){
    /* set up dragging of lists */
    $('#main').sortable({
        tolerance:'pointer',
        placeholder:'list-placeholder',
        forcePlaceholderSize: true
        }).disableSelection();

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
});
