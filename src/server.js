const path = require('node:path');
const fs = require('node:fs');

exports.is_production = process.pkg ? true : process.env.NODE_ENV == 'production' ? true : false;
//const cwd = this.is_production ? process.cwd() : __dirname;


//used to display pkg snapshot content
// require('../../scripts/walk').walk(path.join(__dirname, '../../../'), function(err, results) {
//     if (err) throw err;
//     console.log(results);
// });


_path_css = path.join(__dirname, 'web/css/styles.bundle.css');
_path_js_header = path.join(__dirname, 'web/js/header.bundle.js');
_path_js_body = path.join(__dirname, 'web/js/body.bundle.js');
_path_html = path.join(__dirname, 'web/index.html');
exports.http = require('node:http').createServer( (req, res) => {
    console.log(req.url);
    const _files = [
        { req: '/styles.css', path: _path_css, type: 'text/css' },
        { req: '/header.js', path: _path_js_header, type: 'text/javascript' },
        { req: '/body.js', path: _path_js_body, type: 'text/javascript' },
    ];
    for (file of _files) {
        if (req.url == file.req) {
            fs.readFile(file.path, (err, data) => {
                if (err) { console.log(err) }
                res.writeHead(200, require('./utils/network').get_http_headers(file.type)); res.write(data); res.end();
            }); return;
        }
    }
    fs.readFile(_path_html, (err, data) => {
        if (err) { console.log(err) }
        res.writeHead(200, require('./utils/network').get_http_headers('text/html')); res.write(data); res.end();
    });
});



exports.io = require('socket.io')(this.http, { // https://socket.io/docs/v4/server-options/
    transporst: ["websocket"], // ["polling", "websocket", "webtransport"] default value
    allowUpgrades: true, // true default value
    upgradeTimeout: 10000, // 10000ms default value
    maxHttpBufferSize: 1e6, // 1MB default value, (1e8 in case (100MB)) a single char(string) is 2 bytes
    pingInterval: 25000, // 25000ms default value
    pingTimeout: 20000, // 20000ms default value
    cookie: {
        name: require('./utils/crypto').misc.generate.seed_int(100,4096),
        path: "/", httpOnly: true, sameSite: "strict", secure: false
    }
});



if (!this.is_production) {
    require('./db/memory').db.peers = [
        { server: '127.0.0.1', port: '8001' }
    ];
} else {
    require('./db/memory').db.peers = [
        { server: '127.0.0.1', port: '8001' } // here PRODUCTION servers
    ];
}
require('./db/memory').db.default_peers = [...require('./db/memory').db.peers];



require('./utils/network').get_port_to_use( async (port) => {
    require('./db/memory').config.network.port = port;

    if (!require('./db/memory').db.server.uuid) {
        require('./db/memory').db.server.uuid = require('uuid').v5('s2s', require('uuid').v4());
        console.log(`\n  => Server init with uuid: ${require('./db/memory').db.server.uuid}\n`);
    }
    if (!require('./db/memory').db.server.openpgp) {
        require('./db/memory').db.server.openpgp = await require('./common/crypto').openpgp.generate(
            require('./db/memory').db.server.uuid,
            `${require('./db/memory').db.server.uuid}@localhost.local`
        );
    }

    require('./controllers/socketio.s2s').init();
    require('./controllers/socketio').init();
    require('./controllers/cron').init();
    require('./db/blockchain').init(port);


    // stdin as test
    process.stdin.setEncoding('utf8');
    process.stdin.on("data", async (data) => {
        data = data.toString();
        const _block = require('./db/blockchain').new_block(data);
        const _data = { blockchain: 'new_block', block: _block }
        console.log(`\n\nSENDING New block: ${_block.block}`);

        //console.log(require('./db/memory').db);

        for (let index = 0; index < require('./db/memory').db.peers.length; index++) {
            if (require('./db/memory').db.peers[index].socket.connected) {
                require('./db/memory').db.peers[index].socket.emit('data', await require('./common/network').serialize(
                    require('./db/memory').db.server.uuid, require('./db/memory').db.server.openpgp, _data, require('./db/memory').db.peers[index].pub
                ));
            }
        }
    })

    
    this.http.listen({ port: port }, () => {
        console.log(`  server listening on port: ${port}\n`);
    });
});

