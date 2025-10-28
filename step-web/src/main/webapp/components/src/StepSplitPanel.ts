import WaSplitPanel from '../node_modules/@awesome.me/webawesome/dist-cdn/components/split-panel/split-panel.js';

// Color Constants
const DIVIDER_ACTIVE_COLOR = '#17758F';
const NEUTRAL_BORDER_COLOR = '#c7c9d0';
const NEUTRAL_ON_NORMAL_COLOR = '#424554';
const FOCUS_COLOR = '#3e96ff';

// DOM Attribute Constants
const DIVIDER_PART_ATTRIBUTE = 'divider';
const DATA_DRAGGING_ATTRIBUTE = 'data-dragging';
const STYLE_ELEMENT_ID = 'step-split-panel-styles';

// CSS Custom Property Names
const CSS_MIN_PROPERTY = '--min';
const CSS_MAX_PROPERTY = '--max';
const CSS_DIVIDER_WIDTH_PROPERTY = '--divider-width';
const CSS_DIVIDER_HIT_AREA_PROPERTY = '--divider-hit-area';

// Focus Ring Styles
const FOCUS_RING_STYLE = 'solid';
const FOCUS_RING_WIDTH = '0.1875rem';

// Keyboard Constants
const ESCAPE_KEY = 'Escape';

// CSS Class Names
const DIVIDER_CLASS_NAME = 'divider';

/**
 * Extended Web Awesome Split Panel component with enhanced drag styling.
 * Provides visual feedback during divider dragging operations and keyboard support.
 */
export class StepSplitPanel extends WaSplitPanel {
  private boundHandlePointerRelease = () => {
    this.removeDragStateIndicator();
  };

  private boundHandleEscapeKey = (event: Event) => {
    this.handleEscapeKeyPress(event as KeyboardEvent);
  };

  constructor() {
    super();

    this.attachGlobalEventListeners();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.injectCustomStyles();
    this.attachDividerDragListeners();
  }

  override disconnectedCallback(): void {
    this.removeGlobalEventListeners();
    super.disconnectedCallback();
  }

  /**
   * Attaches global event listeners for pointer release and keyboard events.
   * These listeners handle drag termination from anywhere in the window.
   */
  private attachGlobalEventListeners(): void {
    window.addEventListener('pointerup', this.boundHandlePointerRelease);
    window.addEventListener('pointercancel', this.boundHandlePointerRelease);
    window.addEventListener('keydown', this.boundHandleEscapeKey);
  }

  /**
   * Removes global event listeners to prevent memory leaks.
   */
  private removeGlobalEventListeners(): void {
    window.removeEventListener('pointerup', this.boundHandlePointerRelease);
    window.removeEventListener('pointercancel', this.boundHandlePointerRelease);
    window.removeEventListener('keydown', this.boundHandleEscapeKey);
  }

  /**
   * Injects custom CSS styles into the shadow DOM.
   * Includes original styles from Web Awesome library to avoid external CSS dependencies.
   * Source: https://github.com/shoelace-style/webawesome/blob/next/packages/webawesome/src/components/split-panel/split-panel.css
   */
  private injectCustomStyles(): void {
    const shadowRoot = this.shadowRoot;
    if (!shadowRoot) {
      console.warn('Shadow root not available for style injection');
      return;
    }

    let styleElement = shadowRoot.querySelector<HTMLStyleElement>(
      `#${STYLE_ELEMENT_ID}`
    );
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = STYLE_ELEMENT_ID;
      shadowRoot.appendChild(styleElement);
    }

