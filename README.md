<h3 align="center">foostack</h3>
<p align="center">fullstack webapp horizontally scalable using socketio and openpgp</p>
<p align="center"><i>(work in progress)</i></p>


Each peer _(both server and webclient)_ generates a new openpgp key pair at startup. These keys are only used for data transport _(signature and encryption)_. Anything not stored on the blockchain remains in memory during execution like keys and peer list.

Currently, when you type a string in the stdin of an instance, a block is created, saved to a file named blockchain.json and sent to every node which check if the hash of this new block match the computed hash of the previous block. An acknowledgment is sent back to the emitter (but currently nothing is really performed after that).

Connected peers are discovered by asking a list of online nodes to everyone.

#### Pkg/Obfuscator _Locking Nodejs version to 18.5.0_
  - "To be able to generate executables for all supported architectures and platforms, run pkg on a Linux host with binfmt (QEMU emulation) configured and ldid installed". https://wiki.debian.org/QemuUserEmulation https://git.saurik.com/ldid.git
  - Pkg failed to make bytecode for openpgp. Pkg is done using --no-bytecode flag.
    - Keeping obfuscator.
  - /snapshot/foostack/node_modules folder is empty(ok) when running: npm run bundle && npm run pkg:bundle

#### Serialization:
  - **on handshake**: uuid, pub and port  is signed and sent in clear. _The receiver returns his uuid and pub as an acknowledgement._
  - **on data**: uuid and data  is signed and sent as clear but data is encrypted and signed too. _The receiver return the same data as an acknowledgement._

#### Blockchain: _wait 20 sec before trying stdin_
  - a block contain { block: _number_, data: _json_, prev: _hash-of-previous-block_ }.
  - ask for a list of onlines nodes. _timeout 10seconds_.
  - on sync, first and last block is asked to every online nodes. _timeout 10seconds_.
  - blockchain file can be found at: $HOME/.foostack/blockchain

#### Web:
- the login is simulated by generating a new openpgp key pair (you can see more details in logs).
  - asking a seed to the server.
  - signing { seed, pub } _where pub is the new openpgp public key_.
- when the page is reloaded, the session doesn't follow.
- Using Navigo as view router: https://github.com/krasimir/navigo

#### Cron:
- 10 min:
  - if a webpeer is not seen since 30 min he is deleted from memory.
- 1 hour:
  - logout every login (webpeer) >= 4h.

## Usage

Check the "scripts" content of the package.json file:
```sh
$ npm run dev
```
and start multiple instances like that.


<h3 align="right"><a href="https://buymeacoffee.com/foostack">[buymeacoffee.com/foostack]</a></h3>

#### TODO:
- web view.
- review imports (web).
- socketio: review parse ip to check (in headers) if it is forwarded (proxy).
- review this warnings about openpgp:
-    node pkg (bundled only): V8: /snapshot/foostack/src/server/server.bundle.js:26 Invalid asm.js: Can only use immutable variables in global definition
-    web pkg: Invalid asm.js: Can only use immutable variables in global definition

