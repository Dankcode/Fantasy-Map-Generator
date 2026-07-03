{
  const style = /* css */ `
    slider-input {
      display: flex;
      align-items: center;
      gap: .4em;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  styleElement.innerHTML = style;
  document.head.appendChild(styleElement);
}

{
  const template = document.createElement("template");
  template.innerHTML = /* html */ `
    <input type="range" />
    <input type="number" />
  `;

  class SliderInput extends HTMLElement {
    constructor() {
      super();
      this.appendChild(template.content.cloneNode(true));

      const range = this.querySelector("input[type=range]");
      const number = this.querySelector("input[type=number]");

      range.min = number.min = this.getAttribute("min") || 0;
      range.max = number.max = this.getAttribute("max") || 100;
      range.step = number.step = this.getAttribute("step") || 1;
      this.value = this.getAttribute("value") ?? (Number(range.min) + Number(range.max)) / 2;

      range.addEventListener("input", this.handleEvent.bind(this));
      number.addEventListener("input", this.handleEvent.bind(this));
      range.addEventListener("change", this.handleEvent.bind(this));
      number.addEventListener("change", this.handleEvent.bind(this));
    }

    handleEvent(e) {
      const value = this.clampValue(e.target.value);
      if (value === null) return e.stopPropagation();

      const range = this.querySelector("input[type=range]");
      const number = this.querySelector("input[type=number]");
      this.value = range.value = number.value = value;

      this.dispatchEvent(
        new CustomEvent(e.type, {
          detail: {value},
          bubbles: true,
          composed: true
        })
      );
    }

    set value(value) {
      const range = this.querySelector("input[type=range]");
      const number = this.querySelector("input[type=number]");
      const clamped = this.clampValue(value);
      if (clamped === null) return;
      range.value = number.value = clamped;
      this.setAttribute("value", clamped);
    }

    get value() {
      const number = this.querySelector("input[type=number]");
      if (!number) return this.getAttribute("value") || "";
      return number.value;
    }

    get valueAsNumber() {
      const number = this.querySelector("input[type=number]");
      if (!number) return Number(this.getAttribute("value"));
      return number.valueAsNumber;
    }

    clampValue(value) {
      if (value === "") return null;
      const numeric = Number(value);
      if (Number.isNaN(numeric)) return null;

      const range = this.querySelector("input[type=range]");
      const min = Number(range.min || 0);
      const max = Number(range.max || 100);
      return String(Math.min(max, Math.max(min, numeric)));
    }
  }

  customElements.define("slider-input", SliderInput);
}
