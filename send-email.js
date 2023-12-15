const connectionString = "endpoint=https://serviciodecorreos.unitedstates.communication.azure.com/;accesskey=qEgllRx/Nv2EhX9rKWx1QvtH09iAGD3isMiPGCZ/reuhM/UHVOxeqOn3HGkBBhLcdB5bsUzc5vuntCEpub4RaA==";
const senderAddress = "DoNotReply@9852b27d-68d3-4d58-b9d5-bfea1630f998.azurecomm.net";


const { EmailClient, KnownEmailSendStatus } = require("@azure/communication-email");
  
  async function main() {
  
    const recipientAddress =  "alejandro.trevizo@crediangel.com";
  
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