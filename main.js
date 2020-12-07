const { app, BrowserWindow } = require('electron');

// exit during squirrel installation
if (require('electron-squirrel-startup')) {
    return app.quit();
}

const osc = require('osc');

// Crowdpurr OSC messages
const LAUNCH_PROJECTOR_VIEW = 'launchProjectorView';
const LAUNCH_MOBILE_VIEW = 'launchMobileView';
const START_EXPERIENCE = 'startExperience';
const FINISH_EXPERIENCE = 'finishExperience';
const RESTART_EXPERIENCE = 'restartExperience';
const PAUSE_EXPERIENCE = 'pauseExperience';
const UNPAUSE_EXPERIENCE = 'unPauseExperience';
const START_QUESTION = 'startQuestion';
const PREVIOUS_QUESTION = 'previousQuestion';
const NEXT_QUESTION = 'nextQuestion';
const SHOW_ANSWER_RESULTS = 'showAnswerResults';
const SHOW_CURRENT_ANSWER = 'showCorrectAnswer';
const SHOW_QUESTION_NOTES = 'showQuestionNote';
// TODO
// const SHOW_LIVE_STREAM = 'showLiveStreamButton';
const SHOW_RANKINGS = 'showRankings';
const SHOW_MULTIGAME_RANKINGS = 'showMultiGameRankings';
const SHOW_TEAM_RANKINGS = 'showTeamRankings';
const TRIGGER_NEXT_ROUND = 'triggerNextRound';

const btnId = (message) => {
    return `${message}Button`;
}

const confirmBtnId = (message) => {
    const first = message.charAt(0).toUpperCase();
    const rest = message.substring(1);
    return `confirm${first}${rest}Button`;
}

// Renderer payloads for OSC messages
const oscPayload = {
    [LAUNCH_PROJECTOR_VIEW]: { id: 'launchVizButton' },
    [LAUNCH_MOBILE_VIEW]: { id: 'launchMobileButton', },
    [START_EXPERIENCE]: { id: btnId(START_EXPERIENCE), confirmId: confirmBtnId(START_EXPERIENCE) },
    [FINISH_EXPERIENCE]: { id: btnId(FINISH_EXPERIENCE), confirmId: confirmBtnId(FINISH_EXPERIENCE) },
    [RESTART_EXPERIENCE]: { id: btnId(RESTART_EXPERIENCE), confirmId: 'confirmHardResetExperienceButton', reconfirm: true} ,
    [PAUSE_EXPERIENCE]: { id: btnId(PAUSE_EXPERIENCE) },
    [UNPAUSE_EXPERIENCE]: { id: btnId(UNPAUSE_EXPERIENCE) },
    [START_QUESTION]: { id: btnId(START_QUESTION) },
    [PREVIOUS_QUESTION]: { id: btnId(PREVIOUS_QUESTION) },
    [NEXT_QUESTION]: { id: btnId(NEXT_QUESTION) },
    [SHOW_ANSWER_RESULTS]: { id: btnId(SHOW_ANSWER_RESULTS) },
    [SHOW_CURRENT_ANSWER]: { id: btnId(SHOW_CURRENT_ANSWER) },
    [SHOW_QUESTION_NOTES]: { id: btnId(SHOW_QUESTION_NOTES) },
    // TODO
    // [SHOW_LIVE_STREAM]: { id: btnId(SHOW_LIVE_STREAM) },
    [SHOW_RANKINGS]: { id: btnId(SHOW_RANKINGS) },
    [SHOW_MULTIGAME_RANKINGS]: { id: btnId(SHOW_MULTIGAME_RANKINGS) },
    [SHOW_TEAM_RANKINGS]: { id: btnId(SHOW_TEAM_RANKINGS) },
    [TRIGGER_NEXT_ROUND]: { id: confirmBtnId(TRIGGER_NEXT_ROUND), confirmId: btnId(TRIGGER_NEXT_ROUND) },
}

let win;

let udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121,
    metadata: true,
});

function errorAlert(message) {
    win.webContents.executeJavaScript(`alert("Error: ${message}")`);
}

udpPort.on("message",  (oscMsg) => {
    const re = /\/cposc\/(.*)$/;
    const matches = re.exec(oscMsg.address);

    if (matches) {
        const msgId = matches[1];
        if (oscPayload[msgId]) {
            win.webContents.send('osc', oscPayload[msgId]);
        }
    }
});


udpPort.on("error", (err) => {
    console.log("OSC: an error occurred: ", err.message);
});

function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: `${__dirname}/app.ico`,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: `${__dirname}/renderer.js`,
        },
        devTools: false,
    });

    // win.webContents.openDevTools();
    win.loadURL('https://app.crowdpurr.com/');
}


app.whenReady().then(() => {
    udpPort.open();
    createWindow();
});


app.on('before-quit', () => {
    udpPort = null;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('browser-window-created', (e, window) => {
    window.menuBarVisible = false;
});
