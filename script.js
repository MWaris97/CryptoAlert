var globalInterval;
var targetPrice;


class AlertInfo {

    // symbol -> Coin pair like "ETHBTC"
    // targetPrice -> Coin price to target
    // mute -> Mute sound alert for the coin pair
    // active -> Mark alert active/inactive for the coin pair
    // condition -> Trigger alert if the current price is greater than / less than the target price (gt/lt)
    
    constructor(symbol, targetPrice, mute = false, active = true, condition, interval = null) {
        this.symbol = symbol;
        this.targetPrice = targetPrice;
        this.mute = mute;
        this.active = active;
        this.condition = condition;
        this.interval = interval;
    }
}

// var alertObj = {
//     symbol: "ETHBTC",
//     targetPrice: 1.0,
//     mute: false,
//     active: true,
//     condition: "gt/lt"
// };

var req = new XMLHttpRequest();

req.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
        var _data = this;
        var pairSymbol = document.getElementById("pair");
        var symbList = [];
        JSON.parse(_data.response).symbols.forEach(element => {
            var el = document.createElement("option");
            el.textContent = element.symbol;
            el.value = element.symbol;
            pairSymbol.appendChild(el);
            //  symbList.push(element.symbol);
        });
    }
    else if(this.readyState == 4) {
        console.log('err')
    }
}

req.open("GET", "https://api.binance.com/api/v3/exchangeInfo", true);
req.send();


function fillPriceBox() {
    var pairSymbol = document.getElementById("pair");
    document.getElementById("price").value = getPrice(pairSymbol.options[pairSymbol.selectedIndex].value);
}

function addAlert() {
    var pairSymbol = document.getElementById("pair");
    var alertList = document.getElementById("alertList");
    targetPrice = document.getElementById("price").value;
    var selectedValue = pairSymbol.options[pairSymbol.selectedIndex].value;
    console.log(pairSymbol)
    console.log(selectedValue)

    
    var el = document.createElement("li");
    el.textContent = selectedValue;
    alertList.appendChild(el);

    priceAlert(selectedValue);
}

function removeAlert(){
    clearInterval(globalInterval);
}

function priceAlert(symbol) {
    var alertSound = new sound("siren.mp3");
    var newPrice;

    globalInterval = setInterval(function(){
        newPrice = getPrice(symbol);
        
        if (newPrice >= targetPrice) {
            alertSound.play();
            // alert('Price hit');
            // alertSound.stop();
        }
        else {
            alertSound.stop();
            // alert('Price hit');
            // alertSound.stop();
        }
    }, 2000);
}

function getPrice(symbol) {
    var req = new XMLHttpRequest();
    var tempPrice = null;
    req.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var _data = this;
            console.log(JSON.parse(_data.response).price);
            tempPrice = JSON.parse(_data.response).price;
        }
        else if(this.readyState == 4) {
            console.log('err')
        }
    }
    req.open("GET", "https://api.binance.com/api/v3/ticker/price?symbol=" + symbol, false);
    req.send();

    return tempPrice;
}


function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
  }