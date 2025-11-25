import { WebflowElementBase } from "./webflow-element-base";

/**
 * WebflowSlider - Manages Webflow slider component
 *
 * Provides programmatic control over Webflow .w-slider elements.
 * Handles slide navigation, autoplay, and slide callbacks.
 *
 * Example usage:
 * const slider = WebflowSlider.tryCreateFromId("#hero-slider");
 * if (slider) {
 *   slider.goToSlide(2);
 *   slider.pause();
 *   slider.onSlideChange((index) => console.log(`Slide ${index}`));
 * }
 */

export class WebflowSlider extends WebflowElementBase {
  private mask: HTMLElement | null;
  private slides: HTMLElement[];
  private leftArrow: HTMLElement | null;
  private rightArrow: HTMLElement | null;
  private nav: HTMLElement | null;
  private dots: HTMLElement[];
  private currentSlide: number = 0;
  private autoplayInterval: number | null = null;
  private autoplayDelay: number = 4000; // Default 4 seconds
  private changeCallbacks: Array<(index: number) => void> = [];

  constructor(element: HTMLElement) {
    super(element);

    // Find slider mask (w-slider-mask)
    this.mask = element.querySelector(".w-slider-mask");

    // Find all slides (w-slide)
    this.slides = Array.from(element.querySelectorAll(".w-slide"));

    // Find navigation arrows
    this.leftArrow = element.querySelector(".w-slider-arrow-left");
    this.rightArrow = element.querySelector(".w-slider-arrow-right");

    // Find navigation dots container
    this.nav = element.querySelector(".w-slider-nav");
    this.dots = Array.from(element.querySelectorAll(".w-slider-dot"));

    if (this.slides.length === 0) {
      console.warn("[WebflowSlider] No slides found");
    }

    // Find initial active slide
    const activeIndex = this.slides.findIndex((slide) =>
      slide.classList.contains("w-active")
    );
    this.currentSlide = activeIndex >= 0 ? activeIndex : 0;

    // Bind events
    this.bindEvents();

    // Check for autoplay attribute
    const autoplayAttr = element.getAttribute("data-autoplay");
    if (autoplayAttr === "true") {
      const delay = element.getAttribute("data-delay");
      if (delay) {
        this.autoplayDelay = parseInt(delay, 10);
      }
      this.play();
    }
  }

  /**
   * Validates that the element is a Webflow slider component
   */
  protected validate(element: HTMLElement): void {
    if (!element.classList.contains("w-slider")) {
      throw new Error(
        `Element must have .w-slider class. Received: ${element.tagName} with classes: ${element.className}`
      );
    }

    // Check for slider mask
    const mask = element.querySelector(".w-slider-mask");
    if (!mask) {
      throw new Error(".w-slider element must contain a .w-slider-mask");
    }
  }

  /**
   * Bind click events to arrows and dots
   */
  private bindEvents(): void {
    // Left arrow
    if (this.leftArrow) {
      this.leftArrow.addEventListener("click", () => this.prevSlide());
    }

    // Right arrow
    if (this.rightArrow) {
      this.rightArrow.addEventListener("click", () => this.nextSlide());
    }

    // Navigation dots
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goToSlide(index));
    });

    // Pause on hover (optional)
    this.element.addEventListener("mouseenter", () => {
      if (this.autoplayInterval) {
        this.pause();
      }
    });

    this.element.addEventListener("mouseleave", () => {
      const autoplayAttr = this.element.getAttribute("data-autoplay");
      if (autoplayAttr === "true") {
        this.play();
      }
    });
  }

  /**
   * Go to a specific slide by index
   * @param index The zero-based index of the slide to show
   * @returns this (for chaining)
   */
  goToSlide(index: number): this {
    if (index < 0 || index >= this.slides.length) {
      console.error(
        `[WebflowSlider] Invalid slide index: ${index}. Valid range: 0-${this.slides.length - 1}`
      );
      return this;
    }

    // Update current slide
    const previousSlide = this.currentSlide;
    this.currentSlide = index;

    // Update slides - hide all, show selected
    this.slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add("w-active");
        (slide as HTMLElement).style.opacity = "1";
        (slide as HTMLElement).style.transform = "translateX(0)";
        slide.setAttribute("aria-hidden", "false");
      } else {
        slide.classList.remove("w-active");
        (slide as HTMLElement).style.opacity = "0";
        slide.setAttribute("aria-hidden", "true");
      }
    });

    // Update navigation dots
    this.dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add("w-active");
        dot.setAttribute("aria-pressed", "true");
      } else {
        dot.classList.remove("w-active");
        dot.setAttribute("aria-pressed", "false");
      }
    });

    // Update arrow states
    this.updateArrowStates();

    // Trigger callbacks
    if (previousSlide !== index) {
      this.changeCallbacks.forEach((callback) => callback(index));
    }

    return this;
  }

  /**
   * Update arrow button states (disabled at edges if not looping)
   */
  private updateArrowStates(): void {
    if (this.leftArrow) {
      if (this.currentSlide === 0) {
        this.leftArrow.classList.add("w-disabled");
        this.leftArrow.setAttribute("aria-disabled", "true");
      } else {
        this.leftArrow.classList.remove("w-disabled");
        this.leftArrow.setAttribute("aria-disabled", "false");
      }
    }

    if (this.rightArrow) {
      if (this.currentSlide === this.slides.length - 1) {
        this.rightArrow.classList.add("w-disabled");
        this.rightArrow.setAttribute("aria-disabled", "true");
      } else {
        this.rightArrow.classList.remove("w-disabled");
        this.rightArrow.setAttribute("aria-disabled", "false");
      }
    }
  }

  /**
   * Go to the next slide (wraps around to first)
   * @returns this (for chaining)
   */
  nextSlide(): this {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    return this.goToSlide(nextIndex);
  }

  /**
   * Go to the previous slide (wraps around to last)
   * @returns this (for chaining)
   */
  prevSlide(): this {
    const prevIndex =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    return this.goToSlide(prevIndex);
  }

  /**
   * Start autoplay
   * @param delay Optional delay in milliseconds (uses default if not provided)
   * @returns this (for chaining)
   */
  play(delay?: number): this {
    if (delay) {
      this.autoplayDelay = delay;
    }

    // Clear existing interval
    if (this.autoplayInterval) {
      window.clearInterval(this.autoplayInterval);
    }

    // Start new interval
    this.autoplayInterval = window.setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);

    return this;
  }

  /**
   * Stop autoplay
   * @returns this (for chaining)
   */
  pause(): this {
    if (this.autoplayInterval) {
      window.clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    return this;
  }

  /**
   * Register a callback to be called when slide changes
   * @param callback Function to call with the new slide index
   * @returns this (for chaining)
   */
  onSlideChange(callback: (index: number) => void): this {
    this.changeCallbacks.push(callback);
    return this;
  }

  /**
   * Get the currently active slide index
   */
  getCurrentSlide(): number {
    return this.currentSlide;
  }

  /**
   * Get the total number of slides
   */
  getSlideCount(): number {
    return this.slides.length;
  }

  /**
   * Check if autoplay is active
   */
  isPlaying(): boolean {
    return this.autoplayInterval !== null;
  }
}