// ======##*****+****+***+**#****#***+*#***+++++++++%%%#--+#%%%%%%#.:#%%+.=#=:=%%%#**%%#*#=.#%#%##%%#%%
// +=+==+##*********+*+++####**#******+++++++++++++*%###--+%%%%%%%%#..:##=:-+::#%%%=+##%#=.-%*###*-*%%%
// ====+=*##******+*+++*+*#********++==++++++++++++#%%%#:=%%%%%#+%%%*...-==::::-#%#.+#**-.:####+..#%%%%
// ==+++++##*+***+++*+*=********+=++**########*+++*#%%##%%%##%%%%=+%%#::.::=-:::#*-.=##=.:=*#*..:##+++=
// +=+++++*%#*+***+++*=*+****++++++*#####%%%##########-@%%%#==+#%%%=+%+.:.::==-:=-.:*%-::-#-:.:-+%%%%%+
// +*++++++*%#+**+++++++*+====++++*#*#%%%%%%%%%%#%%####%%%%#==-:-=+#%+++::::::=-::*=*-:::--.::=%%%%%%#-
// +++==+++*#%#+++++*+===========+*####%%###%%%@%%%%###%%%%%+=====-:::+*-::::::=---:::::-+:::=%%%%%%%++
// ==+==+=++%%%#+++=============+**########%%#****######%%%%%*=======+==::::::::+--:::::==::*%%%#*=-*-+
// =+++++=++%@%*================+######%%%#*=---=*##%%%%%%%%%%%*===+==+=+++::::::+-:--:-+::-::.:+%%#-++
// =+*++++*++=================+*####%%@@%%+:..-::-=+****+++===+*#%#+====++++=:::.==:-:-+=+*+=#%%%%*-+++
// +++***====================*####*+%%#*+:..:::-----------====---==+#%%%#*+====-.-=--=+=+#%%%%%%%%==+==
// +++======================+###%*=+*=::::::---:----=--------------====*%%%%%%+-::=-++#%#####+-:----===
// +========================*#%#+===:.::::::::::::---------------=+*+=-===+%%%%+++-:::::----=-===-=++++
// =-=======================#*+====:::::::::::::::-----:---------==---------=++---===---=====+++++++**=
// ==============================-::::::....:..:::::----------------=+*#####*+==---===+***####*#*++****
// =============================:::::..........:::::::--::::-----=+**#%#####%%%%%*#%%%%#####%%%%=-+*+**
// ==========================+-..............:::::::::::::::--==**#####%%%%%#%%%%%%#####%%%%%%%%+=****+
// ==============++=========+-::....:..::::::::.::..:::::::---=+*##########*%@%@@@%%%%%%%%%%@@%%*=+****
// ========================+--#=-:......:..::::::.....:::::--==*########%%##%@@@@@%@@@@@@@@%%%%%#*+#*#*
// =======================+=.+%%=-.......:::::-:::......::--==+*#########%##%@@@@@%%@@@@@@@@@@%%#*=**+=
// =======================+-.*%#*......:..:::::.....:..:::-==+*###########%%%@@@@@%#%@@@@@@@@@%%%#++***
// =======++++=+++===++====..=%%=........::...::..::::.::--=+*#*##########%%%@@@@@%%%%@@@@@@@@@%%%%#*+=
// ======-:::::::-===+++++-..:=-:......::..::::.:::.::::-=++**##############%%@@@@@%%%%%@@@@@@%%%%%%#**
// ======--------===---=+=............::..::....:::::-=++****###########%###%%@@@@@%##%@@@@@@%%%%%###*+
// ==++===:::::::---:---:....::....:::...:.......::-==++**##########%%%%%%###%@@@@@%%#%@@@@@%%%%%%##*++
// +++++=#+----:----:::.....:...:::::..::..:...:.:=====+*#########%%%%%%%%###%@@@@@@%#%@%%%%%%%%%#***+*
// +++++=+++=-==-----........:::-:::....:::::::-----=++*#***####%%%%%%%%%%#*#%@@@@@@%##@%%%%%%%%#**#***
// ++++++++=-====--:....::::::--::::::.:::::==++****#*#####**###%%%@@@@@%%#*#%@@@@@@%##%%%%%%%%*=---=*+
// =++++++++=*#**+-..:::::::.:::::-:::..:::**#%%+=##%@%%@%%**####%@@@@@@@%###%%%%######%%%%%%#=-------=
// +++++++++=+#%#=:::::.....:::..:-::::::::-=#%%%@@%%%%%%%%%#####%%@@@@%%##%%%%#%%%#**##%%%*====-------
// +++++++++=++=:.....:::::::::::::--:::::::--=+++##%%%##**########%%%#####%%%%##*+++*##%*======-------
// +++++++++=:.....:::::::::::::::::::::::::-::::-=-==+*************###*###%%*+==-=+#%%#+======--------
// +++=+++=:..:.::::::::::-:::::-::::::::::---:::---==++******************##*====+#%%%*======----------
// +==+++=...::::::-:::::---::::-:::::::::::::::::-==+++*****+************#*==+%%%%%@+==+===----:------
// +++++=.:-=++=----:::---:-::::::::::::::::::::::=++++++++****************=*%@@%@@%++++++=---:::---=--
// ++++=.=%%%##*+=-:-==+=----::::::::::::::::::::-=+++++***************+**=*%@@@@@#*+=+===---:::::--:--
// :::::#%%%%%%%##**+**+=-----:::::-::::::::::::-=++*+****#***********++=+*#@@@@%*++==+=-:-:::::::::-:-
// ::::=%###%%%%%%%###*++==---:--::::::::::::::-=+++*+*#####*##***++++*+*%%@@@%*=-===-=-:-::-::::::::--
// :::.=%%####%%%%%%%%%#*+------::::::::::::::--==---==---------==-=*%%%%@@@%=-:---=-=+=:::::::::::::-=
// :::.-#%#####%%%%%%%%%#+----=-::::::::::::::----=======----:::-=#@@@%@@@%+-::-:-:-:==::::::::::::::==
// :::--=#%#%%%%%%%%%%#*+---=++-=-:::::::::----=======-----::-=*%@@@@@@@@#-:::::::::-:::::::::::::::--=
// -:::::=#%%%%%%%%%#*==------------:::::::=++==----------=+#*%@%@@@@@@#-:::::::::::::::.:::::::::::--=
// ::::::::=**+****=-------:--::--:::-=+***%%%%#**######%**%@***@@@#+--::::::::::::::::.:::::::::::---=
// ::--::::::-==+-::---:-::-:-::::-++########%%%%%%%%%%%%@#*%@%**=-:-:::::::::::::::::.:::::::.::::--==
// =:..:..::::::::------:-----::::-=***#####+:-*##%%%%%%##*+++-::::::::::::::::::::::.::::::.:::----==-
// ++++-::::-----:-------:::.:::::::--*####*+:.......::::--::::::::::::::::::::::::::..:.:::::::------.
// ++=+=+==+++++=-----:::::..:::.:::::-=*##*+-..:..::::::::::::::::::::::::::::::::....:::::-:-------.:
// +===========++++==----:::::...:::::::-*#*+-..........::::::::::::::::::::.::.:...::.:::::--------:..
// ===========*+=++##*+==--::::::::::::::-##*-.........::::::::.::::::.:::::::::::.::.::::::--------:..
// ==========++++=+*#+=====--::::::::::::::#*+:........:..::::::::::::::::::::::::::.:::::::::----::...
// Pott <3