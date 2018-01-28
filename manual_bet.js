// user config variable
var startValue = '0.00000001', // start value of BET AMOUNT
    startPayout = '2.00',      // start value of PAYOUT
    stopPercentage = 0.80,     // stop betting if balance is under this percentage
    maxWait = 666,             // max waiting time for next bet
    stopBefore = 30,           // In seconds for timer before stopping redirect on webpage
    $hiloButton = $('#double_your_btc_bet_hi_button');  // set as $('#double_your_btc_bet_hi_button') or $('#double_your_btc_bet_lo_button')

// system variable (DON'T SET)
var stopped = false,
    loseCount = 0,
    startBalance = 0,
    startTimestamp = 0;

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

function getRandomWait() {
    var wait = Math.floor(Math.random() * maxWait) + 100;
    // console.log('Waiting for ' + wait + 'ms before next bet.');
    return wait;
}

function deExponentize(number) {
    return number * 100000000;
}

function initGame() {

    // try to free roll
    if ($('#free_play_form_button').is(':visible')) {
        $('#free_play_form_button').click();
        sleep(1500);
    }

    // switch to auto bet tab
    if (!$('#double_your_btc_bet_hi_button').is(':visible')) {
        $(".double_your_btc_link2").click();

        // switch to manual bet
        if (!$('#double_your_btc_bet_hi_button').is(':visible')) {
            $('#manual_bet_on').click();
        }
    }

    startBalance = deExponentize(parseFloat($('#balance').text()));
    startTimestamp = new Date().getTime();
}

function getProfitLoss() {
    return deExponentize(parseFloat($('#balance').text())) - startBalance;
}

function getElapsed() {
    var now = new Date().getTime();
    var min = ((now - startTimestamp) / 60000).toFixed(0);
    var sec = (((now - startTimestamp) % 60000) / 1000).toFixed(0);
    return min + 'm' + sec + 's';
}

function multiplyBet() {
    var current = $('#double_your_btc_stake').val();
    var payout = '2.00';

    loseCount++;

    if (loseCount < 7) {
        multiplier = 2.1;
        payout = '2.00';
    } else if (loseCount < 15) {
        multiplier = 1.55;
        payout = '3.00';
    } else if (loseCount < 22) {
        multiplier = 1.35;
        payout = '4.00';
    } else if (loseCount < 31) {
        multiplier = 1.3;
        payout = '5.00';
    } else {
        multiplier = 1.25;
        payout = '6.00';
    }

    $('#double_your_btc_payout_multiplier').val(payout).keyup();

    if (loseCount == 0) {
        $('#double_your_btc_stake').val('0.00000002');
    } else if (loseCount == 7) {
        console.log('loseCount: ' + loseCount);
        console.log('payout: ' + payout);
        $('#double_your_btc_stake').val('0.00000160');
    } else if (loseCount == 15) {
        console.log('loseCount: ' + loseCount);
        console.log('payout: ' + payout);
        $('#double_your_btc_stake').val('0.00003500');
    } else if (loseCount == 22) {
        $('#double_your_btc_stake').val('0.00028000');
    } else if (loseCount == 31) {
        $('#double_your_btc_stake').val('0.00160000');
    } else {
        var multiply = (current * multiplier).toFixed(8);
        $('#double_your_btc_stake').val(multiply);
    }
}

function startGame() {
    console.log('Game started!');
    reset();
    $hiloButton.click();
}

function stopGame() {
    console.log('Game will stop soon! Let me finish.');
    stopped = true;
}

function reset() {
    loseCount = 0;
    $('#double_your_btc_stake').val(startValue);
    $('#double_your_btc_payout_multiplier').val(startPayout).keyup();
}

function hasEnoughMoney() {
    var balance = deExponentize(parseFloat($('#balance').text()));
    var current = deExponentize($('#double_your_btc_stake').val());

    return balance * stopPercentage > current;
}

function clickFreeRoll() {
    $('#free_play_form_button').click()
}

function stopBeforeRedirect() {
    var temp = $('title').text().match(/(\d+)/g);
    if (temp == null) {
        return;
    }

    var seconds = parseInt(temp[0]) * 60 + parseInt(temp[1]);
    if (seconds < stopBefore) {
        return true;
    }

    return false;
}

$('#double_your_btc_bet_lose').unbind();
$('#double_your_btc_bet_win').unbind();
$('#double_your_btc_bet_lose').bind("DOMSubtreeModified", function(event) {
    if ($(event.currentTarget).is(':contains("lose")')) {
        console.log('You LOST, PL: ' + getProfitLoss() + ', Elapsed: ' + getElapsed());
        multiplyBet();
        setTimeout(function() {
            $hiloButton.click();
        }, getRandomWait());
    }
});
$('#double_your_btc_bet_win').bind("DOMSubtreeModified", function(event) {
    if ($(event.currentTarget).is(':contains("win")')) {
        if (stopBeforeRedirect()) {
            console.log('Approaching redirect! Stop the game so we don\'t get redirected while loosing.');
            stopGame();

            return;
        }
        if (hasEnoughMoney()) {
            console.log('You WON, PL: ' + getProfitLoss() + ' elapsed: ' + getElapsed());
            reset();
            if (stopped) {
                stopped = false;

                return false;
            }
        } else {
            console.log('no money');
            return;
        }
        setTimeout(function() {
            $hiloButton.click();
        }, getRandomWait());
    }
});

initGame();
startGame();
