define([
    'base/js/namespace', 'require', 'base/js/events', 'base/js/dialog'
], function(
    Jupyter, requirejs, events, dialog
) {
    var prefix = 'webcat-jupyter-extension';
    var submitActionName = 'submit-to-webcat';
    var keyboardSequence = 'Ctrl-Alt-U';

    function load_ipython_extension() {
        $('<link/>')
            .attr({
                id: 'collapsible_headings_css',
                rel: 'stylesheet',
                type: 'text/css',
                href: requirejs.toUrl('./main.css')
            })
            .appendTo('head');
        
        var action = {
            span : 'Submit to Web-CAT',
            help    : 'Submit to Web-CAT',
            help_index : 'zz',
            handler : webcat_request
        };
        
        Jupyter.actions.register(action, submitActionName, prefix);
        Jupyter.toolbar.add_buttons_group([{
            'action': prefix+':'+submitActionName,
            'label': 'Submit to Web-CAT'
        }], submitActionName)
        
    }

    function webcat_request(){
        var re = /^\/notebooks(.*?)$/;
        var filepath = window.location.pathname.match(re)[1];
        var cell = Jupyter.notebook.get_cell(0);
        var text = cell.get_text();
        var arr = text.split("#");
        var course = arr[2].split(":")[1].trim();
        var assignment = arr[3].split(":")[1].trim();
        var institute = arr[4].split(":")[1].trim();
        var payload = {
                     'filename': filepath,
                     'course': course,
                     'a': assignment,
                     'd': institute
                   };
        var settings = {
            url : '/webcat/push',
            processData : false,
            type : "PUT",
            dataType: "json",
            data: JSON.stringify(payload),
            contentType: 'application/json',
            success: function(data) {
                var iframe_html = '<iframe src="' +data.redirectLink+'" width = 650 height = 500></iframe>';
                dialog.modal({
                    title: "Web-CAT",
                    body: iframe_html,
                    sanitize: false,
                    buttons: {
                        'Close': {}
                    }
                });
            },
            error: function(data) {
            }
        };
       
        // commit and push
        $.ajax(settings);
    }    
   
    return {
        load_ipython_extension: load_ipython_extension
    };
});