#### memory.js file content looks like this when running
```
{
  blacklist: {},
  blockchain: {
    firstlast: { all: [], trusted: [], grouped: {} },
    saved_responses: {}
  },
  default_peers: [
    {
      server: '::ffff:127.0.0.1',
      port: '8001',
      socket: [Socket],
      pub: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4cE1FWnpTeUJ4TUpLeVFEQXdJSUFRRU5CQU1FSzNGT1RkNEhtOS9oK3AzaTFQWHhLWEFGY3MreXJnM2QKdFFBM3R4Ni9tNXRsbDc5RmVlaUZESVJ5OHZyRWhIcmhFakUxNW5XS0Y1YTdvL0lIWmNKdFpweUs5NzUwCklOdWYyTEFZbFQrY3JSYzc3ZldjVU1HYmpTZ2YrSGhLL096d0VaTUlraEpneHNTSlpPWHJFNnJlWk5JZgpaUUtEekRpT2tKSmFCcDZTWXZETlcyRTJPRFF5T0RKaUxXRXpZalV0TlRFeU1DMWlaREV4TFRkbVlURTQKT1RneU1UZzNaU0E4WVRZNE5ESTRNbUl0WVROaU5TMDFNVEl3TFdKa01URXROMlpoTVRnNU9ESXhPRGRsClFHeHZZMkZzYUc5emRDNXNiMk5oYkQ3Q3dBd0VFQk1LQUQ0RmdtYzBzZ2NFQ3drSENBbVFHM0pXRnRKMQo1bmtERlFnS0JCWUFBZ0VDR1FFQ213TUNIZ0VXSVFRUDJLNVRGNktwUy9FYXBBVWJjbFlXMG5YbWVRQUEKcFY4Qi8wNmg1TkQ1V1JHWHViY3NrQWlJaDduVUZXOFFWYkpXYnNjU2xQd3NmNG50bDdtMlBIKzZnQlZhCkxMNUFmNEpjZ2JvRGNmb1RlRW44WlErZUI4N0tXdG9CLzF0UlA5Z2xiN0wrOHgySnpDM09aRlZObW5lbQppUXhEK1RnczdUNUF0NHdueWRDaUdCK0w3WGpCTFpCWXdxU1B6bHhLUjVOMHNGa2VWeE1JWFNTUUpqbk8KbHdSbk5MSUhFZ2tySkFNREFnZ0JBUTBFQXdSZnhZcVgyWGxGM1Vua01hbTZJZldaRVFIUnB4UEg2cWhrCm05dUUvZi9ueTA1SmU4VFNYdGFTWFY2WUpXQkxkZDQ0Q0JUa0ZMRERMVVEyV3grd24vbU5Mc0JZaTRELwpUSkwrbXp2TlNSSGg3WU5xM2EwU1dOU2lBL042VmRwL1QvS0NqUUEyS1ZNVStOcE9KT1BTTjU1OUFRZUUKM2ZmMXhCWWljbll4K3Q2djNnTUJDZ25DdUFRWUV3b0FLZ1dDWnpTeUJ3bVFHM0pXRnRKMTVua0Ntd3dXCklRUVAySzVURjZLcFMvRWFwQVViY2xZVzBuWG1lUUFBV2hvQi8xRERMUENYUC8yaHdIYkxqWkp0Rms5ZApXVEhJRGN2VXNhODNTaDZudDdKcnFZRzlRRDJwS2Y0ODlFWUtzMzh3UjBlY05vUUVsbmhLYmZJTExBaysKYWowQi9pa3ZicG5ZL1RDUGFVY3VrRUM1OTBuWU9kT1JLNUx0YjRiYnkrbkE2L0hWUW45R0tkWklDSzloCjRPaXRDUUl6UEVYUmZMdWhSZkhlWnlqbVVjVTdlUlU9Cj1LcnJ0Ci0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K',
      uuid: 'a684282b-a3b5-5120-bd11-7fa18982187e',
      seen: 1731506833448,
      sid: 'mHJuuS52foBgkAQrAAAA'
    }
  ],
  peers: [
    {
      server: '::ffff:127.0.0.1',
      port: '8001',
      socket: [Socket],
      pub: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4cE1FWnpTeUJ4TUpLeVFEQXdJSUFRRU5CQU1FSzNGT1RkNEhtOS9oK3AzaTFQWHhLWEFGY3MreXJnM2QKdFFBM3R4Ni9tNXRsbDc5RmVlaUZESVJ5OHZyRWhIcmhFakUxNW5XS0Y1YTdvL0lIWmNKdFpweUs5NzUwCklOdWYyTEFZbFQrY3JSYzc3ZldjVU1HYmpTZ2YrSGhLL096d0VaTUlraEpneHNTSlpPWHJFNnJlWk5JZgpaUUtEekRpT2tKSmFCcDZTWXZETlcyRTJPRFF5T0RKaUxXRXpZalV0TlRFeU1DMWlaREV4TFRkbVlURTQKT1RneU1UZzNaU0E4WVRZNE5ESTRNbUl0WVROaU5TMDFNVEl3TFdKa01URXROMlpoTVRnNU9ESXhPRGRsClFHeHZZMkZzYUc5emRDNXNiMk5oYkQ3Q3dBd0VFQk1LQUQ0RmdtYzBzZ2NFQ3drSENBbVFHM0pXRnRKMQo1bmtERlFnS0JCWUFBZ0VDR1FFQ213TUNIZ0VXSVFRUDJLNVRGNktwUy9FYXBBVWJjbFlXMG5YbWVRQUEKcFY4Qi8wNmg1TkQ1V1JHWHViY3NrQWlJaDduVUZXOFFWYkpXYnNjU2xQd3NmNG50bDdtMlBIKzZnQlZhCkxMNUFmNEpjZ2JvRGNmb1RlRW44WlErZUI4N0tXdG9CLzF0UlA5Z2xiN0wrOHgySnpDM09aRlZObW5lbQppUXhEK1RnczdUNUF0NHdueWRDaUdCK0w3WGpCTFpCWXdxU1B6bHhLUjVOMHNGa2VWeE1JWFNTUUpqbk8KbHdSbk5MSUhFZ2tySkFNREFnZ0JBUTBFQXdSZnhZcVgyWGxGM1Vua01hbTZJZldaRVFIUnB4UEg2cWhrCm05dUUvZi9ueTA1SmU4VFNYdGFTWFY2WUpXQkxkZDQ0Q0JUa0ZMRERMVVEyV3grd24vbU5Mc0JZaTRELwpUSkwrbXp2TlNSSGg3WU5xM2EwU1dOU2lBL042VmRwL1QvS0NqUUEyS1ZNVStOcE9KT1BTTjU1OUFRZUUKM2ZmMXhCWWljbll4K3Q2djNnTUJDZ25DdUFRWUV3b0FLZ1dDWnpTeUJ3bVFHM0pXRnRKMTVua0Ntd3dXCklRUVAySzVURjZLcFMvRWFwQVViY2xZVzBuWG1lUUFBV2hvQi8xRERMUENYUC8yaHdIYkxqWkp0Rms5ZApXVEhJRGN2VXNhODNTaDZudDdKcnFZRzlRRDJwS2Y0ODlFWUtzMzh3UjBlY05vUUVsbmhLYmZJTExBaysKYWowQi9pa3ZicG5ZL1RDUGFVY3VrRUM1OTBuWU9kT1JLNUx0YjRiYnkrbkE2L0hWUW45R0tkWklDSzloCjRPaXRDUUl6UEVYUmZMdWhSZkhlWnlqbVVjVTdlUlU9Cj1LcnJ0Ci0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K',
      uuid: 'a684282b-a3b5-5120-bd11-7fa18982187e',
      seen: 1731506833448,
      sid: 'mHJuuS52foBgkAQrAAAA'
    },
    {
      server: '::ffff:127.0.0.1',
      port: '8002',
      socket: [Socket],
      pub: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4cE1FWnpTeUN4TUpLeVFEQXdJSUFRRU5CQU1FbHhQRTRaZlljTUVWZ09CYUtDZjdQRU1OSWFZMnN4WW0KcWRYVUplc2lLcnNlZmpNV241RXRuTzZ4UTE2N0s5RThrL2FWZEl4Z1lZeEM3STlYa3RlVjNFcGJHbFlpCnNnalhsM1F0U0lhRDE0R0RoREROeUQ3YmMyOFIrUVlCb0lETi9BZUJOWjVYWGtoejJ6K25icnNkOWRQMwpzcld4UTZaMHUzWkMwVXVPVTFQTld6UTVaalE1Tmpjd0xXTTNaV1V0TlRZek5pMDVNVGcxTFRBelkyUXoKWldKaE5tWTFZaUE4TkRsbU5EazJOekF0WXpkbFpTMDFOak0yTFRreE9EVXRNRE5qWkRObFltRTJaalZpClFHeHZZMkZzYUc5emRDNXNiMk5oYkQ3Q3dBd0VFQk1LQUQ0RmdtYzBzZ3NFQ3drSENBbVFRWDJUS3RVQgpaejRERlFnS0JCWUFBZ0VDR1FFQ213TUNIZ0VXSVFURzV6T2NMSkR3c2dxakdEUkJmWk1xMVFGblBnQUEKdVA4Q0FJQTErQit1ajZtd016MmIweUkwSVA0dU5lNHZHVlJhZ0pBYy9PSWRsZUU3bm02V2EwYmk4cHFGCkVxUXZycERweWtDS1dGSGh0VHR0VFJaK3RnNW1wQ1VCK2dLQmZXOTlEOXo2U2VqNmlVNGJTOFlvNGpuNgpHQm9LL3VzaXRieG92Szc2akZoTC9mbUhWaFNDaDV6aXFkdmdSTnFES3BLUFpEb1M3MmRVSUFsd1lkak8KbHdSbk5MSUxFZ2tySkFNREFnZ0JBUTBFQXdRTWpJUjlGaXo0UFIzREJZbC84clNqOWRqOFZjTHQwOGhQCmtiU2xrQVZOdndNbXhsWld3RlZPT3dISjRlNDBZUUNjMWErQ3EvU2pZeitxK1l5ejl5NFFoNWZNQ0Ywego1Sm4wOHE2cjFXQzAwcHVvT0JnYVBjWEduTTRXK1FhQ1pqT3kwZnNHeEhOWHovbGM0TW1zT0E4VnA2bEQKa2tFV1hxSEZKc01xTGZWNGdRTUJDZ25DdUFRWUV3b0FLZ1dDWnpTeUN3bVFRWDJUS3RVQlp6NENtd3dXCklRVEc1ek9jTEpEd3NncWpHRFJCZlpNcTFRRm5QZ0FBRFFVQi9peEY4elAxT2FTK3VObE9YaEc4SXZ3SAo2R0NMVWw4eE9qaENnYjdpSWRBYkdWRnA4VlBhTXJXdUVwZlBrSU8yQ1EzVjJPbnptSlROazIyTDJkQzcKNUowQi9qQU9HMDdYYi9sQkI3ZXBZUlJtWS9XdEZ5KzNxMEM0LzhDYm83SzR3cTJKNHppWkQrMWlpRkJICmJhSmduYmNLNFp5NFUyclhxdDcxTHY5VllUdmhzc0U9Cj12RHNJCi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K',
      uuid: '49f49670-c7ee-5636-9185-03cd3eba6f5b',
      seen: 1731506832933,
      sid: 'kdXm5lbbz1C4xfxKAAAC'
    },
    {
      server: '::ffff:127.0.0.1',
      port: '8003',
      socket: [Socket],
      pub: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4cE1FWnpTeVVoTUpLeVFEQXdJSUFRRU5CQU1FUzJYUEpqVlRObXV5MVFkVDRIRGJra2xseEtHWDJiUHMKVHFvakF2dnFLVVNlZnBTcE5IeEZ3eVk1NUpuZDY3cFlBVGY4QlJ4SkpkMW5kcFFaM296UjRta1I5QlNrCnl5NXhJR2pmSGwxMUl6NnJseFRvTlNGMFhDSXgxTmNTYnR1SGwrSll3VTAxYmVOaFFqUjFIWjNhVllsSAp6VXY5OGVmT1k5TVBEbEFEVmp6Tld6ZG1OMlEzTVdVekxXUXdOVEV0TlRGbE55MDVZVGhqTFRkbE9ESXkKTWprd09HRTVZU0E4TjJZM1pEY3haVE10WkRBMU1TMDFNV1UzTFRsaE9HTXROMlU0TWpJeU9UQTRZVGxoClFHeHZZMkZzYUc5emRDNXNiMk5oYkQ3Q3dBd0VFQk1LQUQ0RmdtYzBzbElFQ3drSENBbVFJRENQMFkzQgpLMXNERlFnS0JCWUFBZ0VDR1FFQ213TUNIZ0VXSVFTZFFWWHdYRkRKWHJsa3RLRWdNSS9SamNFcld3QUEKcDdrQi9qUlphSm1udXQ0eU4ydC9vakxNZXVQSS9XaXpmbkwrcjNySWN4allveFZrUWM5T1p6MEMwSVhyCkdJRHZDcVpiUDhsaUpkZnlkcHM3ZTlwbWZVS0xaakFCL2lERlRpZnJ4a3MwVWU2UmhIUUxoY0o0UThwMApIdGhvbDlSeG9TYUNuT3JCQndEa0JybkdLL282RXJ6WkVMaTdmeWkxUHJpWUJmZTRuY21DTjVOK0tPak8KbHdSbk5MSlNFZ2tySkFNREFnZ0JBUTBFQXdRZ2d5TU9IQ1ZJZklGSCtVcDlEeUZCeGdpc1dMTkNIZ2JECmtEaTlWUFdMVmwyN0hWSUJNRTJaL2ZlUFJ4RTFtdmxaK1N0eXc5SHhiTFdURDIxdWQxdUpDQ3VYV1NHZwozUWllZUQveGN4WXRJbnhrVkxHMWpxNTQ2NzNVaHM1RXFBYVNDaEQ5TnJ6NHFFemoraE9XZ1lJQmRpVXgKa2o4UGZiekZZQTZtSHdtT2NRTUJDZ25DdUFRWUV3b0FLZ1dDWnpTeVVnbVFJRENQMFkzQksxc0Ntd3dXCklRU2RRVlh3WEZESlhybGt0S0VnTUkvUmpjRXJXd0FBRWZZQi9pYTBFSDlUTU54M2JpNjZtUUdkQmFxLwpnREJZTGs0SHZJS0NyMk00dndaVE9EOVVpTmZiS2FaTGY1MURoSWJwWEdNTWp6K2svWEVzQUFFREgwT3MKaFpVQi8yenFQdWdGdUFqUHp3YUhaM0JTSXMvVTZnUklaVG8zaHN3RXJFNjNtL29HTDNtRFczSFVzRkVyCk9aZUdLWmNGbFdsbFE3WnJVeXBTUmM0eXgycC9ISDg9Cj1MeG55Ci0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K',
      uuid: '7f7d71e3-d051-51e7-9a8c-7e8222908a9a',
      seen: 1731506832453,
      sid: 'NCD-F8tY7H3r-VsBAAAD'
    },
    {
      server: '::ffff:127.0.0.1',
      port: '8005',
      sid: 'w3whnm6nRvopz632AAAG',
      pub: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4cE1FWnpTeW94TUpLeVFEQXdJSUFRRU5CQU1FTXdqS1dSYTN0clc3SFczcVI2djVhY1RKMUxoNHFCeG4KSmJZbFM3QVRnYU9HQjVqMFBPUGw2NmZ3YWM4cHE4UXBwRUV5czJyQlFCQS9rSzh6ekRMTlJCWmt1MDBGCnFUcittOWxNU3N4eXZlbE1lNHBPQUh1b3lES1VzQktnM2JUOWhZbWNtdDB3TzNtNFFoaW8vT1l0Q3NoUApjb2M0VFo0Yjd2em92c1lkS1JuTld6UTBPR00yWm1KakxUY3pOV010TlRJNFppMDVaV00zTFRRNU5ERXoKWVRJd1pETmhPQ0E4TkRRNFl6Wm1ZbU10TnpNMVl5MDFNamhtTFRsbFl6Y3RORGswTVROaE1qQmtNMkU0ClFHeHZZMkZzYUc5emRDNXNiMk5oYkQ3Q3dBd0VFQk1LQUQ0RmdtYzBzcU1FQ3drSENBbVFrMThna2IrNwpPemNERlFnS0JCWUFBZ0VDR1FFQ213TUNIZ0VXSVFURTdCbW5HdlNndlptYUpYYVRYeUNSdjdzN053QUEKbmZ3Qi8zOHpVRTBjSUFhT091ZjJmRnFwMU1WLzdsSmxpR2JOeEJwdUd5MXJVNzV5UzhMdFpvZkI3NkJQClo4MURyRytGYWFmWE84UjFKNVJkQkJZM3E1NVlLaklDQUozakdMejI2Qng3Y3ZKdW1vcXl0cVkvQ1lsRQowWGdrS3U4YkQ3dmw2QlNPSmJFK256R3N6UmliYjArYWZUNlhyYS9TZTVOakJJcms2MEhWd2VjZjNrM08KbHdSbk5MS2pFZ2tySkFNREFnZ0JBUTBFQXdRbjg3Nlo4VTMyclYvVE84ZVJVM3ZIYjlvVGFuWWUyYUdBClFyVGNVRVRmdU0yeStHSThGcmJWaGFTSTdnVERaZHlCSEFSZjVpV2JHa3krYURmUmdQWFdZdGViWURCKwpWVXhvNWsxMjZZV3RWWkZhK3MyVDZWR3JFZnFjSEVhV3Q3WHhhaG1mcGNLOFNrSjlMbzcwWVdRV0NNOFoKMmRYbGNmMkJPWTljVlk4TVZnTUJDZ25DdUFRWUV3b0FLZ1dDWnpTeW93bVFrMThna2IrN096Y0Ntd3dXCklRVEU3Qm1uR3ZTZ3ZabWFKWGFUWHlDUnY3czdOd0FBeU13Qi9qUzl2alJCL2xYSUdvajkrZnZWQzN4MQprWVBCUXp5M0pGb3dJQUM5KzhUSUhkSkVMQVdVa1NXTmVpdTVGVnh2NnZGN3E5SXBDUlZpOExIVHdDRUsKMmpBQ0FLSklVNjZLRW1IbGtlMFpwMkZXRXhkYnlkSUp0aW5TRk9wZk1FKy8wVGhueXhVRnFPd1B0aGVjClZOZ0NWVktsSzhZaWo5MHNMTDhYZkcxQjhxUDU4Rzg9Cj1SMWY2Ci0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K',
      uuid: '448c6fbc-735c-528f-9ec7-49413a20d3a8',
      seen: 1731506873151,
      socket: [Socket]
    }
  ],
  server: {
    uuid: 'acf8ef79-8cb1-5348-ab20-628148d7b6d2',
    openpgp: {
      priv: 'LS0tLS1CRUdJTiBQR1AgUFJJVkFURSBLRVkgQkxPQ0stLS0tLQoKeGNBWUJHYzBzbm9UQ1Nza0F3TUNDQUVCRFFRREJEYkp6RGtUWTBZY005b0tOMjZDeWtNbVRUeG5DUFh0Cms1RmFNd1pZQ0VmVTBwamhxSHIzMk05ejNNV2tRcUM4bzFzZUpnNWZhL0l5eHphSkFwdHFDM2hRcHBGMgp4b0FZL0ZUUkZDUDQvMDdiZU9hME5BU3A5MWxLcTFjb0toaW90N2I3bk90Sk9qaFBsWHBHdm0wYVRYRDgKUU9sRkVkTHAydSswbzRtTWt2OG5BQUgvVWtDcktHbkVIWG1mZGpxQ3pOT3N4ZjlEckU4Umg0NDd2dUxtCnVuZ3ZObkl0MXhzYmEzNWtNRURhc3p2V09jRWpaUHUvRG5SVFRQbmZHck8ySTdDZytDRHR6VnRoWTJZNApaV1kzT1MwNFkySXhMVFV6TkRndFlXSXlNQzAyTWpneE5EaGtOMkkyWkRJZ1BHRmpaamhsWmpjNUxUaGoKWWpFdE5UTTBPQzFoWWpJd0xUWXlPREUwT0dRM1lqWmtNa0JzYjJOaGJHaHZjM1F1Ykc5allXdyt3c0FNCkJCQVRDZ0ErQllKbk5MSjZCQXNKQndnSmtBZ1lxbDR5NEZIYUF4VUlDZ1FXQUFJQkFoa0JBcHNEQWg0QgpGaUVFbGV1enVnU1ptaE9xM3JCdUNCaXFYakxnVWRvQUFPSVZBZ0NLY2hDZzdib3VIenYxYXBtY3FJTUQKTjlFTTA5NXhTVC9VdzdBS1pKamowYXJraC9OTDBNYmcwbmd2Q2hRdHpxUHZKc2lWVzRYZUd4czVZb2hGClJ1UmpBZ0NmSTRPWlJFaHhacjlteEcra0k5QThrMC9kVkQ2eXF6SnZKNkVkb0FobEFWTk9XczdDS0xBNgpwOU9GVG5qSGFqcWc5WXZObUhhdFQ1TVJLdFQxbFB1b3g4QWNCR2Mwc25vU0NTc2tBd01DQ0FFQkRRUUQKQkl4SHIvM3B2SCtSSFFMeWt5ZmFpTW90ZEEvNTBLVTQ0cDlEdXlVK25heE9qTDhneEExTW8zNkxseFhiCjhvVGxacjIzN1V0NEtjL0RKTVdjeGRIYTM5NGp5c3AwVWtwRi9CM3o1aVE2Y3pzS2xKMnlhWlkwbEJuMQpvRis1eCtrL09jT2x1Y0x1WTV5RjhKeUFnemRIM0JoVExUcU5yZVVLN1lEazZJSUhhOXZUQXdFS0NRQUIKL2k2bVBJbFljSWhwR0JqVTB2TDc1R0t0VjROQm9pK3FYSExzbXZFOEtObjY5Y0RyZTU2VkovckdHNWZOCjhNTVQ1ekg4WndWdHF0KzJpZmh3cnJSa2RTY2xFc0s0QkJnVENnQXFCWUpuTkxKNkNaQUlHS3BlTXVCUgoyZ0tiREJZaEJKWHJzN29FbVpvVHF0NndiZ2dZcWw0eTRGSGFBQUNqemdJQXFiaUtEbDltRnE0YjdXVE8KWVFLdDFvbEIrYTZiamJOc1I5MWpGdGdHTHk2Zzg0YU1sVTU0U0U4M1RiS2JVbGhoRjJNTDFGYk1qcVF1CjhPNnFFbXFsdHdJQWtHdXdoV3JMT0xNcVBuYU5OOHhsK3loYjdsdmpCYWhIQnU2Uk9qSzlEVVNrbmJUYwp0SGJKZmJReENVZFloZXl6V1JmVmp4eWZETnFkTmx6ajlycXl2Zz09Cj1YSnJLCi0tLS0tRU5EIFBHUCBQUklWQVRFIEtFWSBCTE9DSy0tLS0tCg==',
      pub: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4cE1FWnpTeWVoTUpLeVFEQXdJSUFRRU5CQU1FTnNuTU9STmpSaHd6MmdvM2JvTEtReVpOUEdjSTllMlQKa1ZvekJsZ0lSOVRTbU9Hb2V2Zll6M1BjeGFSQ29MeWpXeDRtRGw5cjhqTEhOb2tDbTJvTGVGQ21rWGJHCmdCajhWTkVVSS9qL1R0dDQ1clEwQktuM1dVcXJWeWdxR0tpM3R2dWM2MGs2T0UrVmVrYStiUnBOY1B4QQo2VVVSMHVuYTc3U2ppWXlTL3lmTlcyRmpaamhsWmpjNUxUaGpZakV0TlRNME9DMWhZakl3TFRZeU9ERTAKT0dRM1lqWmtNaUE4WVdObU9HVm1Oemt0T0dOaU1TMDFNelE0TFdGaU1qQXROakk0TVRRNFpEZGlObVF5ClFHeHZZMkZzYUc5emRDNXNiMk5oYkQ3Q3dBd0VFQk1LQUQ0RmdtYzBzbm9FQ3drSENBbVFDQmlxWGpMZwpVZG9ERlFnS0JCWUFBZ0VDR1FFQ213TUNIZ0VXSVFTVjY3TzZCSm1hRTZyZXNHNElHS3BlTXVCUjJnQUEKNGhVQ0FJcHlFS0R0dWk0Zk8vVnFtWnlvZ3dNMzBRelQzbkZKUDlURHNBcGttT1BScXVTSDgwdlF4dURTCmVDOEtGQzNPbys4bXlKVmJoZDRiR3psaWlFVkc1R01DQUo4amc1bEVTSEZtdjJiRWI2UWowRHlUVDkxVQpQcktyTW04bm9SMmdDR1VCVTA1YXpzSW9zRHFuMDRWT2VNZHFPcUQxaTgyWWRxMVBreEVxMVBXVSs2ak8KbHdSbk5MSjZFZ2tySkFNREFnZ0JBUTBFQXdTTVI2Lzk2Yngva1IwQzhwTW4yb2pLTFhRUCtkQ2xPT0tmClE3c2xQcDJzVG95L0lNUU5US04raTVjVjIvS0U1V2E5dCsxTGVDblB3eVRGbk1YUjJ0L2VJOHJLZEZKSwpSZndkOCtZa09uTTdDcFNkc21tV05KUVo5YUJmdWNmcFB6bkRwYm5DN21PY2hmQ2NnSU0zUjl3WVV5MDYKamEzbEN1MkE1T2lDQjJ2YjB3TUJDZ25DdUFRWUV3b0FLZ1dDWnpTeWVnbVFDQmlxWGpMZ1Vkb0Ntd3dXCklRU1Y2N082QkptYUU2cmVzRzRJR0twZU11QlIyZ0FBbzg0Q0FLbTRpZzVmWmhhdUcrMWt6bUVDcmRhSgpRZm11bTQyemJFZmRZeGJZQmk4dW9QT0dqSlZPZUVoUE4wMnltMUpZWVJkakM5Uld6STZrTHZEdXFoSnEKcGJjQ0FKQnJzSVZxeXppektqNTJqVGZNWmZzb1crNWI0d1dvUndidWtUb3l2UTFFcEoyMDNMUjJ5WDIwCk1RbEhXSVhzczFrWDFZOGNud3phblRaYzQvYTZzcjQ9Cj1hYkFJCi0tLS0tRU5EIFBHUCBQVUJMSUMgS0VZIEJMT0NLLS0tLS0K',
      revcert: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCkNvbW1lbnQ6IFRoaXMgaXMgYSByZXZvY2F0aW9uIGNlcnRpZmljYXRlCgp3cmdFSUJNS0FDb0ZnbWMwc25vSmtBZ1lxbDR5NEZIYUFwMEFGaUVFbGV1enVnU1ptaE9xM3JCdUNCaXEKWGpMZ1Vkb0FBSmFYQWY5LzBwVEFvRVN5c0pVUTZRMmNVQXZNTDQvUDgwRXBaM2JzMEZkZTNGb2hMcW1tCkU4b2NDUVM4cjl3bUR2MUFvM2hkbzl1clo2dWkrS2g4U0pTZU14SFVBZjlwNVVLeU5JeU5nK1VXWS81QgoxOUMxYU5lclJGcGZwQmhZaVc3Y29jVHJVaEZsakVUZjlycVF1SklHbTJBTlh6bjhBR1dFbnIvd3Bzd2EKWXFDYjM3TjAKPS9JV3YKLS0tLS1FTkQgUEdQIFBVQkxJQyBLRVkgQkxPQ0stLS0tLQo='
    }
  },
  state: { got_online_peers: true, is_blockchain_sync: false },
  webpeers: [
    {
      pub: 'LS0tLS1CRUdJTiBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCgp4cE1FWnpTeXVSTUpLeVFEQXdJSUFRRU5CQU1FVVA1ZVpjTlk3NTNyZGxOSFg5aUpsbmFvTFArYTd2Z0wKUVQzTUg5VHhmcUtNUGlaelFCMFlWTEt2L3hoZm9JeXJzd3Ivb0h6S21NS3ZTRUt2bTJhUHhaTmRkUzRiCmFJQnk1WS9lRUg5Z09yY3NKb2NYbEVDRjRVdEM0aHdKWFVvUWtucmlnN1lkQ2tOazZqa0J4WDhPZ1gxQwpoOEdMUFdERU1XYXZ0M0FjeWQvTlZqRmxNV1k0WkRGbExXWmxPVE10TlRZeVlTMWlNV1UzTFdSbU4yWXgKWVRBME4ySXhNQ0E4TVdVeFpqaGtNV1V0Wm1VNU15MDFOakpoTFdJeFpUY3RaR1kzWmpGaE1EUTNZakV3ClFIUmxjM1F1Ykc5allXdyt3c0FNQkJBVENnQStCWUpuTkxLNUJBc0pCd2dKa0hKbXE2YkZUQUNhQXhVSQpDZ1FXQUFJQkFoa0JBcHNEQWg0QkZpRUUyUlJjckpid0xTaHBBbFg4Y21hcnBzVk1BSm9BQUxhOUFmNHIKdnA2ZkowMkJwTXlSQU5rUHlyWlV0RUI3MC96cFFOQXh4UTNCY0Q5TFcyZUJMUllnYjF1NHAzOWNWc1FwCkFVdFJGZzVjb2JQQTJReEFDTUxpeXE2eUFmNHlIeG9OdTRDcHhLK1UxY24zbUlRYkRlUTUwY29SU1JnSApGT2FmVFpJWVlpQ3ZWZXl1OXhPR3V4MGxaMjk1ajVoUnJpaE4rUHpDZDlXckhLOHFPQ0lDenBjRVp6U3kKdVJJSkt5UURBd0lJQVFFTkJBTUVpVGZXbTU3N012djhabVBpT3AwcjBYYi9JQk5VYjhhbnlZakdiY2UxCmZMQURpWHB3SytWVSswVmdSazZpOUlVVzQ4dUN4bVdzcHBqYnZMZ3RlQlBkZFVoWkNhcUlaL3RCQm4wego3ajNhZXFZeUZ6ZUpyTmY2NkFnQmhoNjdxZW84R0VSL3dDYWFRTW4rcEg4WUUrc0swbzNETnpRQklReWMKUVlzRzVLdzVHTGdEQVFvSndyZ0VHQk1LQUNvRmdtYzBzcmtKa0hKbXE2YkZUQUNhQXBzTUZpRUUyUlJjCnJKYndMU2hwQWxYOGNtYXJwc1ZNQUpvQUFHOE9BZjBSMW8zOG1GcVN0Vk9seXpNMEFybmxqZzBSamdubQorL1EvWTJ3VlRwVnZiUWJHcjVhWStGZ2xwVkdPSTZicGFYTDB2ZUhlVEZWVzJUWWVTTzJuZC9EL0FmNHYKcjBFRVg0OVVucS9TTW1tZkx3SjFsdXZEWk1JWDR0NzVwZThLajgrU1Z5OVhzamo0bTVobEljVW5XM0NuClcxcWJwQlJtam9ycVU5MHlhMm9BQWhmQQo9OUVTeQotLS0tLUVORCBQR1AgUFVCTElDIEtFWSBCTE9DSy0tLS0tCg==',
      uuid: '1e1f8d1e-fe93-562a-b1e7-df7f1a047b10',
      sid: 'a9vmydzbaWgkIruKAAAI',
      seen: 1731506885181,
      login: [Object]
    }
  ],
  del: {
    peer: [Function: peer],
    webpeer: {
      index: [Function: index],
      seens: [Function: seens],
      logins: [Function: logins]
    }
  },
  get: {
    peer: {
      index_uuid: [Function: index_uuid],
      exist_uuid: [Function: exist_uuid],
      index_sid: [Function: index_sid],
      exist_sid: [Function: exist_sid],
      exist_server: [Function: exist_server],
      index_server: [Function: index_server],
      onlines: [Function: onlines]
    }
  },
  set: { peer: [Function: peer], webpeer: [Function: webpeer] }
}
```
