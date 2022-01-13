const CLI = require("hachiware_cli");
const routing = require("hachiware_routing");

var routes = {
    release: {
        "/":"main",
        "/page_a": "pageA",
        "/page_b": {
            "/":"pageB/index",
            "/edit/{:id}":"pageB/edit",
            "/other/{:id1}/{:id2?}":"pageB/other",
        },
        "/page_c/{:}":"pageC",
        "/page_d/*":"pageD",
    },
    error:{
        "/":"error1",
        "/page_c":"error2",
    },
};

var cli = new CLI();

cli.in("Pread URL ",function(value, retry){

    var res = routing("client", value, routes);

    console.log(res);
    console.log("");

    retry();
});