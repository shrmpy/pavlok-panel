const twitch = window.Twitch.ext;
const radioEnums = new Set(['public', 'broadcaster']);

var ebsbase = "";
var token = "";

twitch.onAuthorized(function(auth) {
    token = auth.token; 
});

twitch.configuration.onChanged(function() {
    console.log("DEBUG extension config begins");
    const config = unmarshalConfig();
    ebsbase = config.ebs;
            refreshButton(config);

});

function refreshButton(config) {
    const zap = document.getElementById('zapper');

    if (config.toggle == "broadcaster") {
        console.log("DEBUG disable zapper ");
        zap.disabled = true;
        return;
    }

    console.log("DEBUG enable public zapper ");
    zap.disabled = false;
    console.log("DEBUG attaching zapper event handler");
    zap.addEventListener("click", (event) => {
            fetch(ebsbase + '/api/pavlok/shock', {
                  method: 'get', 
                  headers: new Headers({
                            'Authorization': 'Bearer ' + token,
                  })
            });
        });

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

