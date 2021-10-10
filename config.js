const twitch = window.Twitch.ext;
const radioEnums = new Set(['public', 'broadcaster']);

var toggleState = ""; //global alt to hidden field
var token = "";

twitch.onAuthorized(function(auth) {
    token = auth.token;
});

twitch.configuration.onChanged(function() {
    console.log("extension config begins");
    const config = unmarshalConfig();
    const shaped = resetToggle(config);
    refillTextbox(shaped);
    attachUpdater(shaped);
    attachAuthorizer();
});

function attachUpdater(config) {
    // wait for EBS textbox change events
    // and save via the cfg svc 
    const txt = document.getElementById('ebs-base');
    txt.addEventListener("change", (event) =>{
        if (!validateBase(event.target.value)) {
            console.log("bad EBS format, skipping update");
            return;
        }
        updateConfig({ebs: event.target.value, toggle: toggleState});
    });
}

function attachAuthorizer() {
    console.log("attaching auth event handler");

    const start = document.getElementById('authorize');
    start.addEventListener("click", (event) => {
        const txt = document.getElementById('ebs-base');
        const uri = txt.value + "/api/pavlok/auth";
        if (!validateBase(txt.value)) {
            txt.classList.add("is-danger");
            txt.focus();
            return;
        }
        fetch(uri , {
              method: 'get', 
              headers: new Headers({
                'Authorization': 'Bearer ' + token,
              })
        })
        .then(response => response.json())
        .then(data => window.open(data.Location, "AuthOnBehalf"));
    });
}

function refillTextbox(config) {
    const txt = document.getElementById('ebs-base');
    txt.value = config.ebs;
}

function resetToggle(config) {
    const tog = config.toggle;

    if (radioEnums.has(tog)) {
        console.log("Toggle is supported: " + tog);
        addToggleState(tog);
        return {ebs: config.ebs, toggle: tog};
    } else {
        console.log("Toggle is not valid, resetting.");
        addToggleState("broadcaster");
        const opt = {ebs: config.ebs, toggle: "broadcaster"};
        updateConfig(opt);
        return opt;
    }
}
function addToggleState(state) {
    console.log("add DOM tree node to store toggle state ");
    toggleState = state;

    const tog = document.createElement("input");
    tog.setAttribute("id", "accesstoggle");
    tog.setAttribute("type", "hidden");
    tog.classList.add("is-hidden");
    tog.value = state;
    document.body.appendChild(tog);
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





