const leichteSpracheButton = document.getElementById('leichteSprache')

if (leichteSpracheButton) {
    leichteSpracheButton.addEventListener('click', () => {
        chrome.runtime.sendMessage(
            {
                action: 'wait for click',
                mode: "leicht"
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Fehler:", chrome.runtime.lastError);
                } else {
                    console.log("Antwort vom Background:", response);
                }
            }
        );


    })
} else {
    throw new Error("there is no Button with the id 'leichteSprache'")
}