    styleElement.textContent = this.generateStylesheet();
  }

  /**
   * Generates the complete CSS stylesheet for the split panel component.
   * @returns CSS string with all component styles
   */
  private generateStylesheet(): string {
    return `
      :host {
        ${CSS_MIN_PROPERTY}: 0%;
        ${CSS_MAX_PROPERTY}: 100%;
        --wa-color-neutral-border-normal: ${NEUTRAL_BORDER_COLOR};
        --wa-color-neutral-on-normal: ${NEUTRAL_ON_NORMAL_COLOR};
        --wa-focus-ring-style: ${FOCUS_RING_STYLE};
        --wa-focus-ring-width: ${FOCUS_RING_WIDTH};
        --wa-color-focus: ${FOCUS_COLOR};
        --wa-focus-ring: var(--wa-focus-ring-style) var(--wa-focus-ring-width) var(--wa-color-focus);

        display: grid;
      }

      .start,
      .end {
        overflow: hidden;
      }

      .${DIVIDER_CLASS_NAME} {
        flex: 0 0 var(${CSS_DIVIDER_WIDTH_PROPERTY});
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        background-color: var(--wa-color-neutral-border-normal);
        color: var(--wa-color-neutral-on-normal);
        z-index: 1;
      }

      .${DIVIDER_CLASS_NAME}:focus {
        outline: none;
      }

      :host(:not([disabled])) .${DIVIDER_CLASS_NAME}:focus-visible {
        outline: var(--wa-focus-ring);
      }

      :host([disabled]) .${DIVIDER_CLASS_NAME} {
        cursor: not-allowed;
      }

      /* Horizontal */
      :host(:not([orientation='vertical'], [disabled])) .${DIVIDER_CLASS_NAME} {
        cursor: col-resize;
      }

      :host(:not([orientation='vertical'])) .${DIVIDER_CLASS_NAME}::after {
        display: flex;
        content: '';
        position: absolute;
        height: 100%;
        left: calc(var(${CSS_DIVIDER_HIT_AREA_PROPERTY}) / -2 + var(${CSS_DIVIDER_WIDTH_PROPERTY}) / 2);
        width: var(${CSS_DIVIDER_HIT_AREA_PROPERTY});
      }

      /* Vertical */
      :host([orientation='vertical']) {
        flex-direction: column;
      }

      :host([orientation='vertical']:not([disabled])) .${DIVIDER_CLASS_NAME} {
        cursor: row-resize;
      }

      :host([orientation='vertical']) .${DIVIDER_CLASS_NAME}::after {
        content: '';
        position: absolute;
        width: 100%;
        top: calc(var(${CSS_DIVIDER_HIT_AREA_PROPERTY}) / -2 + var(${CSS_DIVIDER_WIDTH_PROPERTY}) / 2);
        height: var(${CSS_DIVIDER_HIT_AREA_PROPERTY});
      }

      @media (forced-colors: active) {
        .${DIVIDER_CLASS_NAME} {
          outline: solid 1px transparent;
        }
      }

      :host([${DATA_DRAGGING_ATTRIBUTE}]) .${DIVIDER_CLASS_NAME} {
        background: ${DIVIDER_ACTIVE_COLOR} !important;
      }
    `;
  }

  /**
   * Checks if the divider element is in the event's composed path.
   * @param event - The event to check
   * @returns True if divider is in the event path
   */
  private isDividerElementInEventPath(event: Event): boolean {
    return event
      .composedPath()
      .some(
        (eventTarget) =>
          eventTarget instanceof Element &&
          (eventTarget.getAttribute('part') === DIVIDER_PART_ATTRIBUTE ||
            eventTarget.classList.contains(DIVIDER_CLASS_NAME))
      );
  }

  /**
   * Applies the dragging state indicator to the split panel.
   * This triggers visual feedback during drag operations.
   */
  private applyDragStateIndicator(): void {
    this.setAttribute(DATA_DRAGGING_ATTRIBUTE, '');
  }

  /**
   * Removes the dragging state indicator from the split panel.
   * This removes visual feedback when dragging ends.
   */
  private removeDragStateIndicator(): void {
    this.removeAttribute(DATA_DRAGGING_ATTRIBUTE);
  }

  /**
   * Handles the Escape key press to cancel ongoing drag operations.
   * @param event - The keyboard event
   */
  private handleEscapeKeyPress(event: KeyboardEvent): void {
    if (event.key === ESCAPE_KEY) {
      this.removeDragStateIndicator();
    }
  }

  /**
   * Attaches event listeners for divider drag interactions.
   * Handles pointer capture and drag state management.
   */
  private attachDividerDragListeners(): void {
    this.addEventListener('pointerdown', (event: PointerEvent) => {
      if (this.isDividerElementInEventPath(event)) {
        event.stopPropagation();

        const targetElement = event.target as Element;
        if (targetElement && 'setPointerCapture' in targetElement) {
          try {
            (targetElement as HTMLElement).setPointerCapture(event.pointerId);
          } catch (captureError) {
            console.debug(
              'Pointer capture failed. This may occur in some browser contexts.',
              captureError
            );
          }
        }

        this.applyDragStateIndicator();
      }
    });
  }
}

// Register the custom element in the browser's custom element registry
customElements.define('step-split-panel', StepSplitPanel);
