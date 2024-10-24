const crypto = require('crypto');

const CONST_ALGORITHM = 'aes-256-cbc';
const CONST_ALGORITHM_LENGTH = 32; // 256 bits == 32 bytes/characters (32*8) 
const CONST_IV_LENGTH = 16; // IV => For AES, the size is always 16 (buffer) || 32 (hex) || 128 bits (16*8)
const CONST_HASH = 'SHA256';
const CONST_ECDSA_ALGORITHM = 'sect239k1';
const CONST_ECDH_ALGORITHM = 'secp521r1';

exports.uuid = {
    generate: () => {
        return crypto.randomUUID();
    },
    validate: (uuid) => {
        const regex = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
        return regex.test(uuid);
    },
    get: () => {
        return require('../memory').db.server.uuid;
    }
}

exports.ecdh = {
    // store b64
    generate: () => {
        const ecdh = crypto.createECDH(CONST_ECDH_ALGORITHM);
        const pub = ecdh.generateKeys('base64');
        const priv = ecdh.getPrivateKey('base64');
        return { priv: priv, pub: pub }
    },
    encrypt: (data, pub64) => {
        const secret = this.ecdh.secret(pub64);
        return this.cipher(secret, data);
    },
    decrypt: (data, pub64) => {
        const secret = this.ecdh.secret(pub64);
        return this.decipher(secret, data);
    },
    secret: (pub64) => {
        const ecdh = crypto.createECDH(CONST_ECDH_ALGORITHM);
        ecdh.setPrivateKey(this.ecdh.local.get.private(), 'base64');
        return ecdh.computeSecret(pub64, 'base64', 'hex');
    },
    local: {
        get: {
            public: {
                string: () => {
                    return require('../memory').db.server.keys.ecdh.pub;
                }
            },
            private: () => {
                return require('../memory').db.server.keys.ecdh.priv;
            }
        }
    }

}

exports.ecdsa = {
    generate: () => {
        const secret = crypto.randomBytes(256).toString('base64');
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: CONST_ECDSA_ALGORITHM,
            publicKeyEncoding: {
                type: 'spki',
                format: 'der'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'der',
                cipher: CONST_ALGORITHM,
                passphrase: secret
            }
        });
        return { secret: secret, priv: Buffer.from(privateKey).toString('base64'), pub: Buffer.from(publicKey).toString('base64') }
    },
    sign: (data) => {
        const sign = crypto.createSign(CONST_HASH);
        sign.update(data);
        sign.end();
        return sign.sign(this.ecdsa.local.get.private.object());
    },
    verify: (data, pub, signature) => {
        const verify = crypto.createVerify(CONST_HASH);
        verify.update(data);
        verify.end();
        return verify.verify(pub, signature);
    },
    build: {
        public: (pub) => {
            const publicKey = crypto.createPublicKey({
                key: Buffer.from(pub, 'base64'),
                type: 'spki',
                format: 'der'
            });
            return publicKey;
        }
    },
    local: {
        get: {
            private: {
                object: () => {
                    const privateKey = crypto.createPrivateKey({
                        key: Buffer.from(require('../memory').db.server.keys.ecdsa.priv, 'base64'),
                        type: 'pkcs8',
                        format: 'der',
                        passphrase: require('../memory').db.server.keys.ecdsa.secret
                    });
                    return privateKey;
                }
            },
            public: {
                object: () => {
                    return this.ecdsa.build.public(this.ecdsa.get.public.string());
                },
                string: () => {
                    return require('../memory').db.server.keys.ecdsa.pub;
                }
            }
        }
    }
}

// check https://nodejs.org/docs/latest-v20.x/api/crypto.html#class-diffiehellman
exports.hmac = {
    get: {
        base64: (data) => {
            const hmac = crypto.createHmac(CONST_HASH, process.env.CRYPTO_SECRET);
            hmac.update(data);
            return hmac.digest('base64');
        },
        hex: (data) => {
            const hmac = crypto.createHmac(CONST_HASH, process.env.CRYPTO_SECRET);
            hmac.update(data);
            return hmac.digest('hex');
        },
    }
}

// INPUT_DATA == String
// Return BASE64
exports.cipher = (secret, data) => {
    'use strict';
    const iv = crypto.randomBytes(CONST_IV_LENGTH); // return buffer 16 == 32 hex
    const key = crypto.scryptSync(secret, 'salt', CONST_ALGORITHM_LENGTH);
    const cipher = crypto.createCipheriv(CONST_ALGORITHM, Buffer.from(key), iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const final = iv.toString('hex') + encrypted.toString('hex');

    return Buffer.from(final, 'hex').toString('base64');
}

// INPUT_DATA == BASE64
// Return String
exports.decipher = (secret, b64, type) => {
    'use strict';
    const input_data = Buffer.from(b64, 'base64').toString('hex'); // tranform base64 input data to hex

    const iv = Buffer.from(input_data.slice(0, 32), 'hex'); // IV => For AES, the size is always 16 (buffer) || 32 (hex) || 128 bits
    const data = Buffer.from(input_data.slice(32), 'hex');
    const key = crypto.scryptSync(secret, 'salt', CONST_ALGORITHM_LENGTH);
    const decipher = crypto.createDecipheriv(CONST_ALGORITHM, Buffer.from(key), iv);

    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);

    return decrypted.toString();
}

