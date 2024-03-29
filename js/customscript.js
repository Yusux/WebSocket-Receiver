// force http
if (window.location.protocol == 'https:' && window.location.hostname != 'localhost') {
    window.location.href = window.location.href.replace('https', 'http');
}

// theme changer
theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
function themeChange() {
    theme = theme == 'dark' ? 'light' : 'dark';
    if (theme == 'dark') {
        $("body").removeClass("text-bg-light");
        $("body").addClass("text-bg-dark");
        $("a").css("color", "#fff");
        $(".modal-content").removeClass("text-bg-light");
        $(".modal-content").addClass("text-bg-dark");
        $(".btn-close").addClass("btn-close-white");
        $("#modetext").html("&#xe60f;");
    } else {
        $("body").removeClass("text-bg-dark");
        $("body").addClass("text-bg-light");
        $(".modal-content").removeClass("text-bg-dark");
        $(".modal-content").addClass("text-bg-light");
        $("a").css("color", "#000");
        $(".btn-close").removeClass("btn-close-white");
        $("#modetext").html("&#xe6c0;");
    }
}
themeChange();

// hover effect for links
$("a").hover(
    function () {
        $(this).css("color", "#F0C9CF");
    },
    function () {
        if (theme == 'dark') {
            $(this).css("color", "#fff");
        } else {
            $(this).css("color", "#000");
        }
    }
);


// alert message
const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.innerHTML = '';
    alertPlaceholder.append(wrapper)
}

function createWebSocket() {
    // check if the WebSocket is supported
    if (!window.WebSocket) {
        appendAlert('WebSocket is not supported', 'danger');
        return;
    }

    // connect to the server according to the input
    var protocol = document.getElementById("protocol").value;
    var host = document.getElementById("host").value;
    var port = document.getElementById("port").value;
    // check if the input is empty
    if (host == '' || port == '') {
        appendAlert('Please enter the host and port', 'danger');
        return;
    }

    // alert message
    appendAlert('Connecting to ' + protocol + '://' + host + ':' + port, 'info');

    // connect to the server
    connect(protocol, host, port);
}

// WebSocket client
function writeMessage(message) {
    var received = document.getElementById("received");
    var br = document.createElement("BR");
    var text = document.createTextNode(message);
    // add a line break before the message
    if (received.childNodes.length > 0) {
        received.insertBefore(br, received.firstChild);
    }
    // add the message to the received div
    received.insertBefore(text, received.firstChild);
    // remove the last child if the number of children is greater than 15
    if (received.childNodes.length > 15) {
        received.removeChild(received.lastChild);
    }
}


function connect(protocol, host, port) {
    // check if the WebSocket is supported
    if (!window.WebSocket) {
        appendAlert('WebSocket is not supported', 'danger');
        return;
    }

    // check if it is https
    if (window.location.protocol == 'https:' && protocol == 'ws') {
        appendAlert('Loading the page over HTTPS, only secure WebSocket (wss) is supported', 'danger');
    }

    // create WebSocket connection
    var ws = new WebSocket(protocol + '://' + host + ':' + port);

    // set event handlers
    ws.onopen = function () {
        console.log('Connected to server');
        // alert message
        appendAlert('Connected to server', 'success');
        // wait for 1.5 seconds and remove the alert message and close the modal
        setTimeout(() => {
            alertPlaceholder.innerHTML = '';
            $('#configModal').modal('hide');
        }, 1500);
    };
    ws.onmessage = function (event) {
        console.log('Message from server:', event.data);
        // write the message to the received div
        writeMessage(event.data);
    };
    ws.onclose = function () {
        console.log('Disconnected from server');
        if (!$('#configModal').hasClass('show')) {
            // write the message to the received div
            writeMessage('Disconnected from server');
        }  
    };
    ws.onerror = function (event) {
        console.error('WebSocket error observed:', event);
        // if modal is open
        if ($('#configModal').hasClass('show')) {
            // alert message
            appendAlert('Cannot connect to server', 'danger');
        } else {
            // write the message to the received div
            writeMessage('WebSocket error observed');
        }
    };
}
