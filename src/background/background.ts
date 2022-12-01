import { CONTENT_SCRIPT_PORT } from '../content-scripts/message-types';
import type { LegacyMessageFromContentScript } from '../content-scripts/message-types';
import {
  handleLegacyExternalMethodFormat,
  inferLegacyMessage,
} from './legacy-external-message-handler';
import internalBackgroundMessageHandler from './messageHandlers';

// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;

  port.onMessage.addListener((message: LegacyMessageFromContentScript, port) => {
    if (inferLegacyMessage(message)) {
      void handleLegacyExternalMethodFormat(message, port);
      // eslint-disable-next-line no-useless-return
      return;
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void internalBackgroundMessageHandler(message, sender, sendResponse);
  // Listener fn must return `true` to indicate the response will be async
  return true;
});
