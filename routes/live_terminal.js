var express = require('express');
var router = express.Router();
const crypto = require("crypto");
var request = require('request');

const {GRUPPTERMINAL_BASEURL, GRUPPTERMINAL_AUTH}=process.env;

//Starting Grupp

const charset = "utf-8";
const format = "base64";
const iv = Buffer.alloc(8);
const transformation = "des-ede3-cbc";

function Encryption(secretKey) {
  this.secretKey = secretKey;
}

Encryption.prototype.md5 = function (data) {
  return crypto.createHash("md5").update(data, charset).digest();
};

Encryption.prototype.getCipherInstance = function () {
  const digestPassword = this.md5(this.secretKey);
  const keyBytes = Buffer.alloc(24);
  keyBytes.fill(digestPassword);
  let j = 0,
      k = 16;
  while (j < 8) {
    keyBytes[k++] = keyBytes[j++];
  }
  return keyBytes;
};

Encryption.prototype.encrypt = function (data) {
  const keyBytes = this.getCipherInstance();
  const cipher = crypto.createCipheriv(transformation, keyBytes, iv);
  const encrypted = cipher.update(data, charset, format);
  return encrypted + cipher.final(format);
};

Encryption.prototype.decrypt = function (hashedData) {
  const keyBytes = this.getCipherInstance();
  const decipher = crypto.createDecipheriv(transformation, keyBytes, iv);
  const decrypted = decipher.update(hashedData, format);
  return decrypted + decipher.final();
};
//Ending Group

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/encryption', function(req, res, next) {

// usage
  const instance = new Encryption("2033HQOQ-8e482d94-66ab-4713-87e1-f6cb5dd2f79f");
  // console.log(instance.encrypt("test-key"));
  // console.log(instance.decrypt("OykLQx3mPoQhTAjaoayFfg=="));

  res.send(instance.decrypt("dDzoGN/5T41EyyBM8XpOCx1rMmxNp/6cQ07Ui/IHwVgclxdf/cAT98FGvKM1TuKH8phUmcq3+sJXBLRFxuotSR3g2B0DmBHmIkWX2j09N9SjM+e9s+rZpI51ysl9ZI+yvPM3VT2BJLGhN2JdNSXVzU8lHDZEcGHY4JETavBYyPXZoBQTtwZ/aza/HNTczxcE9+Z0l+i7CaqYNOozfUE3MzrSNyAtMlaExSkZv4HuseUFeyiK0Lr1ZvS8LzlNq5pO5Hmj8pDkIEdHNaJv2UfXWWvFEB/a6B3W6Bt7rzchBFcXOLHf9JPZURKFU1vQcXDcHJiEWF125dVutiPROfkF17nAz6/EvXCVTWfzVr1V3BuKSS12CtfJzLn2RdXLk/bQL6JCJaKR1zhqJ3452gIo79qzrLbNaM6n47PmYdY/EUAL81pxIXiM0UMXc8/3R2O/U4z+EOITAAeigXH7Cm6uJsCWY6nmUj1YJfU/2zipmPrRFYOB19N5w7hVwWR5OzmtQXUOVSKk8cJPPFMJYSQll4sXTfpDEf5LNb94xq905/XchtsiC2OHgunI+jQ6KgRYHtYKwEgQXFslZCmN9lYji39UgOVFONBmEQfis1uO5xRJRniXmbe3XxPbeFXPBQvMt55XW8gnhrw17N3NJlcflQWvhdJqrPtRQli/NSyWvot8yLce3wLDQFemfyEdEURRM5TnTmqx3FBtZzK4ZdjaNTEdP9V1xkR5WPR0RvfOkc388N+jNwRfqpkVrsT2IdET0WoUL4i3d3K8j/HSagafkNh+lQVvv2PolvCYpQBx+TgbDo++m19dkqLUheN7wptcJ7mJ9dP2f+xBUIRoBhR31mBzFzEVIEgU4Pt/GRPMBYfxJEQnMnrjJdsY3ZvMOjFuuOTbLC6XRgf//yg99BoU8xY/7lFq2c3x5pMG1s5eXad/kWsEubbU6pucMW3RGb4Zhkv0gzayslfOJJWPZXYHNf2PjzlzpyJo1PPjCr3lGCPjXZpnqGh3ooVHjzBaJNHsR9gLAh0SvM2uovnv+1ER3G5pPpokqqK2TOy7+vr4qdEFOOnBCitt3rf8dtuRyW4lATKUXNunCvv/HbQ49QFsgU8ppF7D0C4BgcGZF87vksjc+d3wH8PUI+RMFDnMmy/ZhDXSAutSMIQWHvF5I5v0sg=="));
});

router.post('/grupp-login', function(req, res, next) {

  console.log(Date.now())
  console.log(Date.now().toString().substr(6,6))

  const {serialNumber}=req.body;

  var options = {
    'method': 'POST',
    'url': `${GRUPPTERMINAL_BASEURL}network-mgt`,
    'headers': {
      'Authorization': `Basic ${GRUPPTERMINAL_AUTH}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "serialNumber": serialNumber,
      "stan": Date.now().toString().substr(6,6),
      "onlyAccountInfo": false
    })

  };

  console.log(options.url);
  console.log(options.headers.Authorization);
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    return res.json(JSON.parse(response.body));
  });

});

router.post('/grupp-terminal-transactions', function(req, res, next) {

  console.log(new Date());

  const terminalID=req.body.terminal;
  const sessionID=req.body.session;

  var options = {
    'method': 'GET',
    'url': `${GRUPPTERMINAL_BASEURL}transaction`,
    'headers': {
      'Authorization': `Basic ${GRUPPTERMINAL_AUTH}`,
      'Content-Type': 'application/json',
      'terminalId': terminalID
    },
    body: null

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    var body=JSON.parse(response.body);

    console.log(body.data);
    console.log(sessionID);
    console.log(terminalID);

    try {
      // usage
      const instance = new Encryption(sessionID);
      // console.log(instance.encrypt("test-key"));
      decrytedValue=instance.decrypt(body.data.toString());
      console.log(decrytedValue);

      return res.json(JSON.parse(decrytedValue));
    }catch (e) {
      return res.json(body);
    }
  });

});

router.post('/grupp-card-request', function(req, res, next) {

  console.log(Date.now())

  const terminalID=req.body.terminal;
  const sessionID=req.body.session;

  const {pan,stan,rrn,amount,iccData,track2Data,postDataCode,cardExpiryDate,acquiringInstitutionalCode,sequenceNumber,pin,accountType,type} =req.body;

  const instance = new Encryption(sessionID);

  var json=JSON.stringify({
    pan,stan,rrn,amount,iccData,track2Data,postDataCode,cardExpiryDate,acquiringInstitutionalCode,sequenceNumber,pin,accountType,type
  });

  var url=`${GRUPPTERMINAL_BASEURL}transaction`;

  var payload = instance.encrypt(json);

  console.log(url);
  console.log(json);
  console.log(payload);

  var options = {
    'method': 'POST',
    'url': url,
    'headers': {
      'Authorization': `Basic ${GRUPPTERMINAL_AUTH}`,
      'Content-Type': 'application/json',
      'terminalId': terminalID
    },
    body: payload

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    var body=JSON.parse(response.body);

    console.log(body.data);
    console.log(sessionID);
    console.log(terminalID);

    try {
      decrytedValue = instance.decrypt(body.data.toString());
      console.log(decrytedValue);

      return res.json(JSON.parse(decrytedValue));
    }catch (e) {
      return res.json(body);
    }
  });

});

module.exports = router;
