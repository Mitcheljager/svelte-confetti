import { render } from "@testing-library/svelte"
import { describe, expect, it } from "vitest"

import Confetti from "$lib/Confetti.svelte"

/**
 * @param {HTMLElement} element
 * @param {string} variable
 * @returns {string}
 */
function getCSSVariable(element, variable) {
  return element.style.getPropertyValue(variable) || ""
}

describe("Confetti.svelte", () => {
  it("Should render with 50 confetti pieces by default", () => {
    const { container } = render(Confetti)

    expect(container.querySelectorAll(".confetti")).toHaveLength(50)
  })

  it("Should render with the given amount of confetti pieces", () => {
    const { container } = render(Confetti, { amount: 42 })

    expect(container.querySelectorAll(".confetti")).toHaveLength(42)
  })

  it("Should render pieces up to given size", () => {
    const { container } = render(Confetti, { size: 5 })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))

    expect(getCSSVariable(element, "--size")).toBe("5px")
  })

  it("Should render pieces with x multipliers between given range", () => {
    const { container } = render(Confetti, { amount: 500, x: [-5, 5] })

    const elements = /** @type {HTMLElement[]} */(Array.from(container.querySelectorAll(".confetti")))
    const ranges = elements.map(element => parseInt(getCSSVariable(element, "--translate-x-multiplier")))

    expect(ranges.every(i => i >= -5 && i <= 5)).toBeTruthy()
  })

  it("Should render pieces with y multipliers between given range", () => {
    const { container } = render(Confetti, { amount: 500, y: [-5, 5] })

    const elements = /** @type {HTMLElement[]} */(Array.from(container.querySelectorAll(".confetti")))
    const ranges = elements.map(element => parseInt(getCSSVariable(element, "--translate-y-multiplier")))

    expect(ranges.every(i => i >= -5 && i <= 5)).toBeTruthy()
  })

  it("Should apply the given duration", () => {
    const { container } = render(Confetti, { duration: 5000 })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti"))

    expect(getCSSVariable(element, "--transition-duration")).toBe("5000ms")
  })

  it("Should be given duration based on scale when infinite is given", () => {
    const { container } = render(Confetti, { infinite: true })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti"))

    expect(getCSSVariable(element, "--transition-duration")).toContain("--scale")
  })

  it("Should render pieces with delay between given range", () => {
    const { container } = render(Confetti, { amount: 500, delay: [-50, 50] })

    const elements = /** @type {HTMLElement[]} */(Array.from(container.querySelectorAll(".confetti")))
    const ranges = elements.map(element => parseInt(getCSSVariable(element, "--transition-delay")))

    expect(ranges.every(i => i >= -50 && i <= 50)).toBeTruthy()
    expect(getCSSVariable(elements[0], "--transition-delay")).toContain("ms")
  })

  it("Should render pieces with colors between given range", () => {
    const { container } = render(Confetti, { amount: 5, colorRange: [20, 150] })

    const elements = /** @type {HTMLElement[]} */(Array.from(container.querySelectorAll(".confetti")))
    const ranges = elements.map(element => parseInt(getCSSVariable(element, "--color").split(",")[0].split("(")[1]))

    expect(ranges.every(i => i >= 20 && i <= 180)).toBeTruthy()
  })

  it("Should render pieces with colors given in array", () => {
    const colorArray = ["#fff", "rgba(255, 255, 255, 0.5)", "red"]
    const { container } = render(Confetti, { amount: 5, colorArray })

    const elements = /** @type {HTMLElement[]} */(Array.from(container.querySelectorAll(".confetti")))
    const colors = elements.map(element => getCSSVariable(element, "--color"))

    expect(colors.every(i => colorArray.includes(i))).toBeTruthy()
  })

  it("Should apply the given iteration count", () => {
    const { container } = render(Confetti, { iterationCount: 3 })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(getCSSVariable(element, "--transition-iteration-count")).toBe("3")
  })

  it("Should apply the given fall distance", () => {
    const { container } = render(Confetti, { fallDistance: "50px" })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(getCSSVariable(element, "--fall-distance")).toBe("50px")
  })

  it("Should have rounded class when prop is given", () => {
    const { container } = render(Confetti, { rounded: true })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).toContain("rounded")
  })

  it("Should not have rounded class when prop is not given", () => {
    const { container } = render(Confetti)

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).not.toContain("rounded")
  })

  it("Should not have rounded class when prop is false", () => {
    const { container } = render(Confetti, { rounded: false })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).not.toContain("rounded")
  })

  it("Should have cone class when prop is given", () => {
    const { container } = render(Confetti, { cone: true })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).toContain("cone")
  })

  it("Should have no-gravity class when prop is given", () => {
    const { container } = render(Confetti, { noGravity: true })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).toContain("no-gravity")
  })

  it("Should not have no-gravity class when prop is not given", () => {
    const { container } = render(Confetti)

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).not.toContain("no-gravity")
  })

  it("Should not have no-gravity class when prop is false", () => {
    const { container } = render(Confetti, { noGravity: false })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).not.toContain("no-gravity")
  })

  it("Should render pieces with given xSpread", () => {
    const { container } = render(Confetti, { xSpread: 0.25 })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(getCSSVariable(element, "--x-spread")).toBe("0.75")
  })

  it("Should not add class for reduced motion when prop is given", () => {
    const { container } = render(Confetti, { disableForReducedMotion: true })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).toContain("reduced-motion")
  })

  it("Should not add class for reduced motion when prop is false", () => {
    const { container } = render(Confetti, { disableForReducedMotion: false })

    const element = /** @type {HTMLElement} */ (container.querySelector(".confetti-holder"))
    expect(element.classList).not.toContain("reduced-motion")
  })
})
