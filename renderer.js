const { ipcRenderer } = require('electron');
const experiencePath = /\/experienceSetup\/.*/
console.log('renderer: starting')

const confirm = (btnId, reconfirm) => {
    setTimeout(() => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.click();
            if (!!reconfirm) {
                confirm(btnId);
            }
        }
    }, 250);
}

ipcRenderer.on('osc', (event, message) => {
    if (experiencePath.test(location.pathname)) {
        if (message.id) {
            const btn = document.getElementById(message.id);
            if (btn) {
                btn.click();
                if (message.confirmId) {
                    confirm(message.confirmId, message.reconfirm);
                }
            } else {
                console.log('Unable to process message: ', message);
            }
        }
    } else {
        alert('You must open an Experience Control center to perform this action.');
    }

});
