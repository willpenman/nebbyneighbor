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

    // Create title
    const title = document.createElement('h2');
    title.textContent = this.config.title;
    title.className = 'modal-title';

    // Create message
    const message = document.createElement('p');
    message.textContent = this.config.message;
    message.className = 'modal-message';

    modalContent.appendChild(title);
    modalContent.appendChild(message);

    // Add primary button if provided
    if (this.config.primaryButton) {
      const button = document.createElement('button');
      button.textContent = this.config.primaryButton.text;
      button.onclick = this.config.primaryButton.onClick;
      
      const isSecondary = this.config.primaryButton.style === 'secondary';
      button.className = `modal-button ${isSecondary ? 'modal-button-secondary' : 'modal-button-primary'}`;

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