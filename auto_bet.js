var baseValue = '0.00000001',           // value of BASE BET
    rollCount = 100000,
    increaseBetPercentWhenLose = 110,   // multiplier when you lose
    stopBefore = 1,                     // In minutes for timer before stopping redirect on webpage
    $betOn = $('#autobet_bet_hi');      // set as $('#autobet_bet_hi') or $('#autobet_bet_lo') or $('#autobet_bet_alternate')

function switchTab() {
    if (!$('#auto_bet_on').is(':visible')) {
        $(".double_your_btc_link2").click();
        $('#auto_bet_on').click();
    }
}

function watchDog() {
    console.log('Wake up to check');
    if (stopBeforeRedirect()) {
        console.log('Approaching redirect! Stop the game so we don\'t get redirected while loosing.');

        $('#double_your_btc_bet_win').bind("DOMSubtreeModified", function(event) {
            if ($(event.currentTarget).is(':contains("win")')) {
                stopGame();
            }
        });

        return;
    }

    if (rollFinished()) {
        console.log('Auto bet is finished, restart it.');
        reset();
        $('#start_autobet').click();
    }

    setTimeout(watchDog, 10000);
}

function startGame() {
    if ($('#stop_autobet_button').is(':visible')) {
        console.log('Game has started!');
        return;
    }

    switchTab();

    setTimeout(watchDog, 10000);

    reset();
    $('#start_autobet').click();
}

function stopGame() {
    $('#stop_autobet_button').click();
}

function reset() {
    $('#autobet_base_bet').val(baseValue);
    $('#autobet_roll_count').val(rollCount);
    if (!$('#autobet_lose_increase_bet').is(':checked')) {
        $('#autobet_lose_increase_bet').click();
    }
    $('#autobet_lose_increase_bet_percent').val(increaseBetPercentWhenLose);

    if (!$betOn.is(':checked')) {
        $betOn.click();
    }
}

function rollFinished() {
    return parseInt($('#rolls_remaining_count').html()) <= 0;
}

function stopBeforeRedirect() {
    var minutes = parseInt($('title').text());
    if (isNaN(minutes)) {
        return false;
    }

    if (minutes < stopBefore) {
        return true;
    }

    return false;
}

startGame();
