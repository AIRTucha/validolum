import { Result, Success, Failure } from "amonad"

/**
 * Definition for an arbitrary object
 */
type Value = {
  [P in keyof any]: any
}

/**
 * Validation schema
 */
type Schema<I, O = I> = {
  [P in (keyof I & keyof O)]: (value: I[P]) => Result<O[P], string>
}

/**
 * Represent an object which might be partially defined, so that some of its types are not available
 * The main difference with Partial is the fact that it is also applicable to nested objects.
 */
type Possible<T> = {
  [P in keyof T]?: Possible<T[P]>
}

/**
 * Represents an object which has only properties which exists in both of provided types
 */
type Intersection<O, I> = {
  [P in (keyof O & keyof I)]: O[P]
}

/**
 * @param value Potential number
 * @returns Success of number or Failure which contains description of the error
 */
export const num = (value?: number): Result<number, string> => typeof value === "number" ?
  Success(value)
  :
  Failure("Value is not number")

/**
 * @param value String potentially containing floating number
 * @returns Success of float or Failure which contains description of the error
 */
export const float = (value: string): Result<number, string> => {
  const result = Number.parseFloat(value)
  return Number.isNaN(result) ? Failure("Value is not float") : Success(result)
}

/**
 * @param value String potentially containing integer number
 * @returns Success of integer or Failure which contains description of the error
 */
export const int = (value: string): Result<number, string> => {
  const result = Number.parseInt(value)
  return Number.isNaN(result) ? Failure("Value is not integer") : Success(result)
}

/**
 * @param value Potential string
 * @returns Success of string or Failure which contains description of the error
 */
export const str = (value?: string): Result<string, string> => typeof value === "string" ?
  Success(value)
  :
  Failure("Value is not string")

/**
 * @param value Potential boolean or string potentially containing floating number
 * @returns Success of boolean or Failure which contains description of the error
 */
export const bool = (value?: boolean | string): Result<boolean, string> => typeof value === "boolean" ?
  Success(value)
  :
  value === "true" ?
    Success(true)
    :
    value === "false" ?
      Success(false)
      :
      Failure("Value is not boolean")

/**
 * @param value Potential object
 * @returns Success of object or Failure which contains description of the error
 */
export const obj = (value?: object): Result<object, string> => typeof value === "object" ?
  Success(value)
  :
  Failure("Value is not obj")

/**
 * @param parser Object which describes the way properties has to be parsed or verified
 * @param value Value for parsing and verification
 * @returns Successfully parsed object or Failure with description of parsing error
 */
export function maybeVerify<O extends Value, I extends Value = Possible<O>>(
  parser: Schema<I, O>,
  value: I
): Result<Intersection<O, I>, string>

/**
 * @param parser Object which describes the way properties has to be parsed or verified
 * @curring
 * @param value Value for parsing and verification
 * @returns Successfully parsed object or Failure with description of parsing error
 */
export function maybeVerify<O extends Value, I extends Value = Possible<O>>(
  parser: Schema<I, O>
): (value?: I) => Result<Intersection<O, I>, string>

export function maybeVerify<O extends Value, I extends Value = Possible<O>>(parser: Schema<I, O>, value?: I) {
  const keys = Object.keys(parser)
  const body = (value?: I): Result<Intersection<O, I>, string> =>
    value ?
      Result(() =>
        keys
          .reduce(
            (obj, key) => {
              obj[key] = parser[key](value[key])
                .then(
                  undefined,
                  errMsg => `Key ${key} is not validated due to: ${errMsg}`
                )
                .getOrThrow()
              return obj
            },
            {} as any
          )
      )
      :
      Failure("Object is undefined")
  return value ? body(value) : body
}

/**
 * @param parser Object which describes the way properties has to be parsed or verified
 * @param value Value for parsing and verification
 * @returns The product of parsing. It might throw an exception if parsing was to successful
 */
export const verify = <O extends Value, I extends Value = Possible<O>>(parser: Schema<I, O>, value: I) =>
  maybeVerify(parser, value)
    .then(
      undefined,
      errMsg => new Error(errMsg)
    )
    .getOrThrow()