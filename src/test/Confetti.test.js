import { render } from "@testing-library/svelte"
import { describe, expect, it } from "vitest"

import Confetti from "$lib/Confetti.svelte"

describe("Confetti.svelte", () => {
  it("Default Confetti should render with 50 confetti elements", () => {
    render(Confetti)

    expect(document.querySelectorAll(".confetti").length).toBe(50)
  })

  it("If amount is given render that amount of confetti elements", () => {
    const amount = 42
    render(Confetti, { amount: amount })

    expect(document.querySelectorAll(".confetti").length).toBe(amount)
  })

  it("If rounded prop is given wrapper element has rounded class", () => {
    render(Confetti, { rounded: true })

    expect(document.querySelector(".rounded")).toBeTruthy()
  })

  it("If cone prop is given wrapper element has rounded class", () => {
    render(Confetti, { cone: true })

    expect(document.querySelector(".cone")).toBeTruthy()
  })
})
