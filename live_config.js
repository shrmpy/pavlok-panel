const twitch = window.Twitch.ext;
const radioEnums = new Set(['public', 'broadcaster']);

var ebsbase = ""; // global
var token = "";

twitch.onAuthorized(function(auth) {
    token = auth.token;
});


twitch.configuration.onChanged(function() {
    debugPrint("extension config begins");
    const config = unmarshalConfig();
    ebsbase = config.ebs;
    radioRefresh(config);
        const rdo1 = document.getElementById('public');
        const rdo2 = document.getElementById('broadcaster');
        rdo1.addEventListener("change", radioUpdate);
        rdo2.addEventListener("change", radioUpdate);


            debugPrint("attaching click event handler");
            const zap = document.getElementById('zapper');
            zap.addEventListener("click", (event) => {
                fetch(ebsbase + '/api/pavlok/shock', {
                  method: 'get',
                  headers: new Headers({
                    'Authorization': 'Bearer ' + token,
                  })
                });
            });

});

function radioUpdate(event) {
    if (event.target.checked) {

        debugPrint("save toggle setting: " + event.target.value);
        const opt = {ebs: ebsbase, toggle: event.target.value};
        updateConfig(opt);
    }
}

function radioRefresh(config) {
    debugPrint("apply toggle setting: " + config.toggle);
    const frm = document.forms.togglegrp;
    const rdogroup = frm.elements.toggle;
    rdogroup.value = config.toggle;
}

// log wrapper so we can switch to console.log later
function debugPrint(msg) {
    const p = document.createElement("p");
    p.append(msg);
    document.getElementById('debug-panel').append(p);
}


/**********/


function unmarshalConfig() {
    if (twitch.configuration.broadcaster) {
        console.log("broadcaster segment found");
        try {
            const config = JSON.parse(twitch.configuration.broadcaster.content);
            if (typeof config == 'object') {
                console.log("config format is good");
                return config;
	    }
        } catch (e) {
            console.log('segment is not JSON');
        }
    }

    // reaching this pt, reset fields
    return {ebs: "", toggle: "broadcaster"};
};

function updateConfig(config) {
    const marsh = JSON.stringify(config);
    console.log("marshaling to cfg svc: " + marsh);
    twitch.configuration.set('broadcaster', '1', marsh);
};

function validateBase(url) {
    try {
        new URL(url);
    } catch (e) {
        return false;
    }
    return true;
};




