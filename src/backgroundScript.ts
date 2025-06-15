import config from './config';
import { CphSubmitResponse, CphEmptyResponse } from './types';
import { handleSubmit } from './handleSubmit';
import log from './log';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.alarms.create("run_main_loop", { periodInMinutes: 0.05 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "run_main_loop") {
    mainLoop();
  }
});

async function mainLoop() {
  console.log("Hello from main loop");

  let cphResponse;
  try {
    const headers = new Headers();
    headers.append('cph-submit', 'true');

    const request = new Request(config.cphServerEndpoint.href, {
      method: 'GET',
      headers,
    });

    cphResponse = await fetch(request);

  } catch (err) {
    log('Error while fetching cph response', err);
    return;
  }

  if (!cphResponse.ok) {
    log('Error while fetching cph response', cphResponse);
    return;
  }

  const response: CphSubmitResponse | CphEmptyResponse = await cphResponse.json();

  if (response.empty) {
    log('Got empty valid response from CPH');
    return;
  }

  log('Got non-empty valid response from CPH');
console.log("came till here----------------")

  handleSubmit(
    response.problemName,
    response.languageId,
    response.sourceCode,
    response.url,
  );
}
