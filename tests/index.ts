import { expect } from 'chai'
import { Success, Failure } from 'amonad'
import { maybeValidate, num, str, bool } from '../src/index'

describe("maybe", () => {
  describe("Correct", () => {
    it("Single property", () => {
      expect(
        maybeValidate({
          value: num
        })({
          value: 2
        })
      ).eql(
        Success({ value: 2 })
      )
    })

    it("Multiple property", () => {
      expect(
        maybeValidate({
          value1: num,
          value2: str
        })({
          value1: 12,
          value2: "ok"
        })
      ).eql(
        Success({ value1: 12, value2: "ok" })
      )
    })

    it("Nested", () => {
      const custom = maybeValidate({ value2: bool })
      expect(
        maybeValidate({
          value1: custom
        })({
          value1: { value2: true }
        })
      ).eql(Success({
        value1: { value2: true }
      }))
    }
    )
  })

  describe("Incorrect", () => {
    it("Single property", () => {
      expect(
        maybeValidate({
          value: num
        })({
          value: "ok"
        })
      ).eql(
        Failure("Key value is not validated due to: Value is not number")
      )
    })

    it("Multiple property", () => {
      expect(
        maybeValidate({
          value1: num,
          value2: str
        })({
          value1: 12,
          value2: true
        })
      ).eql(
        Failure("Key value2 is not validated due to: Value is not string")
      )
    })

    it("Nested", () => {
      const custom = maybeValidate({ value2: bool })
      expect(
        maybeValidate({
          value1: custom
        })({
          value1: { value2: 10 }
        })
      ).eql(
        Failure("Key value1 is not validated due to: Key value2 is not validated due to: Value is not boolean")
      )
    })
  })
})