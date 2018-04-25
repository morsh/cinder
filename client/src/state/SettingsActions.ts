import alt, { AbstractActions } from './alt';
let request = require('xhr-request');

export interface Settings {
  a: any;
}

interface SettingsActions {
  saveSettings(settings: Settings): Settings;
  saveSettingsAsync(settings: Settings): (dispatcher: (settings: Settings) => void) => void;
}

class SettingsActions extends AbstractActions implements SettingsActions {

  private loadListsTimeoutHandle?: NodeJS.Timer;

  setRedirectCheck() {
    if (typeof this.loadListsTimeoutHandle !== 'undefined') {
      clearTimeout(this.loadListsTimeoutHandle);
    }

    this.loadListsTimeoutHandle = setTimeout(
      () => {

        if (typeof this.loadListsTimeoutHandle === 'undefined') { return; }

        if (window.location.host === 'localhost:3000') {
          let iframe = document.createElement('iframe');
          iframe.style.display = 'block';
          iframe.style.top = '0';
          iframe.style.zIndex = '20';
          iframe.style.position = 'absolute';
          iframe.src = 'http://localhost:4000';
          iframe.style.width = '300px';
          iframe.style.height = '300px';
          
          iframe.onload = () => {
            if (typeof this.loadListsTimeoutHandle !== 'undefined') {
              window.location.reload(true);
            } else {
              iframe.remove();
            }
          };
          document.body.appendChild(iframe);
        } else {
          window.location.replace('/auth/login?redirect_uri=%2f');
        }
      },
      3000
    );
  }

  clearRedirectCheck() {
    if (typeof this.loadListsTimeoutHandle !== 'undefined') {
      clearTimeout(this.loadListsTimeoutHandle);
      this.loadListsTimeoutHandle = undefined;
    }
  }
  
  saveSettings(settings: Settings) {
    return settings;
  }

  saveSettingsAsync(settings: Settings) {

    this.setRedirectCheck();

    return (dispatcher: (settings: Settings) => void) => {

      request(
        '/api', 
        { json: true }, 
        (err: Error, data: {}) => {
          if (err) { 
            throw err;
          }

          this.clearRedirectCheck();
          
          // the JSON result
          return dispatcher({ a: JSON.stringify(data) });
        }
      );

      // setTimeout(
      //   () => { dispatcher(settings); },
      //   2000
      // );
    };
  }
}

export default alt.createActions<SettingsActions>(SettingsActions);