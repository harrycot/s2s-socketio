exports.init_ioserver = () => {
    require('../server').io.of('s2s').on('connection', async (socket) => {
        require('../memory').db.server.socket = socket;
        console.log(`as ioserver got client id ${require('../memory').db.server.socket.client.conn.id}: connected`);

        // check if client ip is present in peers (ALLOWED) else disconnect and do something
        if (require('../memory').config.is_production) {
            const client_ip = require('../utils/socketio').parse_client_ip(require('../memory').db.server.socket);
            const is_client_allowed = this.db.peers.filter(function(peer) { return peer.server.includes(client_ip.v4) }).length == 0 ? false : true;
            if (!is_client_allowed) {
                console.log('CLIENT NOT ALLOWED, DO SOMETHING');
                require('../memory').db.server.socket.disconnect();
            }
        }

        // if it's a self connection
        for (peer of require('../memory').db.peers) {
            if ((require('../memory').db.server.socket.handshake.headers.host).includes(peer.server)){ // !!host check can fail attention
                if (peer.socket.io.engine.id === require('../memory').db.server.socket.client.conn.id) {
                    console.log(`as ioserver got client id ${require('../memory').db.server.socket.client.conn.id}: self connection detected`);
                    const client_ip = require('../utils/socketio').parse_client_ip(require('../memory').db.server.socket);
                    require('../memory').config.network.ip = client_ip; // help to add ip to server config
                    require('../memory').db.server.socket.disconnect();
                }
            }
        }

        require('../memory').db.server.socket.on('data', (serialized_data) => {
            //console.log('\n\nServer Socket');
            //console.log(require('../memory').db.server.socket.server.engine.clients);
            on_data_common(index = false, serialized_data, send_ack = true);
        });

        require('../memory').db.server.socket.on('data ack', (serialized_data) => {
            on_data_common(index = false, serialized_data, send_ack = false);
        });

        require('../memory').db.server.socket.on('disconnect', () => {
            console.log(`as ioserver got client id ${require('../memory').db.server.socket.client.conn.id}: disconnected`);
        });
    });

    // init connections as client for each server in peers
    for (index in require('../memory').db.peers) {
        init_ioclient(index);
    }
}

const init_ioclient = (index) => {
    const { serialize_s2s } = require('../utils/network');
    require('../memory').db.peers[index].socket = require('socket.io-client')('http://' + require('../memory').db.peers[index].server + '/s2s');
    
    require('../memory').db.peers[index].socket.on('connect', async function () {
        console.log(`as ioclient id ${require('../memory').db.peers[index].socket.io.engine.id}: connected`);
        require('../memory').db.peers[index].socket.emit('data', await serialize_s2s()); // handshake init - handshake init - handshake init - handshake init
    });

    //acting as an index helper
    require('../memory').db.peers[index].socket.on('indexing handshake multicast', function (serialized_data) {
        on_data_common(index, serialized_data, send_ack = false);
    });

    require('../memory').db.peers[index].socket.on('disconnect', function () {
        console.log(`as ioclient id ${require('../memory').db.peers[index].socket.io.engine.id}: disconnected`);
    });
}

const on_data_common = async (index, serialized_data, send_ack) => {
    // index value: false on 'data' handled by server socket
    const { serialize_s2s, deserialize_s2s } = require('../utils/network');

    const _deserialized_s2s = await deserialize_s2s(serialized_data);

    if (!Object.keys(_deserialized_s2s.err).length) {
        if ( (!deserialize_s2s.data && !send_ack) || _deserialized_s2s.data ) { // if it's everything else handshake init
            // ADD UPDATE PEER to array
            // an index is necessary to know which uuid become with wich host
            require('../memory').db.set.peer(index, _deserialized_s2s);
        }

        if (!_deserialized_s2s.data){ // handshake


            // find a way to remove old peer if a node reboot

            
            if (send_ack) {
                // 'data' (as handshake init)
                console.log(`\n  => HANDSHAKE as server:${require('../memory').db.server.uuid} got from client:${_deserialized_s2s.uuid}\n`);
                require('../memory').db.server.socket.emit('indexing handshake multicast', await serialize_s2s()); // index helper
            } else {
                // 'indexing' (part of the handshake) require('../memory').db.set.peer(index, _deserialized_s2s)
                console.log(`\n  => INDEXING HANDSHAKE MULTICAST uuid:${_deserialized_s2s.uuid}\n`);
            }
        } else { // data
            if (send_ack) {
                // 'data'
                console.log(`\n  => DATA as server:${require('../memory').db.server.uuid} got from client:${_deserialized_s2s.uuid} : ${_deserialized_s2s.data}`);
                const _index = require('../memory').db.get.peer.index(_deserialized_s2s.uuid)
                //const _ecdh = require('../memory').db.peers[_index].ecdh;
                const _openpgp = require('../memory').db.peers[_index].openpgp;
                require('../memory').db.peers[_index].socket.emit('data ack', await serialize_s2s(_deserialized_s2s.data, _openpgp));

            } else {
                // 'data ack'
                console.log(`\n  => DATA ACK as server:${require('../memory').db.server.uuid} got from client:${_deserialized_s2s.uuid} : ${_deserialized_s2s.data}`);
            }
        }
    } else {
        // 
        console.log(_deserialized_s2s.err);
        console.log('WARNING do something..');
    }
}
