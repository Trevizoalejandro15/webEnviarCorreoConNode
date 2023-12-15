const express = require('express');
const path = require ('path');
const bodyParser = require ('body-parser');
const exp = require('constants');
const app = express();

const connectionString = "endpoint=https://serviciodecorreos.unitedstates.communication.azure.com/;accesskey=qEgllRx/Nv2EhX9rKWx1QvtH09iAGD3isMiPGCZ/reuhM/UHVOxeqOn3HGkBBhLcdB5bsUzc5vuntCEpub4RaA==";
const senderAddress = "DoNotReply@9852b27d-68d3-4d58-b9d5-bfea1630f998.azurecomm.net";

const { EmailClient, KnownEmailSendStatus } = require("@azure/communication-email");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '')));

async function main(email) {

   // const recipientAddress =  "alejandro.trevizo@crediangel.com";

    // Actualizar la variable recipientAddress con el valor del correo electrónico
    const recipientAddress = email;

    const POLLER_WAIT_TIME = 10
  
    const message = {
      senderAddress: senderAddress,
      recipients: {
        to: [{ address: recipientAddress }],
      },
      content: {
        subject: "Test email from JS Sample",
        plainText: "This is plaintext body of test email.",
        html: "<html><h1>This is the html body of test email.</h1></html>",
      },
    }
  
    try {
      const client = new EmailClient(connectionString);
  
      const poller = await client.beginSend(message);
  
      if (!poller.getOperationState().isStarted) {
        throw "Poller was not started."
      }
  
      let timeElapsed = 0;
      while(!poller.isDone()) {
        poller.poll();
        console.log("Email send polling in progress");
  
        await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000));
        timeElapsed += 10;
  
        if(timeElapsed > 18 * POLLER_WAIT_TIME) {
          throw "Polling timed out.";
        }
      }
  
      if(poller.getResult().status === KnownEmailSendStatus.Succeeded) {
        console.log(`Successfully sent the email (operation id: ${poller.getResult().id})`);
      }
      else {
        throw poller.getResult().error;
      }
    }
    catch(ex) {
      //console.error(ex);
    }
  }

  //main();

 /* app.post('/', (req, res) => {
    main(); // Llama a la función main() cuando se recibe una solicitud POST
    res.send('Formulario enviado con éxito');
  });*/

  app.post('/', async (req, res) => {
    try {
      const email = req.body.email;
  
      // Llamar a la función main() con el nuevo recipientAddress
      await main(email);
  
      res.send('Formulario enviado con éxito');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al procesar el formulario');
    }
  });

app.listen(3000, () => console.log('server started'));

module.exports = app;