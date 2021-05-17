// var globalInterval;
var alertSound;

class AlertInfo {

    // symbol -> Coin pair like "ETHBTC"
    // targetPrice -> Coin price to target
    // mute -> Mute sound alert for the coin pair
    // active -> Mark alert active/inactive for the coin pair
    // condition -> Trigger alert if the current price is greater than / less than the target price (gt/lt)
    
    constructor(symbol, targetPrice, condition, interval = null, mute = false, active = true) {
        this.symbol = symbol;
        this.targetPrice = targetPrice;
        this.mute = mute;
        this.active = active;
        this.condition = condition;
        this.interval = interval;
    }
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

var req = new XMLHttpRequest();

req.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
        var _data = this;
        var pairSymbol = document.getElementById("pair");
        JSON.parse(_data.response).symbols.forEach(element => {
            var el = document.createElement("option");
            el.textContent = element.symbol;
            el.value = element.symbol;
            pairSymbol.appendChild(el);
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
    var targetPrice = document.getElementById("price").value;
    var selectedValue = pairSymbol.options[pairSymbol.selectedIndex].value;
    
    var el = document.createElement("li");
    el.textContent = selectedValue;
    alertList.appendChild(el);

    var pairAlertInfo = new AlertInfo(selectedValue, targetPrice, document.getElementById("condition").value);

    priceAlert(pairAlertInfo);

    var localAlerts = localStorage.Alerts ? JSON.parse(localStorage.Alerts) : {};
    localAlerts[pairAlertInfo.symbol] = pairAlertInfo
    localStorage.Alerts = JSON.stringify(localAlerts);
}

function removeAlert(pairSymbol){
    var localAlerts = JSON.parse(localStorage.Alerts);
    clearInterval(localAlerts[pairSymbol].interval);
    delete localAlerts[pairSymbol];
    alertSound.stop();

    localStorage.Alerts = JSON.stringify(localAlerts);
}

function priceAlert(pairAlertInfo) {
    alertSound = new sound("siren.mp3");
    var newPrice;

    
    pairAlertInfo.interval = setInterval(function(){
        newPrice = getPrice(pairAlertInfo.symbol);
        if (pairAlertInfo.condition === "gt" && newPrice >= pairAlertInfo.targetPrice) {
            alertSound.play();
        }
        else if (pairAlertInfo.condition === "lt" && newPrice <= pairAlertInfo.targetPrice) {
            alertSound.play();
        }
        else {
            alertSound.stop();
        }
    }, 2000);
}

function getPrice(symbol, async = false) {
    var req = new XMLHttpRequest();
    var tempPrice = null;
    req.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) {
            var _data = this;
            tempPrice = JSON.parse(_data.response).price;
        }
        else if(this.readyState == 4) {
            console.log('err')
        }
    }
    req.open("GET", "https://api.binance.com/api/v3/ticker/price?symbol=" + symbol, async);
    req.send();

    return tempPrice;
}