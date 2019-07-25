const ipcRenderer = require("electron").ipcRenderer;

window.addEventListener("load", onLoad);

function onLoad() {
  ipcRenderer.sendToHost("getData", window.origin);
  ipcRenderer.on("yubikeyData", async (e, publicKey) => {
    // Stupid unneccessary Graphql type
    delete publicKey.__typename;
    // The Buffer gets changed into a normal array via the ipcRenderer, we have
    // to change it back so that the create method works
    publicKey.challenge = await new Uint8Array([...publicKey.challenge]).buffer;
    // Yes, it really has to be a Uint8Array -.-
    publicKey.user.id = await new Uint8Array(publicKey.user.id);

    const createCredentialDefaultArgs = { publicKey };

    // sample arguments for login
    var getCredentialDefaultArgs = {
      publicKey: {
        timeout: 60000,
        // allowCredentials: [newCredential] // see below
        challenge: new Uint8Array([
          // must be a cryptographically random number sent from a server
          0x79,
          0x50,
          0x68,
          0x71,
          0xda,
          0xee,
          0xee,
          0xb9,
          0x94,
          0xc3,
          0xc2,
          0x15,
          0x67,
          0x65,
          0x26,
          0x22,
          0xe3,
          0xf3,
          0xab,
          0x3b,
          0x78,
          0x2e,
          0xd5,
          0x6f,
          0x81,
          0x26,
          0xe2,
          0xa6,
          0x01,
          0x7d,
          0x74,
          0x50
        ]).buffer
      }
    };
    // register / create a new credential
    ipcRenderer.sendToHost("Starting Process");
    const cred = await navigator.credentials.create(createCredentialDefaultArgs); // Server

    const credentials = {
      id: cred.id,
      rawId: new Uint8Array(cred.rawId),
      response: {
        attestationObject: new Uint8Array(cred.response.attestationObject),
        clientDataJSON: new Uint8Array(cred.response.clientDataJSON)
      }
    };

    ipcRenderer.sendToHost("NEW CREDENTIAL", credentials);
    // .then(cred => {
    //   console.log("LOG: onLoad -> cred", cred);

    //   // normally the credential IDs available for an account would come from a server
    //   // but we can just copy them from above...
    //   var idList = [
    //     {
    //       id: cred.rawId,
    //       transports: ["usb", "nfc", "ble"],
    //       type: "public-key"
    //     }
    //   ];
    //   getCredentialDefaultArgs.publicKey.allowCredentials = idList;
    //   return navigator.credentials.get(getCredentialDefaultArgs);
    // })
    // .then(assertion => {
    //   ipcRenderer.sendToHost("ASSERTION", assertion);
    //   console.log("LOG: onLoad -> assertion", assertion);
    // })
    // .catch(err => {
    //   ipcRenderer.sendToHost("ERROR", err);
    // });
  });
}
