import { Result, Success, Failure } from "amonad"

type Keys = string

type Value = {
  [P in Keys]: any
}

export type Potential<T> = {
  [P in keyof T]: any
}

type Schema<T> = {
  [P in keyof T]: (value: any) => Result<T[P], string>
}

export const num = (value: any): Result<number, string> => typeof value === "number" ?
  Success(value)
  :
  Failure("Value is not number")

export const str = (value: any): Result<string, string> => typeof value === "string" ?
  Success(value)
  :
  Failure("Value is not string")

export const bool = (value: any): Result<boolean, string> => typeof value === "boolean" ?
  Success(value)
  :
  Failure("Value is not boolean")

export const obj = (value: any): Result<object, string> => typeof value === "object" ?
  Success(value)
  :
  Failure("Value is not obj")

export const maybeValidate = <T extends Value>(parser: Schema<T>) => (value: any) =>
  Result<T, string>(() =>
    Object
      .keys(parser)
      .reduce(
        (obj, key) => {
          obj[key] = parser[key](value[key])
            .bind(
              undefined,
              errMsg => `Key ${key} is not validated due to: ${errMsg}`
            )
            .getOrThrow()
          return obj
        },
        {} as any
      ) as T
  )

export const tryToValidate = <T extends Value>(parser: Schema<T>) => (value: any) =>
  maybeValidate(parser)(value).bind(undefined, errMsg => new Error(errMsg)).getOrThrow()