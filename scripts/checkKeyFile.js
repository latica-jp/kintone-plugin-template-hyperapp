'use strict';

const fs = require('fs');
const RSA = require('node-rsa');

const path = './private.ppk';
let privateKey = '';
let key = '';
try {
  // キーファイルが存在しない以外のエラーはエラー終了してOK
  privateKey = fs.readFileSync(path, 'utf8');
  key = new RSA(privateKey);
  console.log('A private key file exists.');
} catch (error) {
  // キーファイルが存在しない場合は作成する
  // ファイル出力がエラーだった場合はエラー終了してOK
  if (error.code === 'ENOENT') {
    key = new RSA({ b: 1024 });
    privateKey = key.exportKey('pkcs1-private');
    fs.writeFileSync(path, privateKey, 'utf8');
    console.log('A new private key file has been generated.');
  } else {
    throw new Error(error);
  }
}
