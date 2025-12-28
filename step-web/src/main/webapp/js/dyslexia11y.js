const DYSLEXIC_FONT_STYLE_ID = 'dyslexic-font-style';
const DYSLEXIC_FONT_NAME = 'OpenDyslexic';
const DYSLEXIC_FONT_PATH = '../fonts/OpenDyslexic-Regular.otf';
const DYSLEXIC_FONT_STORAGE_KEY = 'dyslexicFont';
const DYSLEXIC_BUTTON_ID = 'openDyslexicButton';
const DYSLEXIC_BUTTON_CLASS = 'stepPressedButton';
const STORAGE_TRUE_VALUE = 'true';
const STORAGE_FALSE_VALUE = 'false';
const LOGGER_PREFIX = '[Dyslexia11y]';
// CSS Selector segments for dyslexic font styling
const PRESERVE_FONT_SELECTORS = '[preserve-font], [preserve-font] *, :has([preserve-font])';
const GLYPHICON_SELECTORS = '.glyphicon, .glyphicon *';
const NON_ENGLISH_SELECTORS = ':not(:lang(en)), :not(:lang(en)) *, :has(:not(:lang(en)))';
const DEBUG_DYSLEXIA = localStorage.getItem('debugDyslexia') === 'true' || new URLSearchParams(window.location.search).has('debug');

const loadedFonts = new Set();

const logger = {
    debug: (...args) => {
        if (DEBUG_DYSLEXIA)
            console.debug(LOGGER_PREFIX, ...args);
    },
    info: (...args) => {
        if (DEBUG_DYSLEXIA)
            console.info(LOGGER_PREFIX, ...args);
    },
    warn: (...args) => {
        if (DEBUG_DYSLEXIA)
            console.warn(LOGGER_PREFIX, ...args);
    },
    error: (...args) => {
        if (DEBUG_DYSLEXIA)
            console.error(LOGGER_PREFIX, ...args);
    }
};

export async function loadFont(fontName, fontPath) {
    if (loadedFonts.has(fontName)) {
        logger.info(`Font "${fontName}" is already loaded. Skipping load.`);
        return;
    }

    const font = new FontFace(fontName, `url('${fontPath}')`);
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
    loadedFonts.add(fontName);
}

function applyDynamicFontRule(fontName, shouldRemove) {
    const styleElement = $(`#${DYSLEXIC_FONT_STYLE_ID}`);
    if (!shouldRemove) {
        if (styleElement.length === 0) {
            const newStyleElement = $('<style></style>').attr('id', DYSLEXIC_FONT_STYLE_ID);
            $('head').append(newStyleElement);
            newStyleElement.text(generateDyslexicFontCSS(fontName));
        } else {
            logger.info('Dyslexic font style is already applied. No update needed.');
        }
    } else if (styleElement.length > 0) {
        styleElement.remove();
    } else {
        logger.info('No dyslexic font style found to remove.');
    }
}

function generateDyslexicFontCSS(fontName) {
    return `
      html:lang(en) *:not(:where(${PRESERVE_FONT_SELECTORS}, ${GLYPHICON_SELECTORS}, ${NON_ENGLISH_SELECTORS})) {
        font-family: '${fontName}' !important;
      }
      html:not(:lang(en)) *:lang(en) {
        font-family: ${fontName} !important;
      }
  `;
}

export async function initDyslexia11y() {
    const stepWindow = window;
    const htmlElement = $('html');

    if (!htmlElement.attr('lang') && stepWindow.step?.userLanguageCode) {
        htmlElement.attr('lang', stepWindow.step.userLanguageCode);
    } else {
        logger.info('HTML language attribute already set. Skipping language initialization.');
    }

    const isDyslexiaEnabled = isDyslexiaFontEnabled();
    if (isDyslexiaEnabled) {
        await enableDyslexiaFont();
    } else {
        logger.info('Dyslexia-friendly font is disabled on initialization.');
    }

    $(document).on('click', (event) => {
        const targetElement = $(event.target);

        if (targetElement.attr('id') === DYSLEXIC_BUTTON_ID) {
            const htmlLang = htmlElement.attr('lang') ?? '';
            const hasAnyEnglishlement = $('[lang="en"], :lang(en)').length > 5;

            if (htmlLang.toLowerCase() !== 'en' && !hasAnyEnglishlement) {
                console.warn(`HTML lang "${htmlLang}" is not "en" and no element with lang="en" was found.`);
                // Add an inline message to alert users.
            } else {
                logger.info(htmlLang === 'en'
                    ? `HTML lang is "en". No issue detected.`
                    : `HTML lang "${htmlLang}" is not "en", but an element with lang="en" was found.`);
            }

            void handleDyslexiaToggleClick(targetElement, stepWindow);
        } else {
            logger.info('Click event detected, but target is not the dyslexia toggle button.');
        }
    });
}

function isDyslexiaFontEnabled() {
    return localStorage.getItem(DYSLEXIC_FONT_STORAGE_KEY) === STORAGE_TRUE_VALUE;
}

function setDyslexiaFontEnabled(enabled) {
    const storageValue = enabled ? STORAGE_TRUE_VALUE : STORAGE_FALSE_VALUE;
    localStorage.setItem(DYSLEXIC_FONT_STORAGE_KEY, storageValue);
}

async function handleDyslexiaToggleClick(buttonElement, stepWindow) {
    if (isDyslexiaFontEnabled()) {
        disableDyslexiaFont();
        buttonElement.text(stepWindow.__s.enable);
        buttonElement.removeClass(DYSLEXIC_BUTTON_CLASS);
    } else {
        await enableDyslexiaFont();
        buttonElement.text(stepWindow.__s.disable);
        buttonElement.addClass(DYSLEXIC_BUTTON_CLASS);
    }
}

async function enableDyslexiaFont() {
    try {
        await loadFont(DYSLEXIC_FONT_NAME, DYSLEXIC_FONT_PATH);
        applyDynamicFontRule(DYSLEXIC_FONT_NAME, false);
        setDyslexiaFontEnabled(true);
    } catch (error) {
        console.error('Failed to enable dyslexia-friendly font:', error);
    }
}

function disableDyslexiaFont() {
    applyDynamicFontRule(DYSLEXIC_FONT_NAME, true);
    setDyslexiaFontEnabled(false);
}
