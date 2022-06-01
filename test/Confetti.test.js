import "jsdom-global/register"
import { render } from "@testing-library/svelte"
import Confetti from '../src/Confetti.svelte'

test("Default Confetti should render with 50 confetti elements", () => {
  render(Confetti)

  expect(document.querySelectorAll(".confetti").length).toBe(50)
})

test("If amount is given render that amount of confetti elements", () => {
  const amount = 42
  render(Confetti, { amount: amount })

  expect(document.querySelectorAll(".confetti").length).toBe(amount)
})

test("If rounded prop is given wrapper element has rounded class", () => {
  render(Confetti, { rounded: true })

  expect(document.querySelector(".rounded")).toBeTruthy()
})

test("If cone prop is given wrapper element has rounded class", () => {
  render(Confetti, { cone: true })

  expect(document.querySelector(".cone")).toBeTruthy()
})
