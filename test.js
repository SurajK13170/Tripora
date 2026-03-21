  const crypto = require('crypto');

  const password = "6E113DEDE721486B2C096291270DE391411BEE9931732D88047F73702CB8FD7B";
  const salt = Buffer.from([
    73, 118, 97, 110, 32, 77, 101, 100, 118, 101,
    100, 101, 118
  ]);

  const iterations = 1000;
  const keyLength = 48; 
  const digest = "sha1";

  function decryptAES(encryptedBase64) {
    const derivedBytes = crypto.pbkdf2Sync(
      password,
      salt,
      iterations,
      keyLength,
      digest
    );

    const key = derivedBytes.slice(0, 32); 
    const iv = derivedBytes.slice(32, 48);  

    const encryptedBuffer = Buffer.from(encryptedBase64, "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  }


  const encryptedValue = "xLDBu5QHRnCYn2upmSNbRw=="
  const decryptedText = decryptAES(encryptedValue);

  console.log("Decrypted:", decryptedText);





















