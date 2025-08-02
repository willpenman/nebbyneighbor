export type ModalConfig = {
  title: string;
  message: string;
  primaryButton?: {
    text: string;
    onClick: () => void;
    style?: 'primary' | 'secondary';
  };
  onDismiss?: () => void;
  allowInspectMode?: boolean;
  preventNeighborRemoval?: boolean;
};

export class Modal {
  private element: HTMLElement | null = null;
  private config: ModalConfig | null = null;
  private isVisible: boolean = false;

  show(config: ModalConfig) {
    this.config = config;
    this.isVisible = true;
    this.render();
  }

  hide() {
    this.isVisible = false;
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
      this.element = null;
    }
    this.config = null;
  }

  isShowing(): boolean {
    return this.isVisible;
  }

  getConfig(): ModalConfig | null {
    return this.config;
  }

  private render() {
    if (!this.config) return;

    // Remove existing modal if present
    if (this.element) {
      document.body.removeChild(this.element);
    }

    // Find the canvas to overlay
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas || !canvas.parentElement) return;

    // Create modal overlay positioned exactly over the canvas using absolute positioning
    this.element = document.createElement('div');
    this.element.className = 'modal-overlay';
    this.element.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      pointer-events: none;
    `;

    // Set the parent container to relative positioning if it isn't already
    const parent = canvas.parentElement;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // Append to the same parent as canvas so it flows naturally
    parent.appendChild(this.element);

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
      background: transparent;
      padding: 24px;
      text-align: center;
      pointer-events: none;
    `;

    // Create title
    const title = document.createElement('h2');
    title.textContent = this.config.title;
    title.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
      color: #2D5016;
      text-shadow: 0 1px 2px rgba(45, 80, 22, 0.1);
    `;

    // Create message
    const message = document.createElement('p');
    message.textContent = this.config.message;
    message.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 16px;
      color: #4A4A4A;
      line-height: 1.4;
    `;

    modalContent.appendChild(title);
    modalContent.appendChild(message);

    // Add primary button if provided
    if (this.config.primaryButton) {
      const button = document.createElement('button');
      button.textContent = this.config.primaryButton.text;
      button.onclick = this.config.primaryButton.onClick;
      
      const isSecondary = this.config.primaryButton.style === 'secondary';
      button.style.cssText = `
        background: ${isSecondary ? 'transparent' : '#8B7355'};
        color: ${isSecondary ? '#8B7355' : 'white'};
        border: ${isSecondary ? '2px solid #8B7355' : 'none'};
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: ${isSecondary ? '0.7' : '0.9'};
        pointer-events: auto;
      `;
      
      // Add hover effects
      button.onmouseenter = () => {
        button.style.opacity = isSecondary ? '0.5' : '1';
        button.style.transform = 'translateY(-1px)';
      };
      button.onmouseleave = () => {
        button.style.opacity = isSecondary ? '0.7' : '0.9';
        button.style.transform = 'translateY(0)';
      };

      modalContent.appendChild(button);
    }

    this.element.appendChild(modalContent);

    // Add click outside to dismiss (if onDismiss is provided)
    if (this.config.onDismiss) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element && this.config?.onDismiss) {
          this.config.onDismiss();
        }
      });
    }

  }
}